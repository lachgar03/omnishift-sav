package com.sav.app.util;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Component
@Slf4j
public class StructuredLogger {

    private final ObjectMapper objectMapper;

    public StructuredLogger(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public void logBusinessEvent(String event, String userId, Map<String, Object> context) {
        Map<String, Object> logData = new HashMap<>();
        logData.put("timestamp", LocalDateTime.now());
        logData.put("event", event);
        logData.put("userId", userId);
        logData.put("context", context);
        logData.put("traceId", MDC.get("traceId"));
        logData.put("spanId", MDC.get("spanId"));
        
        try {
            log.info("BUSINESS_EVENT: {}", objectMapper.writeValueAsString(logData));
        } catch (JsonProcessingException e) {
            log.warn("Failed to serialize log data: {}", e.getMessage());
        }
    }

    public void logSecurityEvent(String event, String userId, String action, Map<String, Object> context) {
        Map<String, Object> logData = new HashMap<>();
        logData.put("timestamp", LocalDateTime.now());
        logData.put("event", event);
        logData.put("userId", userId);
        logData.put("action", action);
        logData.put("context", context);
        logData.put("traceId", MDC.get("traceId"));
        logData.put("spanId", MDC.get("spanId"));
        
        try {
            log.warn("SECURITY_EVENT: {}", objectMapper.writeValueAsString(logData));
        } catch (JsonProcessingException e) {
            log.warn("Failed to serialize security log data: {}", e.getMessage());
        }
    }

    public void logPerformanceEvent(String operation, long durationMs, Map<String, Object> context) {
        Map<String, Object> logData = new HashMap<>();
        logData.put("timestamp", LocalDateTime.now());
        logData.put("event", "PERFORMANCE");
        logData.put("operation", operation);
        logData.put("durationMs", durationMs);
        logData.put("context", context);
        logData.put("traceId", MDC.get("traceId"));
        logData.put("spanId", MDC.get("spanId"));
        
        try {
            log.info("PERFORMANCE_EVENT: {}", objectMapper.writeValueAsString(logData));
        } catch (JsonProcessingException e) {
            log.warn("Failed to serialize performance log data: {}", e.getMessage());
        }
    }

    public void logError(String error, String userId, Exception exception, Map<String, Object> context) {
        Map<String, Object> logData = new HashMap<>();
        logData.put("timestamp", LocalDateTime.now());
        logData.put("event", "ERROR");
        logData.put("error", error);
        logData.put("userId", userId);
        logData.put("exception", exception.getClass().getSimpleName());
        logData.put("message", exception.getMessage());
        logData.put("context", context);
        logData.put("traceId", MDC.get("traceId"));
        logData.put("spanId", MDC.get("spanId"));
        
        try {
            log.error("ERROR_EVENT: {}", objectMapper.writeValueAsString(logData), exception);
        } catch (JsonProcessingException e) {
            log.warn("Failed to serialize error log data: {}", e.getMessage());
        }
    }

    public void setTraceContext(String traceId, String spanId) {
        MDC.put("traceId", traceId != null ? traceId : UUID.randomUUID().toString());
        MDC.put("spanId", spanId != null ? spanId : UUID.randomUUID().toString());
    }

    public void clearTraceContext() {
        MDC.remove("traceId");
        MDC.remove("spanId");
    }
}
