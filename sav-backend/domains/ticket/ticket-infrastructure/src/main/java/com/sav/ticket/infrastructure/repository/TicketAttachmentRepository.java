package com.sav.ticket.infrastructure.repository;

import com.sav.ticket.domain.entity.TicketAttachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.sav.ticket.domain.repository.TicketAttachmentRepositoryPort;

import java.util.List;
@Repository
public interface TicketAttachmentRepository extends JpaRepository<TicketAttachment, Long>, TicketAttachmentRepositoryPort {
    List<TicketAttachment> findByTicketId(Long ticketId);

}
