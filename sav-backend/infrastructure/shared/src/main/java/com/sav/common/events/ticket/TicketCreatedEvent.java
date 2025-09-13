package com.sav.common.events.ticket;

import com.sav.common.enums.Priority;
import com.sav.common.enums.TicketType;
import com.sav.common.events.BaseDomainEvent;
import lombok.Getter;

@Getter
public class TicketCreatedEvent extends BaseDomainEvent {
    private final Long ticketId;
    private final String title;
    private final String description;
    private final TicketType type;
    private final Priority priority;
    private final String createdBy;

    public TicketCreatedEvent(Long ticketId, String title, String description,
                              TicketType type, Priority priority, String createdBy) {
        super();
        this.ticketId = ticketId;
        this.title = title;
        this.description = description;
        this.type = type;
        this.priority = priority;
        this.createdBy = createdBy;
    }

    @Override
    public String getAggregateId() {
        return ticketId.toString();
    }

    @Override
    public String getEventType() {
        return "TicketCreated";
    }
}