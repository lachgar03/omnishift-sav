package com.sav.ticket.api.controller;

import com.sav.ticket.api.dto.TicketAttachmentResponse;
import com.sav.ticket.api.mapper.TicketMapper;
import com.sav.ticket.domain.entity.TicketAttachment;
import com.sav.ticket.domain.service.TicketAttachmentService;
import com.sav.ticket.domain.service.TicketService;
import com.sav.security.util.AuthUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/tickets/{ticketId}/attachments")
@RequiredArgsConstructor
@Slf4j
public class TicketAttachmentController {

    private final TicketAttachmentService ticketAttachmentService;
    private final TicketService ticketService; // Added dependency for security validation
    private final TicketMapper ticketMapper;

    /**
     * Validate if user can access the ticket
     * Regular users can only access their own tickets
     * Support staff (TECHNICIAN/ADMIN) can access any ticket
     */
    private boolean validateTicketAccess(Long ticketId, Authentication authentication) {
        String userId = AuthUtil.extractUserIdFromAuth(authentication);
        if (userId == null) {
            log.warn("No user ID found in authentication for ticket access validation");
            return false;
        }

        // Check if user has support role (TECHNICIAN or ADMIN)
        boolean isSupport = authentication.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_TECHNICIAN") ||
                        auth.getAuthority().equals("ROLE_ADMIN"));

        if (isSupport) {
            log.debug("Support staff {} accessing ticket {}", userId, ticketId);
            return true; // Support staff can access any ticket
        }

