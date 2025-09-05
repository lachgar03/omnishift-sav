package com.sav.ticket.domain.service;

import com.sav.ticket.domain.entity.TicketAttachment;
import com.sav.ticket.domain.repository.TicketAttachmentRepositoryPort;
import com.sav.ticket.domain.repository.TicketRepositoryPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class TicketAttachmentService {

    private final TicketAttachmentRepositoryPort ticketAttachmentRepository;
    private final TicketRepositoryPort ticketRepository;

    /**
     * Add attachment to a ticket
     */
    @Transactional
    public Optional<TicketAttachment> addAttachmentToTicket(Long ticketId, String filename, String fileUrl) {
        log.info("Adding attachment {} to ticket {}", filename, ticketId);

        return ticketRepository.findById(ticketId)
                .map(ticket -> {
                    TicketAttachment attachment = TicketAttachment.builder()
                            .filename(filename)
                            .fileUrl(fileUrl)
                            .ticket(ticket)
                            .build();

                    TicketAttachment savedAttachment = ticketAttachmentRepository.save(attachment);
                    log.info("Added attachment with ID: {} to ticket: {}", savedAttachment.getId(), ticketId);

                    return savedAttachment;
                });
    }

    /**
     * Get all attachments for a ticket
     */
    public List<TicketAttachment> getAttachmentsByTicketId(Long ticketId) {
        return ticketAttachmentRepository.findByTicketId(ticketId);
    }

    /**
     * Get attachment by ID
     */
    public Optional<TicketAttachment> getAttachmentById(Long attachmentId) {
        return ticketAttachmentRepository.findById(attachmentId);
    }

    /**
     * Delete an attachment
     */
    @Transactional
    public boolean deleteAttachment(Long attachmentId) {
        log.info("Deleting attachment: {}", attachmentId);

        return ticketAttachmentRepository.findById(attachmentId)
                .map(attachment -> {
                    ticketAttachmentRepository.delete(attachment);
                    return true;
                })
                .orElse(false);
    }
}