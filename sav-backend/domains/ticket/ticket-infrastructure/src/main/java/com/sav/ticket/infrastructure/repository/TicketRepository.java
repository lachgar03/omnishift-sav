package com.sav.ticket.infrastructure.repository;

import com.sav.common.enums.Priority;
import com.sav.common.enums.Team;
import com.sav.common.enums.TicketStatus;
import com.sav.ticket.domain.entity.Ticket;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.sav.ticket.domain.repository.TicketRepositoryPort;

import java.util.List;
import java.util.Optional;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> , TicketRepositoryPort {

    // Basic queries
    List<Ticket> findByCreatedByUserId(String userId);
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

    // Complex queries
    List<Ticket> findByStatusAndPriority(TicketStatus status, Priority priority);
    List<Ticket> findByAssignedUserIdAndStatus(String userId, TicketStatus status);
    List<Ticket> findByCreatedByUserIdAndStatus(String userId, TicketStatus status);

    // Custom query for tickets with messages
    @Query("SELECT t FROM Ticket t LEFT JOIN FETCH t.messages WHERE t.id = :id")
    Optional<Ticket> findByIdWithMessages(@Param("id") Long id);

    // Additional useful queries
    @Query("SELECT t FROM Ticket t WHERE t.assignedUserId IS NULL")
    List<Ticket> findUnassignedTickets();

    @Query("SELECT t FROM Ticket t WHERE t.priority = 'CRITICAL' AND t.status != 'CLOSED'")
    List<Ticket> findCriticalOpenTickets();
}
