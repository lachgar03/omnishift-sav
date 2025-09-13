package com.sav.ticket.domain.service;

import com.sav.common.enums.UserRole;
import com.sav.ticket.domain.entity.Ticket;
import com.sav.ticket.domain.repository.TicketRepositoryPort;
import com.sav.user.domain.entity.User;
import com.sav.user.domain.service.UserService;
import com.sav.security.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * Security service for ticket-related operations
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TicketSecurityService {

    private final UserService userService;
    private final TicketRepositoryPort ticketRepository;

    /**
     * Check if current user can modify a specific ticket
     */
    public boolean canModifyTicket(Long ticketId, String userId) {
        try {
            if (ticketId == null || userId == null || userId.trim().isEmpty()) {
                return false;
            }

            // Get current user
            String currentUserId = SecurityUtil.getCurrentUserId();
            User currentUser = userService.getUserById(currentUserId).orElse(null);
            if (currentUser == null) {
                return false;
            }

            // Get ticket
            Ticket ticket = getTicketById(ticketId);
            if (ticket == null) {
                return false;
            }

            // Admins can modify any ticket
            if (currentUser.getRole() == UserRole.ADMIN) {
                return true;
            }

            // Technicians can modify assigned tickets
            if (currentUser.getRole() == UserRole.TECHNICIAN && 
                currentUserId.equals(ticket.getAssignedUserId())) {
                return true;
            }

            // Users can modify their own created tickets
            return currentUserId.equals(ticket.getCreatedByUserId());

        } catch (Exception e) {
            log.warn("Error checking ticket modification permissions: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Check if current user can view a specific ticket
     */
    public boolean canViewTicket(Long ticketId, String userId) {
        try {
            if (ticketId == null || userId == null || userId.trim().isEmpty()) {
                return false;
            }

            // Get current user
            String currentUserId = SecurityUtil.getCurrentUserId();
            User currentUser = userService.getUserById(currentUserId).orElse(null);
            if (currentUser == null) {
                return false;
            }

            // Get ticket
            Ticket ticket = getTicketById(ticketId);
            if (ticket == null) {
                return false;
            }

            // Admins can view any ticket
            if (currentUser.getRole() == UserRole.ADMIN) {
                return true;
            }

            // Technicians can view assigned tickets or tickets they created
            if (currentUser.getRole() == UserRole.TECHNICIAN) {
                return currentUserId.equals(ticket.getAssignedUserId()) || 
                       currentUserId.equals(ticket.getCreatedByUserId());
            }

            // Users can only view tickets they created
            return currentUserId.equals(ticket.getCreatedByUserId());

        } catch (Exception e) {
            log.warn("Error checking ticket view permissions: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Check if current user can assign tickets
     */
    public boolean canAssignTickets() {
        try {
            String currentUserId = SecurityUtil.getCurrentUserId();
            User currentUser = userService.getUserById(currentUserId).orElse(null);
            if (currentUser == null) {
                return false;
            }

            return currentUser.getRole() == UserRole.ADMIN || 
                   currentUser.getRole() == UserRole.TECHNICIAN;

        } catch (Exception e) {
            log.warn("Error checking ticket assignment permissions: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Check if current user can change ticket status
     */
    public boolean canChangeTicketStatus(Long ticketId, String newStatus) {
        try {
            if (ticketId == null || newStatus == null) {
                return false;
            }

            String currentUserId = SecurityUtil.getCurrentUserId();
            User currentUser = userService.getUserById(currentUserId).orElse(null);
            if (currentUser == null) {
                return false;
            }

            Ticket ticket = getTicketById(ticketId);
            if (ticket == null) {
                return false;
            }

            // Admins can change any status
            if (currentUser.getRole() == UserRole.ADMIN) {
                return true;
            }

            // Technicians can change status of assigned tickets
            if (currentUser.getRole() == UserRole.TECHNICIAN && 
                currentUserId.equals(ticket.getAssignedUserId())) {
                return true;
            }

            // Users can only close their own tickets
            if (currentUser.getRole() == UserRole.USER && 
                currentUserId.equals(ticket.getCreatedByUserId()) &&
                "CLOSED".equals(newStatus)) {
                return true;
            }

            return false;

        } catch (Exception e) {
            log.warn("Error checking status change permissions: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Validate ticket access for current user
     */
    public void validateTicketAccess(Long ticketId) {
        if (!canViewTicket(ticketId, SecurityUtil.getCurrentUserId())) {
            throw new SecurityException("Access denied to ticket: " + ticketId);
        }
    }

    /**
     * Validate ticket modification for current user
     */
    public void validateTicketModification(Long ticketId) {
        if (!canModifyTicket(ticketId, SecurityUtil.getCurrentUserId())) {
            throw new SecurityException("Modification denied for ticket: " + ticketId);
        }
    }

    /**
     * Validate ticket assignment for current user
     */
    public void validateTicketAssignment() {
        if (!canAssignTickets()) {
            throw new SecurityException("Ticket assignment denied for current user");
        }
    }

    /**
     * Helper method to get ticket by ID
     */
    private Ticket getTicketById(Long ticketId) {
        return ticketRepository.findById(ticketId).orElse(null);
    }
}
