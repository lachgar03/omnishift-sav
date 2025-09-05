package com.sav.common.events.ticket;

import com.sav.common.enums.TicketStatus;
import com.sav.common.events.BaseDomainEvent;
import lombok.Getter;

@Getter
public class TicketStatusChangedEvent extends BaseDomainEvent {
    private final Long ticketId;
    private final TicketStatus oldStatus;
    private final TicketStatus newStatus;
    private final String changedBy;

    public TicketStatusChangedEvent(Long ticketId, TicketStatus oldStatus,
                                    TicketStatus newStatus, String changedBy) {
        super();
        this.ticketId = ticketId;
        this.oldStatus = oldStatus;
        this.newStatus = newStatus;
        this.changedBy = changedBy;
    }

    @Override
    public String getAggregateId() {
        return ticketId.toString();
    }

    @Override
    public String getEventType() {
        return "TicketStatusChanged";
    }
}

