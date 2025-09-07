package com.sav.app.events.handlers;

import com.sav.common.events.ticket.TicketCreatedEvent;
import com.sav.common.events.ticket.TicketStatusChangedEvent;
import com.sav.common.events.user.UserCreatedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@RequiredArgsConstructor
public class MetricsEventHandler {

    @EventListener
    public void handleTicketCreated(TicketCreatedEvent event) {
        // TODO: Integrate with Micrometer when monitoring module is added
        log.debug(" Recording ticket creation metrics: Priority={}, Type={}",
                event.getPriority(), event.getType());
    }

    @EventListener
    public void handleTicketStatusChanged(TicketStatusChangedEvent event) {
        // Calculate resolution time for closed tickets
        if (event.getNewStatus().name().equals("CLOSED")) {
            log.debug(" Recording ticket resolution metrics for: {}", event.getTicketId());

            // TODO: Calculate and record resolution time
            // - Query ticket creation time
            // - Calculate duration
            // - Record metric by priority/type
        }
    }

    @EventListener
    public void handleUserCreated(UserCreatedEvent event) {
        log.debug(" Recording user creation metrics: Role={}", event.getRole());

        // TODO: Update user statistics
        // - Increment total user count
        // - Update role distribution
    }
}