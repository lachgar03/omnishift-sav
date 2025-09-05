package com.sav.common.events.ticket;

import com.sav.common.events.BaseDomainEvent;
import lombok.Getter;

@Getter
public class TicketAssignedEvent extends BaseDomainEvent {
    private final Long ticketId;
    private final String assignedTo;
    private final String assignedBy;

    public TicketAssignedEvent(Long ticketId, String assignedTo, String assignedBy) {
        super();
        this.ticketId = ticketId;
        this.assignedTo = assignedTo;
        this.assignedBy = assignedBy;
    }

    @Override
    public String getAggregateId() {
        return ticketId.toString();
    }

    @Override
    public String getEventType() {
        return "TicketAssigned";
    }
}
