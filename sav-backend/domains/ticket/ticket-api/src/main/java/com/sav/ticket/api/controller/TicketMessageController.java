package com.sav.ticket.api.controller;

import com.sav.ticket.api.dto.CreateTicketMessageRequest;
import com.sav.ticket.api.dto.TicketMessageResponse;
import com.sav.ticket.api.mapper.TicketMapper;
import com.sav.ticket.domain.service.TicketService;
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
    private final TicketService ticketService;
    private final TicketMapper ticketMapper;

    /**
     * Validate if user can access the ticket
     * Regular users can only access their own tickets
     * Support staff (TECHNICIAN/ADMIN) can access any ticket
     */
    private boolean validateTicketAccess(Long ticketId, Authentication authentication) {
        String userId = AuthUtil.extractUserIdFromAuth(authentication);
        if (userId == null) {
            log.warn("No user ID found in authentication for ticket message access validation");
            return false;
        }

        // Check if user has support role (TECHNICIAN or ADMIN)
        boolean isSupport = authentication.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_TECHNICIAN") ||
                        auth.getAuthority().equals("ROLE_ADMIN"));

        if (isSupport) {
            log.debug("Support staff {} accessing ticket {} messages", userId, ticketId);
            return true; // Support staff can access any ticket
        }

        // Regular users can only access their own tickets
        boolean canAccess = ticketService.canUserUpdateTicket(userId, ticketId);
        if (!canAccess) {
            log.warn("User {} denied access to ticket {} messages", userId, ticketId);
        }
        return canAccess;
    }

    /**
     * Validate message content for security and business rules
     */
    private boolean isValidMessageContent(String content) {
        if (content == null || content.trim().isEmpty()) {
            return false;
        }

        // Check message length limits
        if (content.length() > 10000) { // 10K character limit
            return false;
        }

        // Basic content validation - could be extended with more sophisticated filtering
        String trimmedContent = content.trim();

        // Prevent messages that are just whitespace or special characters
        if (trimmedContent.matches("^[\\s\\p{Punct}]*$")) {
            return false;
        }

        return true;
    }

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
        log.info("Add message to ticket {} by user {}", ticketId, userId);

        if (userId == null) {
            log.warn("Invalid user authentication for message creation on ticket {}", ticketId);
            return ResponseEntity.badRequest().build();
        }

        // Validate ticket access
        if (!validateTicketAccess(ticketId, authentication)) {
            log.warn("Access denied to ticket {} for message creation", ticketId);
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        // Additional content validation beyond @Valid annotation
        if (!isValidMessageContent(request.getContent())) {
            log.warn("Invalid message content attempted on ticket {} by user {}", ticketId, userId);
            return ResponseEntity.badRequest().build();
        }

        // Sanitize content (remove potential XSS, etc.)
        String sanitizedContent = sanitizeMessageContent(request.getContent());

        return ticketMessageService.addMessageToTicket(ticketId, sanitizedContent, userId)
                .map(message -> {
                    log.info("Successfully added message {} to ticket {} by user {}",
                            message.getId(), ticketId, userId);
                    return ResponseEntity.status(HttpStatus.CREATED)
                            .body(ticketMapper.toMessageResponse(message));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get all messages for a ticket
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('USER', 'TECHNICIAN', 'ADMIN')")
    public ResponseEntity<List<TicketMessageResponse>> getTicketMessages(
            @PathVariable(name = "ticketId") Long ticketId,
            Authentication authentication) {

        log.debug("Get messages for ticket {} by user {}",
                ticketId, AuthUtil.extractUserIdFromAuth(authentication));

        // Validate ticket access
        if (!validateTicketAccess(ticketId, authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        List<TicketMessage> messages = ticketMessageService.getMessagesByTicketId(ticketId);
        List<TicketMessageResponse> response = ticketMapper.toMessageResponseList(messages);

        log.debug("Retrieved {} messages for ticket {}", response.size(), ticketId);
        return ResponseEntity.ok(response);
    }

    /**
     * Delete a message - Only TECHNICIAN and ADMIN can delete messages
     */
    @DeleteMapping("/{messageId}")
    @PreAuthorize("hasAnyRole('TECHNICIAN', 'ADMIN')")
    public ResponseEntity<Void> deleteMessage(
            @PathVariable(name = "ticketId") Long ticketId,
            @PathVariable(name = "messageId") Long messageId,
            Authentication authentication) {

        String userId = AuthUtil.extractUserIdFromAuth(authentication);
        log.info("Delete message {} from ticket {} by support user {}", messageId, ticketId, userId);

        // Validate ticket access (even though only support staff can delete)
        if (!validateTicketAccess(ticketId, authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        // Verify message exists and belongs to the ticket
        return ticketMessageService.getMessageById(messageId)
                .map(message -> {
                    // Verify message belongs to the ticket
                    if (!message.getTicket().getId().equals(ticketId)) {
                        log.warn("Message {} does not belong to ticket {}", messageId, ticketId);
                        return ResponseEntity.badRequest().<Void>build();
                    }

                    boolean deleted = ticketMessageService.deleteMessage(messageId);
                    if (deleted) {
                        log.info("Successfully deleted message {} from ticket {} by user {}",
                                messageId, ticketId, userId);
                        return ResponseEntity.noContent().<Void>build();
                    } else {
                        log.error("Failed to delete message {} from ticket {}", messageId, ticketId);
                        return ResponseEntity.internalServerError().<Void>build();
                    }
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Sanitize message content to prevent XSS and other security issues
     * In production, use a proper sanitization library like OWASP Java HTML Sanitizer
     */
    private String sanitizeMessageContent(String content) {
        if (content == null) {
            return "";
        }

        // Basic sanitization - in production use a proper library
        return content.trim()
                .replaceAll("<script[^>]*>.*?</script>", "") // Remove script tags
                .replaceAll("<[^>]*>", "") // Remove all HTML tags
                .replaceAll("javascript:", "") // Remove javascript: protocols
                .replaceAll("vbscript:", "") // Remove vbscript: protocols
                .replaceAll("onload", "") // Remove onload attributes
                .replaceAll("onerror", "") // Remove onerror attributes
                .replaceAll("onclick", ""); // Remove onclick attributes

        // Additional sanitization can be added here
    }

    /**
     * Get message by ID - for internal use or future features
     */
    @GetMapping("/{messageId}")
    @PreAuthorize("hasAnyRole('USER', 'TECHNICIAN', 'ADMIN')")
    public ResponseEntity<TicketMessageResponse> getMessageById(
            @PathVariable(name = "ticketId") Long ticketId,
            @PathVariable(name = "messageId") Long messageId,
            Authentication authentication) {

        log.debug("Get message {} from ticket {} by user {}",
                messageId, ticketId, AuthUtil.extractUserIdFromAuth(authentication));

        // Validate ticket access
        if (!validateTicketAccess(ticketId, authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return ticketMessageService.getMessageById(messageId)
                .map(message -> {
                    // Verify message belongs to the ticket
                    if (!message.getTicket().getId().equals(ticketId)) {
                        log.warn("Message {} does not belong to ticket {}", messageId, ticketId);
                        return ResponseEntity.badRequest().<TicketMessageResponse>build();
                    }

                    return ResponseEntity.ok(ticketMapper.toMessageResponse(message));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}