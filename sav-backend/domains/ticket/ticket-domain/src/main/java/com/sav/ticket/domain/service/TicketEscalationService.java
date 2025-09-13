package com.sav.ticket.domain.service;

import com.sav.common.enums.Priority;
import com.sav.common.enums.TicketStatus;
import com.sav.ticket.domain.entity.Ticket;
import com.sav.ticket.domain.repository.TicketRepositoryPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Service for handling ticket escalation based on priority and time
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class TicketEscalationService {

    private final TicketRepositoryPort ticketRepository;
    private final TicketAssignmentService ticketAssignmentService;

    // Escalation time thresholds in hours
    private static final int ESCALATION_HOURS_CRITICAL = 4;
    private static final int ESCALATION_HOURS_HIGH = 24;
    private static final int ESCALATION_HOURS_MEDIUM = 48;
    private static final int ESCALATION_HOURS_LOW = 72;

    /**
     * Check for tickets that need escalation
     * Runs every hour
     */
    @Scheduled(fixedRate = 3600000) // 1 hour in milliseconds
    @Async
    public void checkForEscalations() {
        log.info("Checking for ticket escalations...");
        
        try {
            // Get all open and assigned tickets
            List<Ticket> openTickets = ticketRepository.findByStatus(TicketStatus.OPEN);
            List<Ticket> assignedTickets = ticketRepository.findByStatus(TicketStatus.ASSIGNED);
            
            // Check each ticket for escalation
            checkTicketsForEscalation(openTickets);
            checkTicketsForEscalation(assignedTickets);
            
            log.info("Escalation check completed");
        } catch (Exception e) {
            log.error("Error during escalation check", e);
        }
    }

    /**
     * Check if a specific ticket needs escalation
     */
    public boolean needsEscalation(Ticket ticket) {
        if (ticket == null || ticket.getCreatedAt() == null) {
            return false;
        }

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime createdAt = ticket.getCreatedAt();
        long hoursSinceCreation = java.time.Duration.between(createdAt, now).toHours();

        return switch (ticket.getPriority()) {
            case CRITICAL -> hoursSinceCreation >= ESCALATION_HOURS_CRITICAL;
            case HIGH -> hoursSinceCreation >= ESCALATION_HOURS_HIGH;
            case MEDIUM -> hoursSinceCreation >= ESCALATION_HOURS_MEDIUM;
            case LOW -> hoursSinceCreation >= ESCALATION_HOURS_LOW;
        };
    }

    /**
     * Escalate a ticket
     */
    @Transactional
    public void escalateTicket(Ticket ticket) {
        if (ticket == null || !needsEscalation(ticket)) {
            return;
        }

        log.warn("Escalating ticket {} with priority {} - created {} hours ago", 
                ticket.getId(), ticket.getPriority(), 
                java.time.Duration.between(ticket.getCreatedAt(), LocalDateTime.now()).toHours());

        // Try to auto-assign to available technician
        try {
            // Get available technicians and assign to the first one
            var availableUsers = ticketAssignmentService.getAvailableUsersForAssignment();
            if (!availableUsers.isEmpty()) {
                ticketAssignmentService.assignTicketToUser(ticket.getId(), availableUsers.get(0).getId());
            }
        } catch (Exception e) {
            log.error("Failed to auto-assign escalated ticket {}", ticket.getId(), e);
        }

        // Publish escalation event
        // eventPublisher.publishEvent(new TicketEscalatedEvent(ticket.getId(), ticket.getPriority()));
        
        // Update ticket with escalation flag or metadata
        // This could be added to the Ticket entity if needed
    }

    /**
     * Get escalation time for a priority
     */
    public int getEscalationHours(Priority priority) {
        return switch (priority) {
            case CRITICAL -> ESCALATION_HOURS_CRITICAL;
            case HIGH -> ESCALATION_HOURS_HIGH;
            case MEDIUM -> ESCALATION_HOURS_MEDIUM;
            case LOW -> ESCALATION_HOURS_LOW;
        };
    }

    /**
     * Check if ticket is approaching escalation
     */
    public boolean isApproachingEscalation(Ticket ticket) {
        if (ticket == null || ticket.getCreatedAt() == null) {
            return false;
        }

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime createdAt = ticket.getCreatedAt();
        long hoursSinceCreation = java.time.Duration.between(createdAt, now).toHours();
        int escalationHours = getEscalationHours(ticket.getPriority());

        // Consider approaching if within 1 hour of escalation
        return hoursSinceCreation >= (escalationHours - 1) && hoursSinceCreation < escalationHours;
    }

    private void checkTicketsForEscalation(List<Ticket> tickets) {
        for (Ticket ticket : tickets) {
            if (needsEscalation(ticket)) {
                escalateTicket(ticket);
            }
        }
    }
}
