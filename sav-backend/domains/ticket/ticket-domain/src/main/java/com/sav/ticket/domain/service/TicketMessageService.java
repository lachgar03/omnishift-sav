package com.sav.ticket.domain.service;

import com.sav.ticket.domain.entity.Ticket;
import com.sav.ticket.domain.entity.TicketMessage;
import com.sav.ticket.domain.repository.TicketRepositoryPort;
import com.sav.ticket.domain.repository.TicketMessageRepositoryPort;
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
public class TicketMessageService {

    private final TicketMessageRepositoryPort ticketMessageRepository;
    private final TicketRepositoryPort ticketRepository;

    /**
     * Add a message to a ticket
     */
    @Transactional
    public Optional<TicketMessage> addMessageToTicket(Long ticketId, String content, String authorId) {
        log.info("Adding message to ticket {} by user {}", ticketId, authorId);

        return ticketRepository.findById(ticketId)
                .map(ticket -> {
                    TicketMessage message = TicketMessage.builder()
                            .content(content)
                            .authorId(authorId)
                            .ticket(ticket)
                            .build();

                    TicketMessage savedMessage = ticketMessageRepository.save(message);
                    log.info("Added message with ID: {} to ticket: {}", savedMessage.getId(), ticketId);

                    return savedMessage;
                });
    }

    /**
     * Get all messages for a ticket
     */
    public List<TicketMessage> getMessagesByTicketId(Long ticketId) {
        return ticketMessageRepository.findByTicketIdOrderByCreatedAtAsc(ticketId);
    }

    /**
     * Get message by ID
     */
    public Optional<TicketMessage> getMessageById(Long messageId) {
        return ticketMessageRepository.findById(messageId);
    }

    /**
     * Delete a message (soft delete - you might want to keep history)
     */
    @Transactional
    public boolean deleteMessage(Long messageId) {
        log.info("Deleting message: {}", messageId);

        return ticketMessageRepository.findById(messageId)
                .map(message -> {
                    ticketMessageRepository.delete(message);
                    return true;
                })
                .orElse(false);
    }
}