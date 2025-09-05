
package com.sav.ticket.api.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TicketStatsResponse {
    private long totalTickets;
    private long openTickets;
    private long inProgressTickets;
    private long assignedTickets;
    private long closedTickets;

    // Calculated fields for frontend convenience
    public long getActiveTickets() {
        return openTickets + inProgressTickets + assignedTickets;
    }

    public double getCompletionRate() {
        if (totalTickets == 0) return 0.0;
        return (double) closedTickets / totalTickets * 100;
    }
}
