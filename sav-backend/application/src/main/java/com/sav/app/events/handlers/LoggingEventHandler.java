package com.sav.app.events.handlers;

import com.sav.common.events.ticket.TicketCreatedEvent;
import com.sav.common.events.ticket.TicketAssignedEvent;
import com.sav.common.events.ticket.TicketStatusChangedEvent;
import com.sav.common.events.user.UserCreatedEvent;
import com.sav.common.events.user.UserRoleChangedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@RequiredArgsConstructor
public class LoggingEventHandler {

    @EventListener
    public void handleTicketCreated(TicketCreatedEvent event) {
        log.info(" TICKET CREATED: ID={}, Title='{}', Priority={}, CreatedBy={}",
                event.getTicketId(), event.getTitle(), event.getPriority(), event.getCreatedBy());
    }

    @EventListener
    public void handleTicketAssigned(TicketAssignedEvent event) {
        log.info("📋 TICKET ASSIGNED: ID={}, AssignedTo={}, AssignedBy={}",
                event.getTicketId(), event.getAssignedTo(), event.getAssignedBy());
    }

    @EventListener
    public void handleTicketStatusChanged(TicketStatusChangedEvent event) {
        log.info(" TICKET STATUS CHANGED: ID={}, {} → {}, ChangedBy={}",
                event.getTicketId(), event.getOldStatus(), event.getNewStatus(), event.getChangedBy());
    }

    @EventListener
    public void handleUserCreated(UserCreatedEvent event) {
        log.info(" USER CREATED: ID={}, Username={}, Role={}",
                event.getUserId(), event.getUsername(), event.getRole());
    }

    @EventListener
    public void handleUserRoleChanged(UserRoleChangedEvent event) {
        log.info(" USER ROLE CHANGED: ID={}, {} → {}, ChangedBy={}",
                event.getUserId(), event.getOldRole(), event.getNewRole(), event.getChangedBy());
    }
}