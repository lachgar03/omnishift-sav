package com.sav.ticket.api.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class TicketAttachmentResponse {
    private Long id;
    private String filename;
    private String fileUrl;
    private LocalDateTime uploadedAt;
}
