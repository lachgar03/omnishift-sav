package com.sav.app.events.handlers;

import com.sav.common.events.ticket.TicketCreatedEvent;
import com.sav.common.events.ticket.TicketAssignedEvent;
import com.sav.common.events.ticket.TicketStatusChangedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@RequiredArgsConstructor
public class NotificationEventHandler {
    @EventListener
    @Async("eventTaskExecutor")
    public void handleTicketCreated(TicketCreatedEvent event) {
        log.info("📧 Sending notifications for new ticket: {}", event.getTicketId());

        // Simulate notification logic
        try {
            Thread.sleep(100); // Simulate async work

            // TODO: Implement actual notification logic
            // - Send email to admins
            // - Send Slack notification
            // - Update dashboard counters

            log.info("✅ Notifications sent for ticket: {}", event.getTicketId());
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.error(" Notification sending interrupted for ticket: {}", event.getTicketId());
        }
    }

    @EventListener
    @Async("eventTaskExecutor")
    public void handleTicketAssigned(TicketAssignedEvent event) {
        log.info("📬 Notifying assignee for ticket: {} → {}",
                event.getTicketId(), event.getAssignedTo());

        // TODO: Send notification to assignee
        // - Email notification
        // - In-app notification
        // - Mobile push notification
    }

    @EventListener
    @Async("eventTaskExecutor")
    public void handleTicketStatusChanged(TicketStatusChangedEvent event) {
        if (event.getNewStatus().name().equals("CLOSED")) {
            log.info("🎉 Ticket closed, sending completion notifications: {}", event.getTicketId());

            // TODO: Send completion notifications
            // - Notify ticket creator
            // - Send satisfaction survey
            // - Update completion metrics
        }
    }
}