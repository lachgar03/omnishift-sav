package com.sav.ticket.domain.exception;

/**
 * Exception thrown when a ticket is not found
 */
public class TicketNotFoundException extends RuntimeException {
    
    public TicketNotFoundException(Long ticketId) {
        super("Ticket not found: " + ticketId);
    }
    
    public TicketNotFoundException(String message) {
        super(message);
    }
    
    public TicketNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}
