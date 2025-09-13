package com.sav.app.service;

import com.sav.common.service.MetricsServicePort;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class MetricsService implements MetricsServicePort {

    private final MeterRegistry meterRegistry;

    public void incrementTicketCreated(String priority, String type) {
        Counter.builder("tickets.created")
                .tag("priority", priority)
                .tag("type", type)
                .register(meterRegistry)
                .increment();
        log.debug("Incremented ticket created counter for priority: {}, type: {}", priority, type);
    }

    public void incrementTicketAssigned(String assignedTo, String assignedBy) {
        Counter.builder("tickets.assigned")
                .tag("assigned_to", assignedTo)
                .tag("assigned_by", assignedBy)
                .register(meterRegistry)
                .increment();
        log.debug("Incremented ticket assigned counter for assignedTo: {}, assignedBy: {}", assignedTo, assignedBy);
    }

    public void incrementTicketStatusChanged(String fromStatus, String toStatus, String changedBy) {
        Counter.builder("tickets.status_changed")
                .tag("from_status", fromStatus)
                .tag("to_status", toStatus)
                .tag("changed_by", changedBy)
                .register(meterRegistry)
                .increment();
        log.debug("Incremented ticket status changed counter from {} to {} by {}", fromStatus, toStatus, changedBy);
    }

    public void incrementUserCreated(String role) {
        Counter.builder("users.created")
                .tag("role", role)
                .register(meterRegistry)
                .increment();
        log.debug("Incremented user created counter for role: {}", role);
    }

    public void incrementApiRequest(String method, String endpoint, int statusCode) {
        Counter.builder("api.requests")
                .tag("method", method)
                .tag("endpoint", endpoint)
                .tag("status", String.valueOf(statusCode))
                .register(meterRegistry)
                .increment();
        log.debug("Incremented API request counter for {} {} with status {}", method, endpoint, statusCode);
    }

    public void incrementApiError(String method, String endpoint, String errorType) {
        Counter.builder("api.errors")
                .tag("method", method)
                .tag("endpoint", endpoint)
                .tag("error_type", errorType)
                .register(meterRegistry)
                .increment();
        log.debug("Incremented API error counter for {} {} with error type {}", method, endpoint, errorType);
    }

    public void recordTicketProcessingTime(String operation, Duration duration) {
        Timer.builder("tickets.processing_time")
                .tag("operation", operation)
                .register(meterRegistry)
                .record(duration);
        log.debug("Recorded ticket processing time for operation {}: {}ms", operation, duration.toMillis());
    }

    public void recordUserProcessingTime(String operation, Duration duration) {
        Timer.builder("users.processing_time")
                .tag("operation", operation)
                .register(meterRegistry)
                .record(duration);
        log.debug("Recorded user processing time for operation {}: {}ms", operation, duration.toMillis());
    }

    public void recordApiResponseTime(String method, String endpoint, Duration duration) {
        Timer.builder("api.response_time")
                .tag("method", method)
                .tag("endpoint", endpoint)
                .register(meterRegistry)
                .record(duration);
        log.debug("Recorded API response time for {} {}: {}ms", method, endpoint, duration.toMillis());
    }

    public void recordDatabaseQueryTime(String queryType, Duration duration) {
        Timer.builder("database.query_time")
                .tag("query_type", queryType)
                .register(meterRegistry)
                .record(duration);
        log.debug("Recorded database query time for {}: {}ms", queryType, duration.toMillis());
    }

    @Override
    public void recordMethodExecutionTime(String methodName, long executionTimeMs) {
        Timer.builder("method.execution_time")
                .tag("method", methodName)
                .register(meterRegistry)
                .record(executionTimeMs, TimeUnit.MILLISECONDS);
        log.debug("Recorded method execution time for {}: {}ms", methodName, executionTimeMs);
    }

    @Override
    public void recordMethodFailure(String methodName) {
        Counter.builder("method.failures")
                .tag("method", methodName)
                .register(meterRegistry)
                .increment();
        log.debug("Recorded method failure for {}", methodName);
    }
}
