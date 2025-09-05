package com.sav.ticket.api.mapper;


import com.sav.ticket.api.dto.*;
import com.sav.ticket.domain.entity.Ticket;
import com.sav.ticket.domain.entity.TicketMessage;
import com.sav.ticket.domain.entity.TicketAttachment;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class TicketMapper {

    /**
     * Convert Ticket entity to TicketResponse DTO
     */
    public TicketResponse toResponse(Ticket ticket) {
        if (ticket == null) {
            return null;
        }

        return TicketResponse.builder()
                .id(ticket.getId())
                .title(ticket.getTitle())
                .description(ticket.getDescription())
                .status(ticket.getStatus())
                .type(ticket.getType())
                .priority(ticket.getPriority())
                .createdAt(ticket.getCreatedAt())
                .updatedAt(ticket.getUpdatedAt())
                .createdByUserId(ticket.getCreatedByUserId())
                .assignedTeam(ticket.getAssignedTeam())
                .assignedUserId(ticket.getAssignedUserId())
                .messages(toMessageResponseList(ticket.getMessages()))
                .attachments(toAttachmentResponseList(ticket.getAttachments()))
                .build();
    }

    /**
     * Convert TicketMessage entity to TicketMessageResponse DTO
     */
    public TicketMessageResponse toMessageResponse(TicketMessage message) {
        if (message == null) {
            return null;
        }

        return TicketMessageResponse.builder()
                .id(message.getId())
                .content(message.getContent())
                .createdAt(message.getCreatedAt())
                .authorId(message.getAuthorId())
                .build();
    }

    /**
     * Convert TicketAttachment entity to TicketAttachmentResponse DTO
     */
    public TicketAttachmentResponse toAttachmentResponse(TicketAttachment attachment) {
        if (attachment == null) {
            return null;
        }

        return TicketAttachmentResponse.builder()
                .id(attachment.getId())
                .filename(attachment.getFilename())
                .fileUrl(attachment.getFileUrl())
                .uploadedAt(attachment.getUploadedAt())
                .build();
    }

    /**
     * Convert list of TicketMessage entities to list of DTOs
     */
    public List<TicketMessageResponse> toMessageResponseList(List<TicketMessage> messages) {
        if (messages == null) {
            return Collections.emptyList();
        }

        return messages.stream()
                .map(this::toMessageResponse)
                .collect(Collectors.toList());
    }

    /**
     * Convert list of TicketAttachment entities to list of DTOs
     */
    public List<TicketAttachmentResponse> toAttachmentResponseList(List<TicketAttachment> attachments) {
        if (attachments == null) {
            return Collections.emptyList();
        }

        return attachments.stream()
                .map(this::toAttachmentResponse)
                .collect(Collectors.toList());
    }

    /**
     * Convert list of Ticket entities to list of DTOs
     */
    public List<TicketResponse> toResponseList(List<Ticket> tickets) {
        if (tickets == null) {
            return Collections.emptyList();
        }

        return tickets.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }
}
