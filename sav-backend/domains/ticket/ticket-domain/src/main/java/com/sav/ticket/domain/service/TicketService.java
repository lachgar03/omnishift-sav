package com.sav.ticket.domain.service;

import com.sav.common.enums.Priority;
import com.sav.common.enums.Team;
import com.sav.common.enums.TicketStatus;
import com.sav.common.enums.TicketType;
import com.sav.common.events.ticket.TicketAssignedEvent;
import com.sav.common.events.ticket.TicketCreatedEvent;
import com.sav.common.events.ticket.TicketStatusChangedEvent;
import com.sav.ticket.domain.entity.Ticket;
import com.sav.ticket.domain.repository.TicketRepositoryPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class TicketService {

    private final TicketRepositoryPort ticketRepository;
    private final ApplicationEventPublisher eventPublisher;


    @Transactional
    public Ticket createTicket(String title, String description, TicketType type,
                               Priority priority, String createdByUserId) {
        log.info("Creating new ticket: {} for user: {}", title, createdByUserId);

        if (title == null || title.trim().isEmpty()) {
            throw new IllegalArgumentException("Ticket title cannot be empty");
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

        eventPublisher.publishEvent(new TicketCreatedEvent(
                savedTicket.getId(),
                savedTicket.getTitle(),
                savedTicket.getDescription(),
                savedTicket.getType(),
                savedTicket.getPriority(),
                createdByUserId
        ));

        return savedTicket;
    }


    @Transactional
    public Optional<Ticket> updateTicket(Long ticketId, String title, String description,
                                         TicketStatus status, Priority priority,
                                         Team assignedTeam, String assignedUserId) {
        log.info("Updating ticket ID: {}", ticketId);

        if (ticketId == null) {
            throw new IllegalArgumentException("Ticket ID cannot be null");
        }

        return ticketRepository.findById(ticketId)
                .map(ticket -> {
                    TicketStatus oldStatus = ticket.getStatus();
                    boolean statusChanged = false;

                    if (title != null && !title.trim().isEmpty()) {
                        ticket.setTitle(title.trim());
                    }
                    if (description != null) {
                        ticket.setDescription(description.trim());
                    }

                    if (status != null && !status.equals(oldStatus)) {
                        if (isValidStatusTransition(oldStatus, status)) {
                            ticket.setStatus(status);
                            statusChanged = true;
                            log.info("Status changed from {} to {} for ticket {}", oldStatus, status, ticketId);
                        } else {
                            log.warn("Invalid status transition from {} to {} for ticket {}", oldStatus, status, ticketId);
                            throw new IllegalStateException("Invalid status transition from " + oldStatus + " to " + status);
                        }
                    }

                    if (priority != null) {
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

                    if (statusChanged) {
                        eventPublisher.publishEvent(new TicketStatusChangedEvent(
                                ticketId,
                                oldStatus,
                                status,
                                getCurrentUser()
                        ));
                    }

                    log.info("Successfully updated ticket ID: {}", ticketId);
                    return updatedTicket;
                });
    }


    @Transactional
    public Optional<Ticket> updateMyTicket(Long ticketId, String title, String description) {
        log.info("Updating user ticket ID: {} - title and description only", ticketId);

        if (ticketId == null) {
            throw new IllegalArgumentException("Ticket ID cannot be null");
        }

        return ticketRepository.findById(ticketId)
                .map(ticket -> {
                    boolean hasChanges = false;

                    if (title != null && !title.trim().isEmpty()) {
                        String newTitle = title.trim();
                        if (!newTitle.equals(ticket.getTitle())) {
                            ticket.setTitle(newTitle);
                            hasChanges = true;
                        }
                    }

                    if (description != null) {
                        String newDescription = description.trim();
                        if (!newDescription.equals(ticket.getDescription())) {
                            ticket.setDescription(newDescription);
                            hasChanges = true;
                        }
                    }

                    if (hasChanges) {
                        Ticket updatedTicket = ticketRepository.save(ticket);
                        log.info("Updated user ticket ID: {} successfully", ticketId);
                        return updatedTicket;
                    } else {
                        log.info("No changes detected for user ticket ID: {}", ticketId);
                        return ticket;
                    }
                });
    }


    @Transactional
    public Optional<Ticket> assignTicketToTeam(Long ticketId, Team team) {
        log.info("Assigning ticket {} to team: {}", ticketId, team);

        if (ticketId == null) {
            throw new IllegalArgumentException("Ticket ID cannot be null");
        }
        if (team == null) {
            throw new IllegalArgumentException("Team cannot be null");
        }

        return ticketRepository.findById(ticketId)
                .map(ticket -> {
                    TicketStatus oldStatus = ticket.getStatus();

                    ticket.setAssignedTeam(team);

                    // Only change status to ASSIGNED if it's currently OPEN
                    if (ticket.getStatus() == TicketStatus.OPEN) {
                        ticket.setStatus(TicketStatus.ASSIGNED);
                    }

                    Ticket updatedTicket = ticketRepository.save(ticket);

                    eventPublisher.publishEvent(new TicketAssignedEvent(
                            ticketId,
                            team.toString(),
                            getCurrentUser()
                    ));

                    if (ticket.getStatus() != oldStatus) {
                        eventPublisher.publishEvent(new TicketStatusChangedEvent(
                                ticketId,
                                oldStatus,
                                ticket.getStatus(),
                                getCurrentUser()
                        ));
                    }

                    log.info("Successfully assigned ticket {} to team {}", ticketId, team);
                    return updatedTicket;
                });
    }


    @Transactional
    public Optional<Ticket> assignTicketToUser(Long ticketId, String userId) {
        log.info("Assigning ticket {} to user: {}", ticketId, userId);

        if (ticketId == null) {
            throw new IllegalArgumentException("Ticket ID cannot be null");
        }
        if (userId == null || userId.trim().isEmpty()) {
            throw new IllegalArgumentException("User ID cannot be null or empty");
        }

        return ticketRepository.findById(ticketId)
                .map(ticket -> {
                    TicketStatus oldStatus = ticket.getStatus();
                    String trimmedUserId = userId.trim();

                    validateTicketAssignment(ticket, trimmedUserId);
                    ticket.setAssignedUserId(trimmedUserId);

                    ticket.setStatus(TicketStatus.IN_PROGRESS);

                    Ticket updatedTicket = ticketRepository.save(ticket);

                    eventPublisher.publishEvent(new TicketAssignedEvent(
                            ticketId,
                            trimmedUserId,
                            getCurrentUser()
                    ));

                    if (ticket.getStatus() != oldStatus) {
                        eventPublisher.publishEvent(new TicketStatusChangedEvent(
                                ticketId,
                                oldStatus,
                                ticket.getStatus(),
                                getCurrentUser()
                        ));
                    }

                    log.info("Successfully assigned ticket {} to user {}", ticketId, trimmedUserId);
                    return updatedTicket;
                });
    }


    @Transactional
    public Optional<Ticket> closeTicket(Long ticketId) {
        log.info("Closing ticket: {}", ticketId);

        if (ticketId == null) {
            throw new IllegalArgumentException("Ticket ID cannot be null");
        }

        return ticketRepository.findById(ticketId)
                .map(ticket -> {
                    TicketStatus oldStatus = ticket.getStatus();

                    if (oldStatus == TicketStatus.CLOSED) {
                        log.warn("Ticket {} is already closed", ticketId);
                        return ticket; // Already closed, no change needed
                    }

                    ticket.setStatus(TicketStatus.CLOSED);
                    Ticket updatedTicket = ticketRepository.save(ticket);

                    eventPublisher.publishEvent(new TicketStatusChangedEvent(
                            ticketId,
                            oldStatus,
                            TicketStatus.CLOSED,
                            getCurrentUser()
                    ));

                    log.info("Successfully closed ticket: {}", ticketId);
                    return updatedTicket;
                });
    }


    @Transactional
    public Optional<Ticket> reopenTicket(Long ticketId) {
        log.info("Reopening ticket: {}", ticketId);

        if (ticketId == null) {
            throw new IllegalArgumentException("Ticket ID cannot be null");
        }

        return ticketRepository.findById(ticketId)
                .map(ticket -> {
                    TicketStatus oldStatus = ticket.getStatus();

                    if (oldStatus != TicketStatus.CLOSED) {
                        log.warn("Cannot reopen ticket {} - current status is {}", ticketId, oldStatus);
                        throw new IllegalStateException("Can only reopen CLOSED tickets");
                    }

                    ticket.setStatus(TicketStatus.REOPENED);
                    Ticket updatedTicket = ticketRepository.save(ticket);

                    eventPublisher.publishEvent(new TicketStatusChangedEvent(
                            ticketId,
                            oldStatus,
                            TicketStatus.REOPENED,
                            getCurrentUser()
                    ));

                    log.info("Successfully reopened ticket: {}", ticketId);
                    return updatedTicket;
                });
    }


    public Optional<Ticket> getTicketById(Long ticketId) {
        if (ticketId == null) {
            return Optional.empty();
        }
        return ticketRepository.findById(ticketId);
    }


    public Optional<Ticket> getTicketWithMessages(Long ticketId) {
        if (ticketId == null) {
            return Optional.empty();
        }
        return ticketRepository.findByIdWithMessages(ticketId);
    }


    public Page<Ticket> getAllTickets(Pageable pageable) {
        return ticketRepository.findAll(pageable);
    }


    public List<Ticket> getTicketsByUser(String userId) {
        if (userId == null || userId.trim().isEmpty()) {
            return List.of();
        }
        return ticketRepository.findByCreatedByUserId(userId.trim());
    }


    public Page<Ticket> getTicketsByUser(String userId, Pageable pageable) {
        if (userId == null || userId.trim().isEmpty()) {
            return Page.empty();
        }
        return ticketRepository.findByCreatedByUserId(userId.trim(), pageable);
    }


    public List<Ticket> getTicketsAssignedToUser(String userId) {
        if (userId == null || userId.trim().isEmpty()) {
            return List.of();
        }
        return ticketRepository.findByAssignedUserId(userId.trim());
    }


    public Page<Ticket> getTicketsByStatus(TicketStatus status, Pageable pageable) {
        if (status == null) {
            return Page.empty();
        }
        return ticketRepository.findByStatus(status, pageable);
    }


    public long getTicketCountByStatus(TicketStatus status) {
        if (status == null) {
            return 0;
        }
        return ticketRepository.countByStatus(status);
    }


    public List<Ticket> getTicketsByPriority(Priority priority) {
        if (priority == null) {
            return List.of();
        }
        return ticketRepository.findByPriority(priority);
    }


    public List<Ticket> getTicketsByTeam(Team team) {
        if (team == null) {
            return List.of();
        }
        return ticketRepository.findByAssignedTeam(team);
    }


    public TicketStats getTicketStatistics() {
        long totalTickets = ticketRepository.count();
        long openTickets = getTicketCountByStatus(TicketStatus.OPEN);
        long inProgressTickets = getTicketCountByStatus(TicketStatus.IN_PROGRESS);
        long closedTickets = getTicketCountByStatus(TicketStatus.CLOSED);
        long assignedTickets = getTicketCountByStatus(TicketStatus.ASSIGNED);
        long resolvedTickets = getTicketCountByStatus(TicketStatus.RESOLVED);
        long reopenedTickets = getTicketCountByStatus(TicketStatus.REOPENED);

        log.info("Retrieved ticket statistics: total={}, open={}, inProgress={}, closed={}",
                totalTickets, openTickets, inProgressTickets, closedTickets);

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


    private void validateTicketAssignment(Ticket ticket, String assignedUserId) {
        if (assignedUserId != null && !assignedUserId.trim().isEmpty()) {
            // In a real implementation, you'd validate:
            // 1. User exists and is active
            // 2. User has TECHNICIAN or ADMIN role
            // 3. User is not overloaded with tickets
            // 4. User belongs to the correct team for this ticket type

            log.info("Validating assignment of ticket {} to user {}", ticket.getId(), assignedUserId);

            // Placeholder validation - in production, implement actual checks
            if (assignedUserId.length() < 3) {
                throw new IllegalArgumentException("Invalid user ID format");
            }
        }
    }


    private boolean isValidStatusTransition(TicketStatus from, TicketStatus to) {
        if (from == null || to == null) {
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


    private String getCurrentUser() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.isAuthenticated()) {
                return authentication.getName();
            }
        } catch (Exception e) {
            log.warn("Could not extract current user from security context: {}", e.getMessage());
        }

        return "system";
    }


    public boolean canUserUpdateTicket(String userId, Long ticketId) {
        if (userId == null || userId.trim().isEmpty() || ticketId == null) {
            return false;
        }

        return getTicketById(ticketId)
                .map(ticket -> ticket.getCreatedByUserId().equals(userId.trim()))
                .orElse(false);
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
}