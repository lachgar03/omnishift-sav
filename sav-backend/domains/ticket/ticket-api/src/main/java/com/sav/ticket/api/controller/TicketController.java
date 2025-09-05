package com.sav.ticket.api.controller;

import com.sav.common.enums.Priority;
import com.sav.common.enums.Team;
import com.sav.ticket.api.dto.*;
import com.sav.ticket.api.mapper.TicketMapper;
import com.sav.security.util.AuthUtil;
import com.sav.ticket.domain.entity.Ticket;
import com.sav.ticket.domain.service.TicketService;
import com.sav.common.enums.TicketStatus;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tickets")
@RequiredArgsConstructor
@Slf4j
public class TicketController {

    private final TicketService ticketService;
    private final TicketMapper ticketMapper;

    /**
     * Create a new ticket
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('USER', 'TECHNICIAN', 'ADMIN')")
    public ResponseEntity<TicketResponse> createTicket(
            @Valid @RequestBody CreateTicketRequest request,
            Authentication authentication) {

        // Extract user ID from JWT token
        String userId = AuthUtil.extractUserIdFromAuth(authentication);

        log.info("Creating ticket: {} for user: {}", request.getTitle(), userId);

        Ticket ticket = ticketService.createTicket(
                request.getTitle(),
                request.getDescription(),
                request.getType(),
                request.getPriority(),
                userId
        );

        TicketResponse response = ticketMapper.toResponse(ticket);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Get all tickets with pagination
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('TECHNICIAN', 'ADMIN')")
    public ResponseEntity<Page<TicketResponse>> getAllTickets(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size,
            @RequestParam(name = "sortBy", defaultValue = "createdAt") String sortBy,
            @RequestParam(name = "sortDir", defaultValue = "desc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Ticket> tickets = ticketService.getAllTickets(pageable);
        Page<TicketResponse> response = tickets.map(ticketMapper::toResponse);

        return ResponseEntity.ok(response);
    }

    /**
     * Get ticket by ID
     */
    @GetMapping("/{ticketId}")
    @PreAuthorize("hasAnyRole('USER', 'TECHNICIAN', 'ADMIN')")
    public ResponseEntity<TicketResponse> getTicketById(@PathVariable(name = "ticketId") Long ticketId) {
        return ticketService.getTicketWithMessages(ticketId)
                .map(ticket -> ResponseEntity.ok(ticketMapper.toResponse(ticket)))
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Update ticket
     */
    @PutMapping("/{ticketId}")
    @PreAuthorize("hasAnyRole('TECHNICIAN', 'ADMIN')")
    public ResponseEntity<TicketResponse> updateTicket(
            @PathVariable(name = "ticketId") Long ticketId,
            @Valid @RequestBody UpdateTicketRequest request) {

        return ticketService.updateTicket(
                        ticketId,
                        request.getTitle(),
                        request.getDescription(),
                        request.getStatus(),
                        request.getPriority(),
                        request.getAssignedTeam(),
                        request.getAssignedUserId()
                )
                .map(ticket -> ResponseEntity.ok(ticketMapper.toResponse(ticket)))
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Assign ticket to team - ADMIN only
     */
    @PatchMapping("/{ticketId}/assign-team")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TicketResponse> assignToTeam(
            @PathVariable(name = "ticketId") Long ticketId,
            @RequestBody AssignTeamRequest request) {

        return ticketService.assignTicketToTeam(ticketId, request.getTeam())
                .map(ticket -> ResponseEntity.ok(ticketMapper.toResponse(ticket)))
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Assign ticket to user - ADMIN only
     */
    @PatchMapping("/{ticketId}/assign-user")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TicketResponse> assignToUser(
            @PathVariable(name = "ticketId") Long ticketId,
            @RequestBody AssignUserRequest request) {

        return ticketService.assignTicketToUser(ticketId, request.getUserId())
                .map(ticket -> ResponseEntity.ok(ticketMapper.toResponse(ticket)))
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Close ticket - Complex business logic
     */
    @PatchMapping("/{ticketId}/close")
    @PreAuthorize("hasAnyRole('TECHNICIAN', 'ADMIN')")
    public ResponseEntity<TicketResponse> closeTicket(
            @PathVariable(name = "ticketId") Long ticketId) {
        return ticketService.closeTicket(ticketId)
                .map(ticket -> ResponseEntity.ok(ticketMapper.toResponse(ticket)))
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get tickets by user
     */
    @GetMapping("/my-tickets")
    @PreAuthorize("hasAnyRole('USER', 'TECHNICIAN', 'ADMIN')")
    public ResponseEntity<List<TicketResponse>> getMyTickets(Authentication authentication) {

        String userId = AuthUtil.extractUserIdFromAuth(authentication);
        if (userId == null) {
            return ResponseEntity.badRequest().build();
        }

        List<Ticket> tickets = ticketService.getTicketsByUser(userId);
        List<TicketResponse> response = tickets.stream()
                .map(ticketMapper::toResponse)
                .toList();

        return ResponseEntity.ok(response);
    }

    /**
     * Get tickets assigned to user
     */
    @GetMapping("/assigned-to-me")
    @PreAuthorize("hasAnyRole('TECHNICIAN', 'ADMIN')")
    public ResponseEntity<List<TicketResponse>> getTicketsAssignedToMe(Authentication authentication) {

        String userId = AuthUtil.extractUserIdFromAuth(authentication);
        if (userId == null) {
            return ResponseEntity.badRequest().build();
        }

        List<Ticket> tickets = ticketService.getTicketsAssignedToUser(userId);
        List<TicketResponse> response = tickets.stream()
                .map(ticketMapper::toResponse)
                .toList();

        return ResponseEntity.ok(response);
    }

    /**
     * Get tickets by status
     */
    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('TECHNICIAN', 'ADMIN')")
    public ResponseEntity<Page<TicketResponse>> getTicketsByStatus(
            @PathVariable(name = "status") TicketStatus status,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Ticket> tickets = ticketService.getTicketsByStatus(status, pageable);
        Page<TicketResponse> response = tickets.map(ticketMapper::toResponse);

        return ResponseEntity.ok(response);
    }

    /**
     * Get ticket statistics for dashboard
     */
    @GetMapping("/statistics")
    @PreAuthorize("hasAnyRole('TECHNICIAN', 'ADMIN')")
    public ResponseEntity<TicketStatsResponse> getTicketStatistics() {
        TicketService.TicketStats stats = ticketService.getTicketStatistics();

        TicketStatsResponse response = TicketStatsResponse.builder()
                .totalTickets(stats.totalTickets())
                .openTickets(stats.openTickets())
                .inProgressTickets(stats.inProgressTickets())
                .assignedTickets(stats.assignedTickets())
                .closedTickets(stats.closedTickets())
                .build();

        return ResponseEntity.ok(response);
    }

    /**
     * Reopen a closed ticket
     */
    @PatchMapping("/{ticketId}/reopen")
    @PreAuthorize("hasAnyRole('TECHNICIAN', 'ADMIN')")
    public ResponseEntity<TicketResponse> reopenTicket(
            @PathVariable(name = "ticketId") Long ticketId) {
        return ticketService.reopenTicket(ticketId)
                .map(ticket -> ResponseEntity.ok(ticketMapper.toResponse(ticket)))
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get tickets by priority
     */
    @GetMapping("/priority/{priority}")
    @PreAuthorize("hasAnyRole('TECHNICIAN', 'ADMIN')")
    public ResponseEntity<List<TicketResponse>> getTicketsByPriority(
            @PathVariable(name = "priority") Priority priority) {
        List<Ticket> tickets = ticketService.getTicketsByPriority(priority);
        List<TicketResponse> response = tickets.stream()
                .map(ticketMapper::toResponse)
                .toList();
        return ResponseEntity.ok(response);
    }

    /**
     * Get tickets by team
     */
    @GetMapping("/team/{team}")
    @PreAuthorize("hasAnyRole('TECHNICIAN', 'ADMIN')")
    public ResponseEntity<List<TicketResponse>> getTicketsByTeam(
            @PathVariable(name = "team") Team team) {
        List<Ticket> tickets = ticketService.getTicketsByTeam(team);
        List<TicketResponse> response = tickets.stream()
                .map(ticketMapper::toResponse)
                .toList();
        return ResponseEntity.ok(response);
    }

    /**
     * Get dashboard summary for current user
     */
    @GetMapping("/dashboard")
    @PreAuthorize("hasAnyRole('USER', 'TECHNICIAN', 'ADMIN')")
    public ResponseEntity<DashboardResponse> getDashboardSummary(Authentication authentication) {
        String userId = AuthUtil.extractUserIdFromAuth(authentication);
        if (userId == null) {
            return ResponseEntity.badRequest().build();
        }

        // Get user's tickets
        List<Ticket> myTickets = ticketService.getTicketsByUser(userId);
        List<Ticket> assignedToMe = ticketService.getTicketsAssignedToUser(userId);

        // Build dashboard response
        DashboardResponse response = DashboardResponse.builder()
                .myTicketsCount(myTickets.size())
                .assignedToMeCount(assignedToMe.size())
                .myOpenTickets(myTickets.stream()
                        .filter(t -> t.getStatus() == TicketStatus.OPEN)
                        .count())
                .myInProgressTickets(myTickets.stream()
                        .filter(t -> t.getStatus() == TicketStatus.IN_PROGRESS)
                        .count())
                .recentTickets(myTickets.stream()
                        .limit(5)
                        .map(ticketMapper::toResponse)
                        .toList())
                .build();

        return ResponseEntity.ok(response);
    }
}