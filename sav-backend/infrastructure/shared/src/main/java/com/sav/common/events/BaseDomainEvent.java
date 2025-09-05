package com.sav.common.events;

import java.time.Instant;
import java.util.UUID;

public abstract class BaseDomainEvent {
    private final String eventId;
    private final Instant occurredAt;

    protected BaseDomainEvent() {
        this.eventId = UUID.randomUUID().toString();
        this.occurredAt = Instant.now();
    }

    public String getEventId() {
        return eventId;
    }

    public Instant getOccurredAt() {
        return occurredAt;
    }

    public abstract String getAggregateId();
    public abstract String getEventType();
}