        // Regular users can only access their own tickets
        boolean canAccess = ticketService.canUserUpdateTicket(userId, ticketId);
        if (!canAccess) {
            log.warn("User {} denied access to ticket {}", userId, ticketId);
        }
        return canAccess;
    }

    /**
     * Validate file type based on allowed extensions
     */
    private boolean isValidFileType(String filename) {
        if (filename == null || filename.trim().isEmpty()) {
            return false;
        }

        String lowerCaseFilename = filename.toLowerCase().trim();

        // Define allowed file extensions
        String[] allowedExtensions = {
                // Documents
                ".pdf", ".doc", ".docx", ".txt", ".rtf", ".odt",
                // Images
                ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp",
                // Spreadsheets
                ".xls", ".xlsx", ".csv", ".ods",
                // Archives
                ".zip", ".rar", ".7z", ".tar", ".gz",
                // Other common types
                ".log", ".xml", ".json"
        };

        for (String extension : allowedExtensions) {
            if (lowerCaseFilename.endsWith(extension)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Upload an attachment to a ticket
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('USER', 'TECHNICIAN', 'ADMIN')")
    public ResponseEntity<TicketAttachmentResponse> uploadAttachment(
            @PathVariable(name = "ticketId") Long ticketId,
            @RequestParam(name = "file") MultipartFile file,
            Authentication authentication) {

        log.info("Upload attachment request for ticket {} by user {}",
                ticketId, AuthUtil.extractUserIdFromAuth(authentication));

        // Validate ticket access
        if (!validateTicketAccess(ticketId, authentication)) {
            log.warn("Access denied to ticket {} for attachment upload", ticketId);
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        // Validate file is not empty
        if (file.isEmpty()) {
            log.warn("Empty file upload attempted for ticket {}", ticketId);
            return ResponseEntity.badRequest().build();
        }

        String filename = file.getOriginalFilename();

        // Validate file type
        if (!isValidFileType(filename)) {
            log.warn("Invalid file type attempted for ticket {}: {}", ticketId, filename);
            return ResponseEntity.badRequest().build();
        }

        // Validate file size (10MB limit)
        long maxFileSize = 10 * 1024 * 1024; // 10MB
        if (file.getSize() > maxFileSize) {
            log.warn("File too large for ticket {}: {} bytes (max: {} bytes)",
                    ticketId, file.getSize(), maxFileSize);
            return ResponseEntity.badRequest().build();
        }

        log.info("Uploading valid attachment {} ({} bytes) to ticket {}",
                filename, file.getSize(), ticketId);

        // In production, implement proper file storage (AWS S3, Azure Blob, etc.)
        // For now, using placeholder URL
        String fileUrl = "/uploads/" + System.currentTimeMillis() + "_" + filename;

        return ticketAttachmentService.addAttachmentToTicket(ticketId, filename, fileUrl)
                .map(attachment -> {
                    log.info("Successfully uploaded attachment {} to ticket {}",
                            attachment.getId(), ticketId);
                    return ResponseEntity.status(HttpStatus.CREATED)
                            .body(ticketMapper.toAttachmentResponse(attachment));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get all attachments for a ticket
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('USER', 'TECHNICIAN', 'ADMIN')")
    public ResponseEntity<List<TicketAttachmentResponse>> getTicketAttachments(
            @PathVariable(name = "ticketId") Long ticketId,
            Authentication authentication) {

        log.debug("Get attachments request for ticket {} by user {}",
                ticketId, AuthUtil.extractUserIdFromAuth(authentication));

        // Validate ticket access
        if (!validateTicketAccess(ticketId, authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        List<TicketAttachment> attachments = ticketAttachmentService.getAttachmentsByTicketId(ticketId);
        List<TicketAttachmentResponse> response = ticketMapper.toAttachmentResponseList(attachments);

        log.debug("Retrieved {} attachments for ticket {}", response.size(), ticketId);
        return ResponseEntity.ok(response);
    }

    /**
     * Delete an attachment - Only TECHNICIAN and ADMIN can delete
     */
    @DeleteMapping("/{attachmentId}")
    @PreAuthorize("hasAnyRole('TECHNICIAN', 'ADMIN')")
    public ResponseEntity<Void> deleteAttachment(
            @PathVariable(name = "ticketId") Long ticketId,
            @PathVariable(name = "attachmentId") Long attachmentId,
            Authentication authentication) {

        log.info("Delete attachment {} from ticket {} by user {}",
                attachmentId, ticketId, AuthUtil.extractUserIdFromAuth(authentication));

        // Validate ticket access (even though only support staff can delete)
        if (!validateTicketAccess(ticketId, authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        // Verify attachment belongs to the ticket
        return ticketAttachmentService.getAttachmentById(attachmentId)
                .map(attachment -> {
                    if (!attachment.getTicket().getId().equals(ticketId)) {
                        log.warn("Attachment {} does not belong to ticket {}", attachmentId, ticketId);
                        return ResponseEntity.badRequest().<Void>build();
                    }

                    boolean deleted = ticketAttachmentService.deleteAttachment(attachmentId);
                    if (deleted) {
                        log.info("Successfully deleted attachment {} from ticket {}", attachmentId, ticketId);
                        return ResponseEntity.noContent().<Void>build();
                    } else {
                        return ResponseEntity.notFound().<Void>build();
                    }
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Download an attachment
     */
    @GetMapping("/{attachmentId}/download")
    @PreAuthorize("hasAnyRole('USER', 'TECHNICIAN', 'ADMIN')")
    public ResponseEntity<String> downloadAttachment(
            @PathVariable(name = "ticketId") Long ticketId,
            @PathVariable(name = "attachmentId") Long attachmentId,
            Authentication authentication) {

        log.info("Download attachment {} from ticket {} by user {}",
                attachmentId, ticketId, AuthUtil.extractUserIdFromAuth(authentication));

        // Validate ticket access
        if (!validateTicketAccess(ticketId, authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return ticketAttachmentService.getAttachmentById(attachmentId)
                .map(attachment -> {
                    // Verify attachment belongs to the ticket
                    if (!attachment.getTicket().getId().equals(ticketId)) {
                        log.warn("Attachment {} does not belong to ticket {}", attachmentId, ticketId);
                        return ResponseEntity.badRequest().<String>build();
                    }

                    log.info("Providing download for attachment {} from ticket {}", attachmentId, ticketId);
                    // In production, return actual file stream or signed URL
                    return ResponseEntity.ok("File download URL: " + attachment.getFileUrl());
                })
                .orElse(ResponseEntity.notFound().build());
    }
}