package com.sav.ticket.infrastructure.repository;

import com.sav.ticket.domain.entity.TicketMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import com.sav.ticket.domain.repository.TicketMessageRepositoryPort;

import org.springframework.stereotype.Repository;

import java.util.List;
@Repository
public interface TicketMessageRepository extends JpaRepository<TicketMessage, Long> , TicketMessageRepositoryPort {
    List<TicketMessage> findByTicketIdOrderByCreatedAtAsc(Long ticketId);

}
