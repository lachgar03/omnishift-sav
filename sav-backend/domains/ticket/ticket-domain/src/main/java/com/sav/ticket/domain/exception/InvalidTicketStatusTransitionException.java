package com.sav.ticket.domain.exception;

import com.sav.common.enums.TicketStatus;

/**
 * Exception thrown when an invalid ticket status transition is attempted
 */
public class InvalidTicketStatusTransitionException extends RuntimeException {
    
    public InvalidTicketStatusTransitionException(TicketStatus from, TicketStatus to) {
        super(String.format("Invalid status transition from %s to %s", from, to));
    }
    
    public InvalidTicketStatusTransitionException(String message) {
        super(message);
    }
    
    public InvalidTicketStatusTransitionException(String message, Throwable cause) {
        super(message, cause);
    }
}
