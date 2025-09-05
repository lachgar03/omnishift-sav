package com.sav.ticket.api.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class DashboardResponse {
    private long myTicketsCount;
    private long assignedToMeCount;
    private long myOpenTickets;
    private long myInProgressTickets;
    private List<TicketResponse> recentTickets;

    // For admin/technician dashboard
    private TicketStatsResponse globalStats;
    private List<TicketResponse> urgentTickets;
    private List<TicketResponse> unassignedTickets;
}