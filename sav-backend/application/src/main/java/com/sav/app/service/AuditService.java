package com.sav.app.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import com.sav.security.util.SecurityUtil;

import java.time.LocalDateTime;
import java.util.UUID;


@Service
@RequiredArgsConstructor
@Slf4j
public class AuditService {


    @Async
    public void logUserAction(String action, String resource, String details) {
        try {
            String userId = SecurityUtil.getCurrentUserId();
            String username = SecurityUtil.getCurrentUsername();
            
            AuditLogEntry auditLog = AuditLogEntry.builder()
                .id(UUID.randomUUID().toString())
                .userId(userId)
                .username(username)
                .action(action)
                .resource(resource)
                .details(encryptSensitiveData(details))
                .timestamp(LocalDateTime.now())
                .ipAddress(getCurrentUserIp())
                .userAgent(getCurrentUserAgent())
                .sessionId(getCurrentSessionId())
                .build();
                

            logAuditEntry(auditLog);
            
            log.info("User action logged: userId={}, action={}, resource={}", userId, action, resource);
            
        } catch (Exception e) {
            log.error("Failed to log user action: {}", e.getMessage(), e);
        }
    }


    @Async
    public void logTicketCreated(Long ticketId, String title, String priority) {
        String details = String.format("Ticket created: ID=%d, Title='%s', Priority=%s", 
            ticketId, title, priority);
        logUserAction("CREATE_TICKET", "TICKET", details);
    }


    @Async
    public void logTicketAssigned(Long ticketId, String assignedTo, String assignedBy) {
        String details = String.format("Ticket assigned: ID=%d, AssignedTo=%s, AssignedBy=%s", 
            ticketId, assignedTo, assignedBy);
        logUserAction("ASSIGN_TICKET", "TICKET", details);
    }


    @Async
    public void logTicketStatusChanged(Long ticketId, String oldStatus, String newStatus) {
        String details = String.format("Status changed: ID=%d, %s -> %s", 
            ticketId, oldStatus, newStatus);
        logUserAction("CHANGE_STATUS", "TICKET", details);
    }

    @Async
    public void logUserCreated(String userId, String username, String role) {
        String details = String.format("User created: ID=%s, Username=%s, Role=%s", 
            userId, username, role);
        logUserAction("CREATE_USER", "USER", details);
    }


    @Async
    public void logUserRoleChanged(String userId, String oldRole, String newRole) {
        String details = String.format("Role changed: ID=%s, %s -> %s", 
            userId, oldRole, newRole);
        logUserAction("CHANGE_ROLE", "USER", details);
    }


    @Async
    public void logAuthentication(String event, String details) {
        logUserAction("AUTH_" + event, "AUTHENTICATION", details);
    }


    @Async
    public void logSecurityViolation(String violation, String details) {
        String fullDetails = String.format("SECURITY_VIOLATION: %s - %s", violation, details);
        logUserAction("SECURITY_VIOLATION", "SECURITY", fullDetails);
        
        log.warn("SECURITY VIOLATION: {} - {}", violation, details);
    }


    @Async
    public void logDataAccess(String resource, String operation, String details) {
        logUserAction("DATA_ACCESS", resource, 
            String.format("%s: %s", operation, details));
    }


    private String encryptSensitiveData(String data) {

        if (data == null) return null;
        
        data = data.replaceAll("([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})", "***@***.***");
        
        data = data.replaceAll("(\\+?[0-9]{10,15})", "***-***-****");
        
        return data;
    }


    private String getCurrentUserIp() {
        return "127.0.0.1"; // Placeholder
    }


    private String getCurrentUserAgent() {
        return "SAV-Backend/1.0"; // Placeholder
    }


    private String getCurrentSessionId() {
        // In production, extract from HttpSession
        return UUID.randomUUID().toString(); // Placeholder
    }


    private void logAuditEntry(AuditLogEntry entry) {
        log.info("AUDIT: {} | {} | {} | {} | {} | {}",
            entry.timestamp(),
            entry.userId(),
            entry.action(),
            entry.resource(),
            entry.details(),
            entry.ipAddress()
        );
    }


    public record AuditLogEntry(
        String id,
        String userId,
        String username,
        String action,
        String resource,
        String details,
        LocalDateTime timestamp,
        String ipAddress,
        String userAgent,
        String sessionId
    ) {
        public static AuditLogEntryBuilder builder() {
            return new AuditLogEntryBuilder();
        }
        
        public static class AuditLogEntryBuilder {
            private String id;
            private String userId;
            private String username;
            private String action;
            private String resource;
            private String details;
            private LocalDateTime timestamp;
            private String ipAddress;
            private String userAgent;
            private String sessionId;
            
            public AuditLogEntryBuilder id(String id) { this.id = id; return this; }
            public AuditLogEntryBuilder userId(String userId) { this.userId = userId; return this; }
            public AuditLogEntryBuilder username(String username) { this.username = username; return this; }
            public AuditLogEntryBuilder action(String action) { this.action = action; return this; }
            public AuditLogEntryBuilder resource(String resource) { this.resource = resource; return this; }
            public AuditLogEntryBuilder details(String details) { this.details = details; return this; }
            public AuditLogEntryBuilder timestamp(LocalDateTime timestamp) { this.timestamp = timestamp; return this; }
            public AuditLogEntryBuilder ipAddress(String ipAddress) { this.ipAddress = ipAddress; return this; }
            public AuditLogEntryBuilder userAgent(String userAgent) { this.userAgent = userAgent; return this; }
            public AuditLogEntryBuilder sessionId(String sessionId) { this.sessionId = sessionId; return this; }
            
            public AuditLogEntry build() {
                return new AuditLogEntry(id, userId, username, action, resource, details, 
                    timestamp, ipAddress, userAgent, sessionId);
            }
        }
    }
}
