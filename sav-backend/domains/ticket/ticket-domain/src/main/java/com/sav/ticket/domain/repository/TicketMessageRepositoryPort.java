package com.sav.ticket.domain.repository;

import com.sav.ticket.domain.entity.TicketMessage;

import java.util.List;
import java.util.Optional;

public interface TicketMessageRepositoryPort {
    TicketMessage save(TicketMessage message);
    Optional<TicketMessage> findById(Long id);
    List<TicketMessage> findByTicketIdOrderByCreatedAtAsc(Long ticketId);
    void delete(TicketMessage message);
}
