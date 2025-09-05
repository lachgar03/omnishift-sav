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

    /**
     * Create a new ticket
     */
    @Transactional
    public Ticket createTicket(String title, String description, TicketType type,
                               Priority priority, String createdByUserId) {
        log.info("Creating new ticket: {} for user: {}", title, createdByUserId);

        Ticket ticket = Ticket.builder()
                .title(title)
                .description(description)
                .type(type)
                .priority(priority)
                .status(TicketStatus.OPEN)
                .createdByUserId(createdByUserId)
                .build();

        Ticket savedTicket = ticketRepository.save(ticket);
        log.info("Created ticket with ID: {}", savedTicket.getId());

        // ✅ Publish ticket created event
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

    /**
     * Update an existing ticket
     */
    @Transactional
    public Optional<Ticket> updateTicket(Long ticketId, String title, String description,
                                         TicketStatus status, Priority priority,
                                         Team assignedTeam, String assignedUserId) {
        log.info("Updating ticket ID: {}", ticketId);

        return ticketRepository.findById(ticketId)
                .map(ticket -> {
                    // Track status changes for events
                    TicketStatus oldStatus = ticket.getStatus();
                    boolean statusChanged = false;

                    if (title != null) ticket.setTitle(title);
                    if (description != null) ticket.setDescription(description);

                    if (status != null && !status.equals(oldStatus)) {
                        ticket.setStatus(status);
                        statusChanged = true;
                    }

                    if (priority != null) ticket.setPriority(priority);
                    if (assignedTeam != null) ticket.setAssignedTeam(assignedTeam);
                    if (assignedUserId != null) ticket.setAssignedUserId(assignedUserId);

                    Ticket updatedTicket = ticketRepository.save(ticket);

                    // ✅ Publish status change event if status changed
                    if (statusChanged) {
                        eventPublisher.publishEvent(new TicketStatusChangedEvent(
                                ticketId,
                                oldStatus,
                                status,
                                getCurrentUser() // Will need to implement this
                        ));
                    }

                    return updatedTicket;
                });
    }

    /**
     * Assign ticket to a team
     */
    @Transactional
    public Optional<Ticket> assignTicketToTeam(Long ticketId, Team team) {
        log.info("Assigning ticket {} to team: {}", ticketId, team);

        return ticketRepository.findById(ticketId)
                .map(ticket -> {
                    TicketStatus oldStatus = ticket.getStatus();

                    ticket.setAssignedTeam(team);
                    ticket.setStatus(TicketStatus.ASSIGNED);

                    Ticket updatedTicket = ticketRepository.save(ticket);

                    // ✅ Publish assignment event
                    eventPublisher.publishEvent(new TicketAssignedEvent(
                            ticketId,
                            team.toString(),
                            getCurrentUser()
                    ));

                    // ✅ Publish status change event if status changed
                    if (!TicketStatus.ASSIGNED.equals(oldStatus)) {
                        eventPublisher.publishEvent(new TicketStatusChangedEvent(
                                ticketId,
                                oldStatus,
                                TicketStatus.ASSIGNED,
                                getCurrentUser()
                        ));
                    }

                    return updatedTicket;
                });
    }

    /**
     * Assign ticket to a user
     */
    @Transactional
    public Optional<Ticket> assignTicketToUser(Long ticketId, String userId) {
        log.info("Assigning ticket {} to user: {}", ticketId, userId);

        return ticketRepository.findById(ticketId)
                .map(ticket -> {
                    TicketStatus oldStatus = ticket.getStatus();

                    ticket.setAssignedUserId(userId);
                    ticket.setStatus(TicketStatus.IN_PROGRESS);

                    Ticket updatedTicket = ticketRepository.save(ticket);

                    // ✅ Publish assignment event
                    eventPublisher.publishEvent(new TicketAssignedEvent(
                            ticketId,
                            userId,
                            getCurrentUser()
                    ));

                    // ✅ Publish status change event if status changed
                    if (!TicketStatus.IN_PROGRESS.equals(oldStatus)) {
                        eventPublisher.publishEvent(new TicketStatusChangedEvent(
                                ticketId,
                                oldStatus,
                                TicketStatus.IN_PROGRESS,
                                getCurrentUser()
                        ));
                    }

                    return updatedTicket;
                });
    }

    /**
     * Close a ticket
     */
    @Transactional
    public Optional<Ticket> closeTicket(Long ticketId) {
        log.info("Closing ticket: {}", ticketId);

        return ticketRepository.findById(ticketId)
                .map(ticket -> {
                    TicketStatus oldStatus = ticket.getStatus();
                    ticket.setStatus(TicketStatus.CLOSED);

                    Ticket updatedTicket = ticketRepository.save(ticket);

                    // ✅ Publish status change event
                    eventPublisher.publishEvent(new TicketStatusChangedEvent(
                            ticketId,
                            oldStatus,
                            TicketStatus.CLOSED,
                            getCurrentUser()
                    ));

                    return updatedTicket;
                });
    }

    /**
     * Reopen a ticket
     */
    @Transactional
    public Optional<Ticket> reopenTicket(Long ticketId) {
        log.info("Reopening ticket: {}", ticketId);

        return ticketRepository.findById(ticketId)
                .map(ticket -> {
                    TicketStatus oldStatus = ticket.getStatus();
                    ticket.setStatus(TicketStatus.OPEN);

                    Ticket updatedTicket = ticketRepository.save(ticket);

                    // ✅ Publish status change event
                    eventPublisher.publishEvent(new TicketStatusChangedEvent(
                            ticketId,
                            oldStatus,
                            TicketStatus.OPEN,
                            getCurrentUser()
                    ));

                    return updatedTicket;
                });
    }

    /**
     * Get ticket by ID
     */
    public Optional<Ticket> getTicketById(Long ticketId) {
        return ticketRepository.findById(ticketId);
    }

    /**
     * Get ticket with messages
     */
    public Optional<Ticket> getTicketWithMessages(Long ticketId) {
        return ticketRepository.findByIdWithMessages(ticketId);
    }

    /**
     * Get all tickets with pagination
     */
    public Page<Ticket> getAllTickets(Pageable pageable) {
        return ticketRepository.findAll(pageable);
    }

    /**
     * Get tickets by user
     */
    public List<Ticket> getTicketsByUser(String userId) {
        return ticketRepository.findByCreatedByUserId(userId);
    }

    /**
     * Get tickets assigned to user
     */
    public List<Ticket> getTicketsAssignedToUser(String userId) {
        return ticketRepository.findByAssignedUserId(userId);
    }

    /**
     * Get tickets by status
     */
    public Page<Ticket> getTicketsByStatus(TicketStatus status, Pageable pageable) {
        return ticketRepository.findByStatus(status, pageable);
    }

    /**
     * Get ticket count by status
     */
    public long getTicketCountByStatus(TicketStatus status) {
        return ticketRepository.countByStatus(status);
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
     * Get ticket statistics for dashboard
     */
    public TicketStats getTicketStatistics() {
        long totalTickets = ticketRepository.count();
        long openTickets = getTicketCountByStatus(TicketStatus.OPEN);
        long inProgressTickets = getTicketCountByStatus(TicketStatus.IN_PROGRESS);
        long closedTickets = getTicketCountByStatus(TicketStatus.CLOSED);
        long assignedTickets = getTicketCountByStatus(TicketStatus.ASSIGNED);

        return new TicketStats(
                totalTickets,
                openTickets,
                inProgressTickets,
                assignedTickets,
                closedTickets
        );
    }

    /**
     * Helper method to get current user context
     * TODO: Implement proper user context extraction
     */
    private String getCurrentUser() {
        // For now, return a placeholder
        // In production, you'd extract this from SecurityContext or pass it as parameter
        return "system";
    }

    /**
     * Record class for ticket statistics
     */
    public record TicketStats(
            long totalTickets,
            long openTickets,
            long inProgressTickets,
            long assignedTickets,
            long closedTickets
    ) {}
}