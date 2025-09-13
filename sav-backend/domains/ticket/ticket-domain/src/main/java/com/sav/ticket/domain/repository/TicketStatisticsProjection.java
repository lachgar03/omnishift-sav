package com.sav.ticket.domain.repository;

/**
 * Projection interface for ticket statistics to optimize database queries
 */
public interface TicketStatisticsProjection {
    
    // Total counts
    long getTotalTickets();
    long getOpenTickets();
    long getAssignedTickets();
    long getInProgressTickets();
    long getResolvedTickets();
    long getClosedTickets();
    long getReopenedTickets();
    
    // Priority counts
    long getLowPriorityTickets();
    long getMediumPriorityTickets();
    long getHighPriorityTickets();
    long getCriticalPriorityTickets();
    
    // Team counts
    long getSupportTeamTickets();
    long getDevelopmentTeamTickets();
    long getUnassignedTickets();
    
    // Recent activity (last 24 hours)
    long getTicketsCreatedToday();
    long getTicketsResolvedToday();
    long getTicketsClosedToday();
}
