package com.sav.ticket.api.controller;

import com.sav.ticket.api.dto.CreateTicketMessageRequest;
import com.sav.ticket.api.dto.TicketMessageResponse;
import com.sav.ticket.api.mapper.TicketMapper;
import com.sav.security.util.AuthUtil;
import com.sav.ticket.domain.entity.TicketMessage;
import com.sav.ticket.domain.service.TicketMessageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tickets/{ticketId}/messages")
@RequiredArgsConstructor
@Slf4j
public class TicketMessageController {

    private final TicketMessageService ticketMessageService;
    private final TicketMapper ticketMapper;

    /**
     * Add a message to a ticket
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('USER', 'TECHNICIAN', 'ADMIN')")
    public ResponseEntity<TicketMessageResponse> addMessage(
            @PathVariable(name = "ticketId") Long ticketId,
            @Valid @RequestBody CreateTicketMessageRequest request,
            Authentication authentication) {

        String userId = AuthUtil.extractUserIdFromAuth(authentication);
        if (userId == null) {
            return ResponseEntity.badRequest().build();
        }

        log.info("Adding message to ticket {} by user {}", ticketId, userId);

        return ticketMessageService.addMessageToTicket(ticketId, request.getContent(), userId)
                .map(message -> ResponseEntity.status(HttpStatus.CREATED)
                        .body(ticketMapper.toMessageResponse(message)))
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get all messages for a ticket
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('USER', 'TECHNICIAN', 'ADMIN')")
    public ResponseEntity<List<TicketMessageResponse>> getTicketMessages(
            @PathVariable(name = "ticketId") Long ticketId) {
        List<TicketMessage> messages = ticketMessageService.getMessagesByTicketId(ticketId);
        List<TicketMessageResponse> response = ticketMapper.toMessageResponseList(messages);
        return ResponseEntity.ok(response);
    }

    /**
     * Delete a message
     */
    @DeleteMapping("/{messageId}")
    @PreAuthorize("hasAnyRole('TECHNICIAN', 'ADMIN')")
    public ResponseEntity<Void> deleteMessage(
            @PathVariable(name = "messageId") Long messageId) {
        boolean deleted = ticketMessageService.deleteMessage(messageId);
        return deleted ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }
}