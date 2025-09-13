package com.sav.ticket.domain.service;

import com.sav.common.enums.TicketStatus;
import com.sav.common.enums.UserRole;
import com.sav.ticket.domain.entity.Ticket;
import com.sav.ticket.domain.exception.InvalidTicketStatusTransitionException;
import com.sav.user.domain.entity.User;
import com.sav.user.domain.service.UserService;
import com.sav.security.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.Set;

/**
 * Service for handling ticket status transitions with comprehensive validation
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class TicketStatusService {

    private final UserService userService;

    /**
     * Valid status transitions matrix
     */
    private static final Map<TicketStatus, Set<TicketStatus>> VALID_TRANSITIONS = Map.of(
        TicketStatus.OPEN, Set.of(TicketStatus.ASSIGNED, TicketStatus.CLOSED),
        TicketStatus.ASSIGNED, Set.of(TicketStatus.IN_PROGRESS, TicketStatus.OPEN, TicketStatus.CLOSED),
        TicketStatus.IN_PROGRESS, Set.of(TicketStatus.RESOLVED, TicketStatus.ASSIGNED, TicketStatus.CLOSED),
        TicketStatus.RESOLVED, Set.of(TicketStatus.CLOSED, TicketStatus.REOPENED, TicketStatus.IN_PROGRESS),
        TicketStatus.CLOSED, Set.of(TicketStatus.REOPENED),
        TicketStatus.REOPENED, Set.of(TicketStatus.ASSIGNED, TicketStatus.IN_PROGRESS, TicketStatus.CLOSED)
    );

    /**
     * Check if status transition is valid
     */
    public boolean isValidTransition(TicketStatus from, TicketStatus to) {
        if (from == null || to == null) {
            return false;
        }
        return VALID_TRANSITIONS.getOrDefault(from, Set.of()).contains(to);
    }

    /**
     * Validate status transition with comprehensive checks
     */
    public void validateStatusTransition(Ticket ticket, TicketStatus newStatus, String userId) {
        if (ticket == null || newStatus == null) {
            throw new IllegalArgumentException("Ticket and new status cannot be null");
        }

        // 1. Check if transition is valid
        if (!isValidTransition(ticket.getStatus(), newStatus)) {
            throw new InvalidTicketStatusTransitionException(ticket.getStatus(), newStatus);
        }

        // 2. Check user permissions for status change
        validateUserCanChangeStatus(ticket, newStatus, userId);

        // 3. Check business rules for specific transitions
        validateBusinessRules(ticket, newStatus, userId);
    }

    /**
     * Validate user can change status
     */
    private void validateUserCanChangeStatus(Ticket ticket, TicketStatus newStatus, String userId) {
        try {
            String currentUserId = SecurityUtil.getCurrentUserId();
            User currentUser = userService.getUserById(currentUserId).orElse(null);
            if (currentUser == null) {
                throw new SecurityException("Current user not found");
            }

            // Admins can change any status
            if (currentUser.getRole() == UserRole.ADMIN) {
                return;
            }

            // Technicians can change status of assigned tickets
            if (currentUser.getRole() == UserRole.TECHNICIAN) {
                if (currentUserId.equals(ticket.getAssignedUserId())) {
                    return;
                }
                throw new SecurityException("Technician can only change status of assigned tickets");
            }

            // Users can only close their own tickets
            if (currentUser.getRole() == UserRole.USER) {
                if (currentUserId.equals(ticket.getCreatedByUserId()) && 
                    newStatus == TicketStatus.CLOSED) {
                    return;
                }
                throw new SecurityException("Users can only close their own tickets");
            }

            throw new SecurityException("Insufficient permissions for status change");

        } catch (Exception e) {
            log.warn("Error validating status change permissions: {}", e.getMessage());
            throw new SecurityException("Status change validation failed: " + e.getMessage());
        }
    }

    /**
     * Validate business rules for specific transitions
     */
    private void validateBusinessRules(Ticket ticket, TicketStatus newStatus, String userId) {
        switch (newStatus) {
            case OPEN:
                // OPEN is the initial status, no validation needed
                break;
            case ASSIGNED:
                validateAssignmentTransition(ticket);
                break;
            case IN_PROGRESS:
                validateInProgressTransition(ticket);
                break;
            case RESOLVED:
                validateResolvedTransition(ticket);
                break;
            case CLOSED:
                validateClosedTransition(ticket);
                break;
            case REOPENED:
                validateReopenedTransition(ticket);
                break;
        }
    }

    /**
     * Validate assignment transition
     */
    private void validateAssignmentTransition(Ticket ticket) {
        if (ticket.getAssignedUserId() == null && ticket.getAssignedTeam() == null) {
            throw new IllegalStateException("Ticket must be assigned to user or team before status change");
        }
    }

    /**
     * Validate in-progress transition
     */
    private void validateInProgressTransition(Ticket ticket) {
        if (ticket.getAssignedUserId() == null) {
            throw new IllegalStateException("Ticket must be assigned to user before starting work");
        }
    }

    /**
     * Validate resolved transition
     */
    private void validateResolvedTransition(Ticket ticket) {
        if (ticket.getAssignedUserId() == null) {
            throw new IllegalStateException("Only assigned tickets can be resolved");
        }
    }

    /**
     * Validate closed transition
     */
    private void validateClosedTransition(Ticket ticket) {
        // Any ticket can be closed, but log if not properly resolved
        if (ticket.getStatus() != TicketStatus.RESOLVED) {
            log.warn("Ticket {} closed without being resolved first", ticket.getId());
        }
    }

    /**
     * Validate reopened transition
     */
    private void validateReopenedTransition(Ticket ticket) {
        if (ticket.getStatus() != TicketStatus.CLOSED) {
            throw new IllegalStateException("Only closed tickets can be reopened");
        }
    }

    /**
     * Get valid next statuses for a ticket
     */
    public Set<TicketStatus> getValidNextStatuses(Ticket ticket) {
        if (ticket == null || ticket.getStatus() == null) {
            return Set.of();
        }
        return VALID_TRANSITIONS.getOrDefault(ticket.getStatus(), Set.of());
    }

    /**
     * Check if status change requires assignment
     */
    public boolean requiresAssignment(TicketStatus status) {
        return status == TicketStatus.ASSIGNED || status == TicketStatus.IN_PROGRESS;
    }

    /**
     * Check if status change requires user assignment
     */
    public boolean requiresUserAssignment(TicketStatus status) {
        return status == TicketStatus.IN_PROGRESS || status == TicketStatus.RESOLVED;
    }

    /**
     * Get status transition description
     */
    public String getStatusTransitionDescription(TicketStatus from, TicketStatus to) {
        return String.format("Status changed from %s to %s", from, to);
    }
}
