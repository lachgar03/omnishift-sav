package com.sav.ticket.api.dto;

import com.sav.common.enums.Priority;
import com.sav.common.enums.TicketStatus;
import com.sav.common.enums.TicketType;
import com.sav.common.enums.Team;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class TicketResponse {
    private Long id;
    private String title;
    private String description;
    private TicketStatus status;
    private TicketType type;
    private Priority priority;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdByUserId;
    private Team assignedTeam;
    private String assignedUserId;
    private List<TicketMessageResponse> messages;
    private List<TicketAttachmentResponse> attachments;
}
