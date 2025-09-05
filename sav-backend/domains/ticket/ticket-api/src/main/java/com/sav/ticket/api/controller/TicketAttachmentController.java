package com.sav.ticket.api.controller;

import com.sav.ticket.api.dto.TicketAttachmentResponse;
import com.sav.ticket.api.mapper.TicketMapper;
import com.sav.ticket.domain.entity.TicketAttachment;
import com.sav.ticket.domain.service.TicketAttachmentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/tickets/{ticketId}/attachments")
@RequiredArgsConstructor
@Slf4j
public class TicketAttachmentController {

    private final TicketAttachmentService ticketAttachmentService;
    private final TicketMapper ticketMapper;

    /**
     * Upload an attachment to a ticket
     * Note: This is a simplified version - in production you'd want proper file storage
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('USER', 'TECHNICIAN', 'ADMIN')")  // ADDED: Security annotation
    public ResponseEntity<TicketAttachmentResponse> uploadAttachment(
            @PathVariable(name = "ticketId") Long ticketId,  // FIXED: Added explicit name
            @RequestParam(name = "file") MultipartFile file) {  // FIXED: Added explicit name

        log.info("Uploading attachment {} to ticket {}", file.getOriginalFilename(), ticketId);

        // Simplified: In production, you'd save to cloud storage (S3, etc.)
        String fileUrl = "/uploads/" + file.getOriginalFilename(); // Placeholder URL

        return ticketAttachmentService.addAttachmentToTicket(
                        ticketId,
                        file.getOriginalFilename(),
                        fileUrl)
                .map(attachment -> ResponseEntity.status(HttpStatus.CREATED)
                        .body(ticketMapper.toAttachmentResponse(attachment)))
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get all attachments for a ticket
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('USER', 'TECHNICIAN', 'ADMIN')")  // ADDED: Security annotation
    public ResponseEntity<List<TicketAttachmentResponse>> getTicketAttachments(
            @PathVariable(name = "ticketId") Long ticketId) {  // FIXED: Added explicit name
        List<TicketAttachment> attachments = ticketAttachmentService.getAttachmentsByTicketId(ticketId);
        List<TicketAttachmentResponse> response = ticketMapper.toAttachmentResponseList(attachments);
        return ResponseEntity.ok(response);
    }

    /**
     * Delete an attachment
     */
    @DeleteMapping("/{attachmentId}")
    @PreAuthorize("hasAnyRole('TECHNICIAN', 'ADMIN')")  // ADDED: Security annotation
    public ResponseEntity<Void> deleteAttachment(
            @PathVariable(name = "attachmentId") Long attachmentId) {  // FIXED: Added explicit name
        boolean deleted = ticketAttachmentService.deleteAttachment(attachmentId);
        return deleted ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }

    /**
     * Download an attachment (placeholder implementation)
     */
    @GetMapping("/{attachmentId}/download")
    @PreAuthorize("hasAnyRole('USER', 'TECHNICIAN', 'ADMIN')")  // ADDED: Security annotation
    public ResponseEntity<String> downloadAttachment(
            @PathVariable(name = "attachmentId") Long attachmentId) {  // FIXED: Added explicit name
        return ticketAttachmentService.getAttachmentById(attachmentId)
                .map(attachment -> ResponseEntity.ok("File download URL: " + attachment.getFileUrl()))
                .orElse(ResponseEntity.notFound().build());
    }
}