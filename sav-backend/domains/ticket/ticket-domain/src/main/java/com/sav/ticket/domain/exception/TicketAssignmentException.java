package com.sav.ticket.domain.exception;

/**
 * Exception thrown when ticket assignment fails
 */
public class TicketAssignmentException extends RuntimeException {
    
    public TicketAssignmentException(String message) {
        super(message);
    }
    
    public TicketAssignmentException(String message, Throwable cause) {
        super(message, cause);
    }
}
