package com.sav.ticket.domain.repository;

import com.sav.ticket.domain.entity.TicketAttachment;

import java.util.List;
import java.util.Optional;

public interface TicketAttachmentRepositoryPort {
    TicketAttachment save(TicketAttachment attachment);
    Optional<TicketAttachment> findById(Long id);
    List<TicketAttachment> findByTicketId(Long ticketId);
    void delete(TicketAttachment attachment);
    void deleteById(Long id);
}