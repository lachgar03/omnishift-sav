package com.sav.ticket.domain.service;

import com.sav.common.enums.Priority;
import com.sav.common.enums.Team;
import com.sav.common.enums.TicketStatus;
import com.sav.common.enums.TicketType;
import com.sav.common.enums.UserRole;
import com.sav.common.enums.UserStatus;
import com.sav.common.events.ticket.TicketAssignedEvent;
import com.sav.common.events.ticket.TicketCreatedEvent;
// import com.sav.common.events.ticket.TicketEscalatedEvent;
import com.sav.common.events.ticket.TicketStatusChangedEvent;
import com.sav.ticket.domain.entity.Ticket;
import com.sav.ticket.domain.repository.TicketRepositoryPort;
import com.sav.ticket.domain.repository.TicketStatisticsProjection;
import com.sav.user.domain.entity.User;
import com.sav.user.domain.service.UserService;
import com.sav.common.service.MetricsServicePort;
import com.sav.security.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.locks.ReentrantLock;

/**
 * Ticket Service with comprehensive business logic, security, and performance optimizations
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class TicketService {

    private final TicketRepositoryPort ticketRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final UserService userService;
    private final MetricsServicePort metricsService;
    private final TicketEscalationService ticketEscalationService;
    
    // Thread-safe locks for critical operations
    private final ReentrantLock assignmentLock = new ReentrantLock();
    private final ReentrantLock statusChangeLock = new ReentrantLock();

    // Configuration constants
    private static final int MAX_WORKLOAD_THRESHOLD = 10;

    /**
     * Create a new ticket with enhanced validation and business rules
     */
    @Transactional
    public Ticket createTicket(String title, String description, TicketType type,
                               Priority priority, String createdByUserId) {
        log.info("Creating new ticket: {} for user: {}", title, createdByUserId);

        // Enhanced input validation
        validateCreateTicketInput(title, description, type, priority, createdByUserId);

        // Validate creator exists and is active
        User creator = userService.getUserById(createdByUserId.trim())
                .orElseThrow(() -> new IllegalArgumentException("Creator user with ID " + createdByUserId + " not found"));

        if (creator.getStatus() != UserStatus.ACTIVE) {
            throw new IllegalArgumentException("Creator user " + createdByUserId + " is not active (status: " + creator.getStatus() + ")");
        }

        // Apply business rules for priority and type combinations
        validatePriorityTypeCombination(priority, type);

        Ticket ticket = Ticket.builder()
                .title(title.trim())
                .description(description != null ? description.trim() : "")
                .type(type)
                .priority(priority)
                .status(TicketStatus.OPEN)
                .createdByUserId(createdByUserId.trim())
                .build();

        Ticket savedTicket = ticketRepository.save(ticket);
        log.info("Created ticket with ID: {}", savedTicket.getId());

        // Publish event
        eventPublisher.publishEvent(new TicketCreatedEvent(
                savedTicket.getId(),
                savedTicket.getTitle(),
                savedTicket.getDescription(),
                savedTicket.getType(),
                savedTicket.getPriority(),
                createdByUserId
        ));

        // Track metrics
        metricsService.incrementTicketCreated(priority.name(), type.name());

        // Auto-assign if business rules allow
        autoAssignTicketIfApplicable(savedTicket);

        return savedTicket;
    }

    /**
     * Update ticket with enhanced permission validation and business rules
     */
    @Transactional
    public Optional<Ticket> updateTicket(Long ticketId, String title, String description,
                                         TicketStatus status, Priority priority,
                                         Team assignedTeam, String assignedUserId, String currentUserId) {
        log.info("Updating ticket ID: {} by user: {}", ticketId, currentUserId);

        if (ticketId == null) {
            throw new IllegalArgumentException("Ticket ID cannot be null");
        }

        return ticketRepository.findById(ticketId)
                .map(ticket -> {
                    // Enhanced permission validation
                    if (!canUserModifyTicket(currentUserId, ticket)) {
                        throw new SecurityException("User " + currentUserId + " is not authorized to modify ticket " + ticketId);
                    }

                    TicketStatus oldStatus = ticket.getStatus();
                    boolean statusChanged = false;

                    // Update fields with validation
                    if (title != null && !title.trim().isEmpty()) {
                        validateTitle(title);
                        ticket.setTitle(title.trim());
                    }
                    
                    if (description != null) {
                        validateDescription(description);
                        ticket.setDescription(description.trim());
                    }

                    // Enhanced status transition validation
                    if (status != null && !status.equals(oldStatus)) {
                        if (isValidStatusTransition(oldStatus, status, currentUserId, ticket)) {
                            ticket.setStatus(status);
                            statusChanged = true;
                            log.info("Status changed from {} to {} for ticket {} by user {}", 
                                    oldStatus, status, ticketId, currentUserId);
                        } else {
                            log.warn("Invalid status transition from {} to {} for ticket {} by user {}", 
                                    oldStatus, status, ticketId, currentUserId);
                            throw new IllegalStateException("Invalid status transition from " + oldStatus + " to " + status);
                        }
                    }

                    if (priority != null) {
                        validatePriorityTypeCombination(priority, ticket.getType());
                        ticket.setPriority(priority);
                    }
                    
                    if (assignedTeam != null) {
                        ticket.setAssignedTeam(assignedTeam);
                    }
                    
                    if (assignedUserId != null && !assignedUserId.trim().isEmpty()) {
                        validateTicketAssignment(ticket, assignedUserId.trim());
                        ticket.setAssignedUserId(assignedUserId.trim());
                    }

                    Ticket updatedTicket = ticketRepository.save(ticket);

                    // Publish events
                    if (statusChanged) {
                        eventPublisher.publishEvent(new TicketStatusChangedEvent(
                                ticketId,
                                oldStatus,
                                status,
                                currentUserId
                        ));
                    }

                    // Check for escalation
                    checkAndEscalateTicket(updatedTicket);

                    log.info("Successfully updated ticket ID: {} by user: {}", ticketId, currentUserId);
                    return updatedTicket;
                });
    }

    /**
     * Enhanced ticket assignment with workload balancing
     */
    @Transactional
    public Optional<Ticket> assignTicketToUser(Long ticketId, String userId, String assignedBy) {
        log.info("Assigning ticket {} to user: {} by: {}", ticketId, userId, assignedBy);

        assignmentLock.lock();
        try {
            if (ticketId == null) {
                throw new IllegalArgumentException("Ticket ID cannot be null");
            }
            if (userId == null || userId.trim().isEmpty()) {
                throw new IllegalArgumentException("User ID cannot be null or empty");
            }

            return ticketRepository.findById(ticketId)
                    .map(ticket -> {
                        // Validate assignment permissions
                        if (!canUserAssignTickets(assignedBy)) {
                            throw new SecurityException("User " + assignedBy + " is not authorized to assign tickets");
                        }

                        TicketStatus oldStatus = ticket.getStatus();
                        String trimmedUserId = userId.trim();

                        // Enhanced assignment validation
                        validateTicketAssignment(ticket, trimmedUserId);
                        
                        // Check workload before assignment
                        if (isUserOverloaded(trimmedUserId)) {
                            log.warn("User {} is overloaded, but assignment proceeding", trimmedUserId);
                        }

                        ticket.setAssignedUserId(trimmedUserId);
                        ticket.setStatus(TicketStatus.IN_PROGRESS);

                        Ticket updatedTicket = ticketRepository.save(ticket);

                        // Publish events
                        eventPublisher.publishEvent(new TicketAssignedEvent(
                                ticketId,
                                trimmedUserId,
                                assignedBy
                        ));

                        if (ticket.getStatus() != oldStatus) {
                            eventPublisher.publishEvent(new TicketStatusChangedEvent(
                                    ticketId,
                                    oldStatus,
                                    ticket.getStatus(),
                                    assignedBy
                            ));
                        }

                        // Track metrics
                        metricsService.incrementTicketAssigned(trimmedUserId, assignedBy);
                        if (ticket.getStatus() != oldStatus) {
                            metricsService.incrementTicketStatusChanged(oldStatus.name(), ticket.getStatus().name(), assignedBy);
                        }

                        log.info("Successfully assigned ticket {} to user {} by {}", ticketId, trimmedUserId, assignedBy);
                        return updatedTicket;
                    });
        } finally {
            assignmentLock.unlock();
        }
    }

    /**
     * Enhanced ticket closure with validation
     */
    @Transactional
    public Optional<Ticket> closeTicket(Long ticketId, String closedBy) {
        log.info("Closing ticket: {} by user: {}", ticketId, closedBy);

        statusChangeLock.lock();
        try {
            if (ticketId == null) {
                throw new IllegalArgumentException("Ticket ID cannot be null");
            }

            return ticketRepository.findById(ticketId)
                    .map(ticket -> {
                        // Validate closure permissions
                        if (!canUserCloseTicket(closedBy, ticket)) {
                            throw new SecurityException("User " + closedBy + " is not authorized to close ticket " + ticketId);
                        }

                        TicketStatus oldStatus = ticket.getStatus();

                        if (oldStatus == TicketStatus.CLOSED) {
                            log.warn("Ticket {} is already closed", ticketId);
                            return ticket;
                        }

                        // Validate ticket can be closed
                        if (!isValidClosureStatus(oldStatus)) {
                            throw new IllegalStateException("Cannot close ticket in status: " + oldStatus);
                        }

                        ticket.setStatus(TicketStatus.CLOSED);
                        Ticket updatedTicket = ticketRepository.save(ticket);

                        // Publish event
                        eventPublisher.publishEvent(new TicketStatusChangedEvent(
                                ticketId,
                                oldStatus,
                                TicketStatus.CLOSED,
                                closedBy
                        ));

                        log.info("Successfully closed ticket: {} by user: {}", ticketId, closedBy);
                        return updatedTicket;
                    });
        } finally {
            statusChangeLock.unlock();
        }
    }

    /**
     * Enhanced ticket reopening with validation
     */
    @Transactional
    public Optional<Ticket> reopenTicket(Long ticketId, String reopenedBy) {
        log.info("Reopening ticket: {} by user: {}", ticketId, reopenedBy);

        statusChangeLock.lock();
        try {
            if (ticketId == null) {
                throw new IllegalArgumentException("Ticket ID cannot be null");
            }

            return ticketRepository.findById(ticketId)
                    .map(ticket -> {
                        // Validate reopening permissions
                        if (!canUserReopenTicket(reopenedBy, ticket)) {
                            throw new SecurityException("User " + reopenedBy + " is not authorized to reopen ticket " + ticketId);
                        }

                        TicketStatus oldStatus = ticket.getStatus();

                        if (oldStatus != TicketStatus.CLOSED) {
                            log.warn("Cannot reopen ticket {} - current status is {}", ticketId, oldStatus);
                            throw new IllegalStateException("Can only reopen CLOSED tickets");
                        }

                        ticket.setStatus(TicketStatus.REOPENED);
                        Ticket updatedTicket = ticketRepository.save(ticket);

                        // Publish event
                        eventPublisher.publishEvent(new TicketStatusChangedEvent(
                                ticketId,
                                oldStatus,
                                TicketStatus.REOPENED,
                                reopenedBy
                        ));

                        log.info("Successfully reopened ticket: {} by user: {}", ticketId, reopenedBy);
                        return updatedTicket;
                    });
        } finally {
            statusChangeLock.unlock();
        }
    }

    /**
     * Get tickets with enhanced filtering and security - FIXED N+1 QUERY ISSUE
     */
    public Page<Ticket> getTicketsForUser(String userId, Pageable pageable) {
        if (userId == null || userId.trim().isEmpty()) {
            return Page.empty();
        }

        User user = userService.getUserById(userId.trim())
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        // Return different ticket sets based on user role - using proper pagination
        return switch (user.getRole()) {
            case ADMIN -> ticketRepository.findAll(pageable);
            case TECHNICIAN -> ticketRepository.findByAssignedUserIdOrCreatedByUserId(userId.trim(), userId.trim(), pageable);
            case USER -> ticketRepository.findByCreatedByUserId(userId.trim(), pageable);
        };
    }

    /**
     * Enhanced ticket statistics with performance optimization - FIXED SQL INJECTION
     */
    public TicketStats getTicketStatistics() {
        try {
            // Use the optimized repository method to prevent SQL injection
            TicketStatisticsProjection stats = ticketRepository.getTicketStatistics();
            
            log.info("Retrieved ticket statistics: total={}, open={}, inProgress={}, closed={}",
                    stats.getTotalTickets(), stats.getOpenTickets(), 
                    stats.getInProgressTickets(), stats.getClosedTickets());

            return new TicketStats(
                    stats.getTotalTickets(),
                    stats.getOpenTickets(),
                    stats.getInProgressTickets(),
                    stats.getAssignedTickets(),
                    stats.getClosedTickets(),
                    stats.getResolvedTickets(),
                    stats.getReopenedTickets()
            );
        } catch (Exception e) {
            log.error("Error retrieving ticket statistics, falling back to individual queries", e);
            // Fallback to individual queries if the projection fails
            long totalTickets = ticketRepository.count();
            long openTickets = ticketRepository.countByStatus(TicketStatus.OPEN);
            long inProgressTickets = ticketRepository.countByStatus(TicketStatus.IN_PROGRESS);
            long closedTickets = ticketRepository.countByStatus(TicketStatus.CLOSED);
            long assignedTickets = ticketRepository.countByStatus(TicketStatus.ASSIGNED);
            long resolvedTickets = ticketRepository.countByStatus(TicketStatus.RESOLVED);
            long reopenedTickets = ticketRepository.countByStatus(TicketStatus.REOPENED);

            return new TicketStats(
                    totalTickets,
                    openTickets,
                    inProgressTickets,
                    assignedTickets,
                    closedTickets,
                    resolvedTickets,
                    reopenedTickets
            );
        }
    }

    // Enhanced validation methods

    private void validateCreateTicketInput(String title, String description, TicketType type, 
                                         Priority priority, String createdByUserId) {
        if (title == null || title.trim().isEmpty()) {
            throw new IllegalArgumentException("Ticket title cannot be empty");
        }
        if (title.trim().length() < 3) {
            throw new IllegalArgumentException("Ticket title must be at least 3 characters long");
        }
        if (title.trim().length() > 255) {
            throw new IllegalArgumentException("Ticket title cannot exceed 255 characters");
        }
        if (type == null) {
            throw new IllegalArgumentException("Ticket type is required");
        }
        if (priority == null) {
            throw new IllegalArgumentException("Ticket priority is required");
        }
        if (createdByUserId == null || createdByUserId.trim().isEmpty()) {
            throw new IllegalArgumentException("Created by user ID is required");
        }
        if (description != null && description.trim().length() > 5000) {
            throw new IllegalArgumentException("Ticket description cannot exceed 5000 characters");
        }
    }

    private void validateTitle(String title) {
        if (title.trim().length() < 3) {
            throw new IllegalArgumentException("Ticket title must be at least 3 characters long");
        }
        if (title.trim().length() > 255) {
            throw new IllegalArgumentException("Ticket title cannot exceed 255 characters");
        }
    }

    private void validateDescription(String description) {
        if (description.trim().length() > 5000) {
            throw new IllegalArgumentException("Ticket description cannot exceed 5000 characters");
        }
    }

    private void validatePriorityTypeCombination(Priority priority, TicketType type) {
        // Business rules for priority and type combinations
        if (priority == Priority.CRITICAL && type == TicketType.FEATURE_REQUEST) {
            throw new IllegalArgumentException("Feature requests cannot be marked as CRITICAL priority");
        }
        if (priority == Priority.LOW && type == TicketType.INCIDENT) {
            throw new IllegalArgumentException("Incidents should not be marked as LOW priority");
        }
    }

    private void validateTicketAssignment(Ticket ticket, String assignedUserId) {
        if (assignedUserId != null && !assignedUserId.trim().isEmpty()) {
            log.info("Validating assignment of ticket {} to user {}", ticket.getId(), assignedUserId);

            // 1. Validate user ID format
            if (assignedUserId.length() < 3) {
                throw new IllegalArgumentException("Invalid user ID format");
            }

            // 2. Check if user exists
            User assignedUser = userService.getUserById(assignedUserId)
                    .orElseThrow(() -> new IllegalArgumentException("User with ID " + assignedUserId + " not found"));

            // 3. Check if user is active
            if (assignedUser.getStatus() != UserStatus.ACTIVE) {
                throw new IllegalArgumentException("User " + assignedUserId + " is not active (status: " + assignedUser.getStatus() + ")");
            }

            // 4. Check if user has appropriate role for ticket assignment
            if (!assignedUser.canAssignTickets()) {
                throw new IllegalArgumentException("User " + assignedUserId + " with role " + assignedUser.getRole() + " cannot be assigned tickets");
            }

            // 5. Check user workload
            long currentTicketCount = ticketRepository.countByAssignedUserId(assignedUserId);
            if (currentTicketCount >= MAX_WORKLOAD_THRESHOLD) {
                log.warn("User {} has {} tickets assigned, approaching workload limit", assignedUserId, currentTicketCount);
            }

            // 6. Validate team assignment if ticket has a specific team requirement
            if (ticket.getAssignedTeam() != null) {
                validateTeamAssignment(ticket.getAssignedTeam(), assignedUser);
            }

            log.info("Successfully validated assignment of ticket {} to user {}", ticket.getId(), assignedUserId);
        }
    }

    private void validateTeamAssignment(Team requiredTeam, User user) {
        if (requiredTeam == Team.SUPPORT && user.getRole() != UserRole.TECHNICIAN) {
            throw new IllegalArgumentException("Only technicians can be assigned to support team tickets");
        }
        if (requiredTeam == Team.DEVELOPMENT && user.getRole() != UserRole.TECHNICIAN && user.getRole() != UserRole.ADMIN) {
            throw new IllegalArgumentException("Only technicians or admins can be assigned to development team tickets");
        }
    }

    private boolean isValidStatusTransition(TicketStatus from, TicketStatus to, String userId, Ticket ticket) {
        if (from == null || to == null) {
            return false;
        }

        // Check if user has permission for this transition
        if (!canUserChangeStatus(userId, from, to, ticket)) {
            return false;
        }

        // Define valid status transitions based on business rules
        return switch (from) {
            case OPEN -> to == TicketStatus.ASSIGNED || to == TicketStatus.IN_PROGRESS || to == TicketStatus.CLOSED;
            case ASSIGNED -> to == TicketStatus.IN_PROGRESS || to == TicketStatus.OPEN || to == TicketStatus.CLOSED;
            case IN_PROGRESS -> to == TicketStatus.RESOLVED || to == TicketStatus.ASSIGNED || to == TicketStatus.CLOSED;
            case RESOLVED -> to == TicketStatus.CLOSED || to == TicketStatus.REOPENED || to == TicketStatus.IN_PROGRESS;
            case CLOSED -> to == TicketStatus.REOPENED;
            case REOPENED -> to == TicketStatus.ASSIGNED || to == TicketStatus.IN_PROGRESS || to == TicketStatus.CLOSED;
        };
    }

    private boolean canUserModifyTicket(String userId, Ticket ticket) {
        if (userId == null || userId.trim().isEmpty()) {
            return false;
        }

        User user = userService.getUserById(userId.trim()).orElse(null);
        if (user == null) {
            return false;
        }

        // Admins can modify any ticket
        if (user.getRole() == UserRole.ADMIN) {
            return true;
        }

        // Technicians can modify assigned tickets
        if (user.getRole() == UserRole.TECHNICIAN && userId.equals(ticket.getAssignedUserId())) {
            return true;
        }

        // Users can modify their own tickets
        return userId.equals(ticket.getCreatedByUserId());
    }

    private boolean canUserAssignTickets(String userId) {
        if (userId == null || userId.trim().isEmpty()) {
            return false;
        }

        User user = userService.getUserById(userId.trim()).orElse(null);
        return user != null && (user.getRole() == UserRole.ADMIN || user.getRole() == UserRole.TECHNICIAN);
    }

    private boolean canUserChangeStatus(String userId, TicketStatus from, TicketStatus to, Ticket ticket) {
        if (userId == null || userId.trim().isEmpty()) {
            return false;
        }

        User user = userService.getUserById(userId.trim()).orElse(null);
        if (user == null) {
            return false;
        }

        // Admins can change any status
        if (user.getRole() == UserRole.ADMIN) {
            return true;
        }

        // Technicians can change status of assigned tickets
        if (user.getRole() == UserRole.TECHNICIAN && userId.equals(ticket.getAssignedUserId())) {
            return true;
        }

        // Users can only change status of their own tickets in limited ways
        if (user.getRole() == UserRole.USER && userId.equals(ticket.getCreatedByUserId())) {
            return from == TicketStatus.OPEN && to == TicketStatus.CLOSED;
        }

        return false;
    }

    private boolean canUserCloseTicket(String userId, Ticket ticket) {
        if (userId == null || userId.trim().isEmpty()) {
            return false;
        }

        User user = userService.getUserById(userId.trim()).orElse(null);
        if (user == null) {
            return false;
        }

        // Admins can close any ticket
        if (user.getRole() == UserRole.ADMIN) {
            return true;
        }

        // Technicians can close assigned tickets
        if (user.getRole() == UserRole.TECHNICIAN && userId.equals(ticket.getAssignedUserId())) {
            return true;
        }

        // Users can close their own tickets
        return userId.equals(ticket.getCreatedByUserId());
    }

    private boolean canUserReopenTicket(String userId, Ticket ticket) {
        if (userId == null || userId.trim().isEmpty()) {
            return false;
        }

        User user = userService.getUserById(userId.trim()).orElse(null);
        if (user == null) {
            return false;
        }

        // Only admins and technicians can reopen tickets
        return user.getRole() == UserRole.ADMIN || user.getRole() == UserRole.TECHNICIAN;
    }

    private boolean isValidClosureStatus(TicketStatus status) {
        return status == TicketStatus.RESOLVED || status == TicketStatus.OPEN || status == TicketStatus.ASSIGNED || status == TicketStatus.IN_PROGRESS;
    }

    private boolean isUserOverloaded(String userId) {
        long currentTicketCount = ticketRepository.countByAssignedUserId(userId);
        return currentTicketCount >= MAX_WORKLOAD_THRESHOLD;
    }

    private void autoAssignTicketIfApplicable(Ticket ticket) {
        // Auto-assign based on business rules
        if (ticket.getType() == TicketType.INCIDENT && ticket.getPriority() == Priority.CRITICAL) {
            // Auto-assign critical incidents to available technicians
            List<User> availableTechnicians = userService.getAvailableTechnicians();
            if (!availableTechnicians.isEmpty()) {
                // Find technician with lowest workload
                User bestTechnician = findBestTechnicianForAssignment(availableTechnicians);
                if (bestTechnician != null) {
                    assignTicketToUser(ticket.getId(), bestTechnician.getId(), "system");
                }
            }
        }
    }

    private User findBestTechnicianForAssignment(List<User> technicians) {
        return technicians.stream()
                .min((t1, t2) -> {
                    long count1 = ticketRepository.countByAssignedUserId(t1.getId());
                    long count2 = ticketRepository.countByAssignedUserId(t2.getId());
                    return Long.compare(count1, count2);
                })
                .orElse(null);
    }

    private void checkAndEscalateTicket(Ticket ticket) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime createdAt = ticket.getCreatedAt();
        long hoursSinceCreation = java.time.Duration.between(createdAt, now).toHours();

        boolean shouldEscalate = ticketEscalationService.needsEscalation(ticket);

        if (shouldEscalate && ticket.getStatus() != TicketStatus.CLOSED && ticket.getStatus() != TicketStatus.RESOLVED) {
            log.warn("Ticket {} should be escalated - created {} hours ago with priority {}", 
                    ticket.getId(), hoursSinceCreation, ticket.getPriority());
            
            // TODO: Implement TicketEscalatedEvent when available
        }
    }


    public record TicketStats(
            long totalTickets,
            long openTickets,
            long inProgressTickets,
            long assignedTickets,
            long closedTickets,
            long resolvedTickets,
            long reopenedTickets
    ) {
        public long getActiveTickets() {
            return openTickets + inProgressTickets + assignedTickets + reopenedTickets;
        }

        public double getCompletionRate() {
            if (totalTickets == 0) return 0.0;
            return (double) closedTickets / totalTickets * 100;
        }

        public double getResolutionRate() {
            if (totalTickets == 0) return 0.0;
            return (double) (closedTickets + resolvedTickets) / totalTickets * 100;
        }
    }

    // Additional methods for API compatibility
    
    /**
     * Get all tickets with pagination
     */
    public Page<Ticket> getAllTickets(Pageable pageable) {
        return ticketRepository.findAll(pageable);
    }

    /**
     * Get tickets by user with pagination
     */
    public Page<Ticket> getTicketsByUser(String userId, Pageable pageable) {
        return ticketRepository.findByCreatedByUserId(userId, pageable);
    }

    /**
     * Get ticket with messages
     */
    public Optional<Ticket> getTicketWithMessages(Long ticketId) {
        return ticketRepository.findByIdWithMessages(ticketId);
    }

    /**
     * Get ticket by ID
     */
    public Optional<Ticket> getTicketById(Long ticketId) {
        return ticketRepository.findById(ticketId);
    }

    /**
     * Get tickets assigned to user
     */
    public List<Ticket> getTicketsAssignedToUser(String userId) {
        return ticketRepository.findByAssignedUserId(userId);
    }

    /**
     * Get tickets by status with pagination
     */
    public Page<Ticket> getTicketsByStatus(TicketStatus status, Pageable pageable) {
        return ticketRepository.findByStatus(status, pageable);
    }

    /**
     * Get tickets by priority
     */
    public List<Ticket> getTicketsByPriority(Priority priority) {
        return ticketRepository.findByPriority(priority);
    }

    /**
     * Get tickets by team
     */
    public List<Ticket> getTicketsByTeam(Team team) {
        return ticketRepository.findByAssignedTeam(team);
    }

    /**
     * Get tickets by user (non-paginated)
     */
    public List<Ticket> getTicketsByUser(String userId) {
        return ticketRepository.findByCreatedByUserId(userId);
    }

    /**
     * Check if user can update ticket
     */
    public boolean canUserUpdateTicket(String userId, Long ticketId) {
        try {
            String currentUserId = SecurityUtil.getCurrentUserId();
            User currentUser = userService.getUserById(currentUserId).orElse(null);
            if (currentUser == null) {
                return false;
            }

            Optional<Ticket> ticketOpt = ticketRepository.findById(ticketId);
            if (ticketOpt.isEmpty()) {
                return false;
            }

            Ticket ticket = ticketOpt.get();

            // Admins can update any ticket
            if (currentUser.getRole() == UserRole.ADMIN) {
                return true;
            }

            // Technicians can update assigned tickets
            if (currentUser.getRole() == UserRole.TECHNICIAN && 
                currentUserId.equals(ticket.getAssignedUserId())) {
                return true;
            }

            // Users can update their own created tickets
            return currentUserId.equals(ticket.getCreatedByUserId());

        } catch (Exception e) {
            log.warn("Error checking ticket update permissions: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Assign ticket to team
     */
    @Transactional
    public Optional<Ticket> assignTicketToTeam(Long ticketId, Team team) {
        try {
            Ticket ticket = ticketRepository.findById(ticketId)
                    .orElseThrow(() -> new IllegalArgumentException("Ticket not found: " + ticketId));

            ticket.setAssignedTeam(team);
            if (ticket.getStatus() == TicketStatus.OPEN) {
                ticket.setStatus(TicketStatus.ASSIGNED);
            }

            Ticket savedTicket = ticketRepository.save(ticket);
            return Optional.of(savedTicket);
        } catch (Exception e) {
            log.error("Error assigning ticket to team", e);
            return Optional.empty();
        }
    }

    /**
     * Assign ticket to user (simplified version)
     */
    @Transactional
    public Optional<Ticket> assignTicketToUser(Long ticketId, String userId) {
        try {
            String currentUserId = SecurityUtil.getCurrentUserId();
            return assignTicketToUser(ticketId, userId, currentUserId);
        } catch (Exception e) {
            log.error("Error assigning ticket to user", e);
            return Optional.empty();
        }
    }

    /**
     * Close ticket (simplified version)
     */
    @Transactional
    public Optional<Ticket> closeTicket(Long ticketId) {
        try {
            String currentUserId = SecurityUtil.getCurrentUserId();
            return closeTicket(ticketId, currentUserId);
        } catch (Exception e) {
            log.error("Error closing ticket", e);
            return Optional.empty();
        }
    }

    /**
     * Reopen ticket (simplified version)
     */
    @Transactional
    public Optional<Ticket> reopenTicket(Long ticketId) {
        try {
            String currentUserId = SecurityUtil.getCurrentUserId();
            return reopenTicket(ticketId, currentUserId);
        } catch (Exception e) {
            log.error("Error reopening ticket", e);
            return Optional.empty();
        }
    }

    /**
     * Update my ticket (simplified version for users)
     */
    @Transactional
    public Optional<Ticket> updateMyTicket(Long ticketId, String title, String description) {
        try {
            String currentUserId = SecurityUtil.getCurrentUserId();
            return updateTicket(ticketId, title, description, null, null, null, null, currentUserId);
        } catch (Exception e) {
            log.error("Error updating my ticket", e);
            return Optional.empty();
        }
    }

    /**
     * Update ticket with minimal parameters (for API compatibility)
     */
    @Transactional
    public Optional<Ticket> updateTicket(Long ticketId, String title, String description, 
                                       TicketStatus status, Priority priority, Team assignedTeam, 
                                       String assignedUserId) {
        try {
            String currentUserId = SecurityUtil.getCurrentUserId();
            return updateTicket(ticketId, title, description, status, priority, assignedTeam, assignedUserId, currentUserId);
        } catch (Exception e) {
            log.error("Error updating ticket", e);
            return Optional.empty();
        }
    }

    /**
     * Update ticket with only title and description (for API compatibility)
     */
    @Transactional
    public Optional<Ticket> updateTicket(Long ticketId, String title, String description) {
        try {
            String currentUserId = SecurityUtil.getCurrentUserId();
            return updateTicket(ticketId, title, description, null, null, null, null, currentUserId);
        } catch (Exception e) {
            log.error("Error updating ticket", e);
            return Optional.empty();
        }
    }
}
