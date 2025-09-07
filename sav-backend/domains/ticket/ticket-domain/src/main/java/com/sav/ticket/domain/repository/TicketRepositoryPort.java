package com.sav.ticket.domain.repository;

import com.sav.common.enums.Priority;
import com.sav.common.enums.Team;
import com.sav.common.enums.TicketStatus;
import com.sav.ticket.domain.entity.Ticket;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface TicketRepositoryPort {

    // Basic CRUD operations
    Ticket save(Ticket ticket);
    Optional<Ticket> findById(Long id);
    List<Ticket> findAll();
    Page<Ticket> findAll(Pageable pageable);
    void deleteById(Long id);
    boolean existsById(Long id);
    long count();
    List<Ticket> findByCreatedByUserId(String userId);

    // Ticket-specific queries
    Optional<Ticket> findByIdWithMessages(Long id);
    Page<Ticket> findByCreatedByUserId(String userId, Pageable pageable);

    List<Ticket> findByAssignedUserId(String userId);

    // Status-based queries
    Page<Ticket> findByStatus(TicketStatus status, Pageable pageable);
    List<Ticket> findByStatus(TicketStatus status);
    long countByStatus(TicketStatus status);

    // Priority-based queries
    List<Ticket> findByPriority(Priority priority);
    long countByPriority(Priority priority);

    // Team-based queries
    List<Ticket> findByAssignedTeam(Team team);
    long countByAssignedTeam(Team team);

    // Complex queries for reporting/dashboard
    List<Ticket> findByStatusAndPriority(TicketStatus status, Priority priority);
    List<Ticket> findByAssignedUserIdAndStatus(String userId, TicketStatus status);
    List<Ticket> findByCreatedByUserIdAndStatus(String userId, TicketStatus status);

    // Date-based queries (if you want to add them later)
    // List<Ticket> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
    // List<Ticket> findByUpdatedAtBetween(LocalDateTime start, LocalDateTime end);
}