package com.sav.ticket.domain.service;

import com.sav.common.enums.Team;
import com.sav.common.enums.TicketStatus;
import com.sav.common.enums.UserRole;
import com.sav.common.enums.UserStatus;
import com.sav.ticket.domain.entity.Ticket;
import com.sav.ticket.domain.repository.TicketRepositoryPort;
import com.sav.user.domain.entity.User;
import com.sav.user.domain.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;

/**
 * Service for handling ticket assignment with comprehensive business logic
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class TicketAssignmentService {

    private final TicketRepositoryPort ticketRepository;
    private final UserService userService;
    private final TicketSecurityService ticketSecurityService;
    
    private static final int MAX_TICKETS_PER_USER = 10;

    /**
     * Assign ticket to user with comprehensive validation
     */
    @Transactional
    public Ticket assignTicketToUser(Long ticketId, String userId) {
        log.info("Assigning ticket {} to user: {}", ticketId, userId);

        // 1. VALIDATE TICKET EXISTS AND IS ASSIGNABLE
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found: " + ticketId));
        
        if (!isAssignableStatus(ticket.getStatus())) {
            throw new IllegalStateException("Ticket cannot be assigned in status: " + ticket.getStatus());
        }
        
        // 2. VALIDATE USER EXISTS AND HAS PROPER ROLE
        User user = userService.getUserById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));
                
        if (!canUserBeAssignedTickets(user)) {
            throw new IllegalArgumentException("User cannot be assigned tickets");
        }
        
        // 3. CHECK WORKLOAD LIMITS
        if (exceedsWorkloadLimit(userId)) {
            throw new IllegalStateException("User workload limit exceeded");
        }
        
        // 4. VALIDATE ASSIGNMENT PERMISSIONS
        ticketSecurityService.validateTicketAssignment();
        
        // 5. PERFORM ASSIGNMENT WITH AUDIT
        ticket.setAssignedUserId(userId);
        ticket.setStatus(TicketStatus.ASSIGNED);
        
        Ticket savedTicket = ticketRepository.save(ticket);
        
        log.info("Successfully assigned ticket {} to user {}", ticketId, userId);
        return savedTicket;
    }

    /**
     * Assign ticket to team
     */
    @Transactional
    public Ticket assignTicketToTeam(Long ticketId, String team) {
        log.info("Assigning ticket {} to team: {}", ticketId, team);

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found: " + ticketId));
        
        if (!isAssignableStatus(ticket.getStatus())) {
            throw new IllegalStateException("Ticket cannot be assigned in status: " + ticket.getStatus());
        }
        
        ticketSecurityService.validateTicketAssignment();
        
        ticket.setAssignedTeam(Team.valueOf(team));
        if (ticket.getStatus() == TicketStatus.OPEN) {
            ticket.setStatus(TicketStatus.ASSIGNED);
        }
        
        Ticket savedTicket = ticketRepository.save(ticket);
        
        log.info("Successfully assigned ticket {} to team {}", ticketId, team);
        return savedTicket;
    }

    /**
     * Check if ticket status allows assignment
     */
    private boolean isAssignableStatus(TicketStatus status) {
        return status == TicketStatus.OPEN || status == TicketStatus.REOPENED;
    }

    /**
     * Check if user can be assigned tickets
     */
    private boolean canUserBeAssignedTickets(User user) {
        return user.getStatus() == UserStatus.ACTIVE && 
               (user.getRole() == UserRole.TECHNICIAN || user.getRole() == UserRole.ADMIN);
    }

    /**
     * Check if user exceeds workload limit
     */
    private boolean exceedsWorkloadLimit(String userId) {
        List<TicketStatus> activeStatuses = Arrays.asList(
            TicketStatus.ASSIGNED, 
            TicketStatus.IN_PROGRESS
        );
        
        long activeTickets = ticketRepository.countByAssignedUserIdAndStatusIn(userId, activeStatuses);
        return activeTickets >= MAX_TICKETS_PER_USER;
    }

    /**
     * Get available users for assignment
     */
    public List<User> getAvailableUsersForAssignment() {
        return userService.getAvailableTechnicians().stream()
                .filter(user -> !exceedsWorkloadLimit(user.getId()))
                .toList();
    }

    /**
     * Get user workload statistics
     */
    public UserWorkloadStats getUserWorkloadStats(String userId) {
        long assignedTickets = ticketRepository.countByAssignedUserIdAndStatusIn(
            userId, 
            Arrays.asList(TicketStatus.ASSIGNED, TicketStatus.IN_PROGRESS)
        );
        
        long completedTickets = ticketRepository.countByAssignedUserIdAndStatusIn(
            userId, 
            Arrays.asList(TicketStatus.CLOSED, TicketStatus.RESOLVED)
        );
        
        return new UserWorkloadStats(assignedTickets, completedTickets, 0, 0);
    }

    /**
     * Record class for user workload statistics
     */
    public record UserWorkloadStats(
        long assignedTickets,
        long completedTickets,
        long overdueTickets,
        long averageResolutionTime
    ) {
        public double getCompletionRate() {
            if (assignedTickets == 0) return 0.0;
            return (double) completedTickets / assignedTickets * 100;
        }
    }
}
