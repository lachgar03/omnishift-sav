package com.sav.common.service;

/**
 * Port interface for metrics service operations.
 * This interface defines the contract for tracking business metrics in the application.
 */
public interface MetricsServicePort {
    
    /**
     * Increment the counter for ticket creation metrics.
     * 
     * @param priority The priority of the created ticket
     * @param type The type of the created ticket
     */
    void incrementTicketCreated(String priority, String type);
    
    /**
     * Increment the counter for ticket assignment metrics.
     * 
     * @param assignedTo The user ID the ticket was assigned to
     * @param assignedBy The user ID who performed the assignment
     */
    void incrementTicketAssigned(String assignedTo, String assignedBy);
    
    /**
     * Increment the counter for ticket status change metrics.
     * 
     * @param fromStatus The previous status of the ticket
     * @param toStatus The new status of the ticket
     * @param changedBy The user ID who performed the status change
     */
    void incrementTicketStatusChanged(String fromStatus, String toStatus, String changedBy);
    
    /**
     * Record method execution time for performance monitoring.
     * 
     * @param methodName The name of the method being monitored
     * @param executionTimeMs The execution time in milliseconds
     */
    void recordMethodExecutionTime(String methodName, long executionTimeMs);
    
    /**
     * Record method failure for error tracking.
     * 
     * @param methodName The name of the method that failed
     */
    void recordMethodFailure(String methodName);
}
