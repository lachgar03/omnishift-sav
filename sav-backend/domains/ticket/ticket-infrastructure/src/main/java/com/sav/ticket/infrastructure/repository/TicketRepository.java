package com.sav.ticket.infrastructure.repository;

import com.sav.common.enums.Priority;
import com.sav.common.enums.Team;
import com.sav.common.enums.TicketStatus;
import com.sav.ticket.domain.entity.Ticket;
import com.sav.ticket.domain.repository.TicketStatisticsProjection;
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
public interface TicketRepository extends JpaRepository<Ticket, Long>, TicketRepositoryPort {

    // Basic queries
    List<Ticket> findByCreatedByUserId(String userId);
    Page<Ticket> findByCreatedByUserId(String userId, Pageable pageable);
    List<Ticket> findByAssignedUserId(String userId);
    Page<Ticket> findByAssignedUserIdOrCreatedByUserId(String assignedUserId, String createdByUserId, Pageable pageable);
    List<Ticket> findByTitle(String title);

    // Status-based queries
    Page<Ticket> findByStatus(TicketStatus status, Pageable pageable);
    List<Ticket> findByStatus(TicketStatus status);
    long countByStatus(TicketStatus status);
    long countByAssignedUserId(String userId);
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
    
    // Performance-optimized statistics query
    @Query(value = """
        SELECT 
            COUNT(*) as totalTickets,
            SUM(CASE WHEN status = 'OPEN' THEN 1 ELSE 0 END) as openTickets,
            SUM(CASE WHEN status = 'ASSIGNED' THEN 1 ELSE 0 END) as assignedTickets,
            SUM(CASE WHEN status = 'IN_PROGRESS' THEN 1 ELSE 0 END) as inProgressTickets,
            SUM(CASE WHEN status = 'RESOLVED' THEN 1 ELSE 0 END) as resolvedTickets,
            SUM(CASE WHEN status = 'CLOSED' THEN 1 ELSE 0 END) as closedTickets,
            SUM(CASE WHEN status = 'REOPENED' THEN 1 ELSE 0 END) as reopenedTickets,
            SUM(CASE WHEN priority = 'LOW' THEN 1 ELSE 0 END) as lowPriorityTickets,
            SUM(CASE WHEN priority = 'MEDIUM' THEN 1 ELSE 0 END) as mediumPriorityTickets,
            SUM(CASE WHEN priority = 'HIGH' THEN 1 ELSE 0 END) as highPriorityTickets,
            SUM(CASE WHEN priority = 'CRITICAL' THEN 1 ELSE 0 END) as criticalPriorityTickets,
            SUM(CASE WHEN assigned_team = 'SUPPORT' THEN 1 ELSE 0 END) as supportTeamTickets,
            SUM(CASE WHEN assigned_team = 'DEVELOPMENT' THEN 1 ELSE 0 END) as developmentTeamTickets,
            SUM(CASE WHEN assigned_team IS NULL AND assigned_user_id IS NULL THEN 1 ELSE 0 END) as unassignedTickets,
            SUM(CASE WHEN DATE(created_at) = CURDATE() THEN 1 ELSE 0 END) as ticketsCreatedToday,
            SUM(CASE WHEN status = 'RESOLVED' AND DATE(updated_at) = CURDATE() THEN 1 ELSE 0 END) as ticketsResolvedToday,
            SUM(CASE WHEN status = 'CLOSED' AND DATE(updated_at) = CURDATE() THEN 1 ELSE 0 END) as ticketsClosedToday
        FROM tickets
        """, nativeQuery = true)
    TicketStatisticsProjection getTicketStatistics();
}