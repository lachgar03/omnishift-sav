package com.sav.common.util;

import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.regex.Pattern;

/**
 * Input sanitization utility for XSS protection and data validation
 */
@Component
public class InputSanitizer {

    // HTML tags pattern for basic sanitization
    private static final Pattern HTML_TAG_PATTERN = Pattern.compile("<[^>]*>");
    
    // Script pattern for XSS prevention
    private static final Pattern SCRIPT_PATTERN = Pattern.compile("(?i)<script[^>]*>.*?</script>");
    
    // SQL injection patterns
    private static final Pattern SQL_INJECTION_PATTERN = Pattern.compile("(?i)(union|select|insert|update|delete|drop|create|alter|exec|execute)");

    /**
     * Sanitize HTML input by removing dangerous tags
     */
    public String sanitizeHtml(String input) {
        if (!StringUtils.hasText(input)) {
            return input;
        }
        
        // Remove script tags
        String sanitized = SCRIPT_PATTERN.matcher(input).replaceAll("");
        
        // Remove other potentially dangerous HTML tags
        sanitized = HTML_TAG_PATTERN.matcher(sanitized).replaceAll("");
        
        return sanitized.trim();
    }

    /**
     * Sanitize text input by escaping HTML characters
     */
    public String sanitizeText(String input) {
        if (!StringUtils.hasText(input)) {
            return input;
        }
        
        return input.trim()
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#x27;")
                .replace("/", "&#x2F;");
    }

    /**
     * Validate and sanitize SQL input
     */
    public String sanitizeSql(String input) {
        if (!StringUtils.hasText(input)) {
            return input;
        }
        
        // Check for SQL injection patterns
        if (SQL_INJECTION_PATTERN.matcher(input).find()) {
            throw new IllegalArgumentException("Invalid input detected: potential SQL injection");
        }
        
        return input.trim();
    }

    /**
     * Sanitize email input
     */
    public String sanitizeEmail(String email) {
        if (!StringUtils.hasText(email)) {
            return email;
        }
        
        String sanitized = email.trim().toLowerCase();
        
        // Basic email validation
        if (!isValidEmail(sanitized)) {
            throw new IllegalArgumentException("Invalid email format");
        }
        
        return sanitized;
    }

    /**
     * Sanitize username input
     */
    public String sanitizeUsername(String username) {
        if (!StringUtils.hasText(username)) {
            return username;
        }
        
        String sanitized = username.trim();
        
        // Allow only alphanumeric, dots, underscores, and hyphens
        if (!sanitized.matches("^[a-zA-Z0-9._-]+$")) {
            throw new IllegalArgumentException("Username contains invalid characters");
        }
        
        if (sanitized.length() < 3 || sanitized.length() > 50) {
            throw new IllegalArgumentException("Username must be 3-50 characters long");
        }
        
        return sanitized;
    }

    /**
     * Sanitize phone number input
     */
    public String sanitizePhoneNumber(String phoneNumber) {
        if (!StringUtils.hasText(phoneNumber)) {
            return phoneNumber;
        }
        
        // Remove all non-digit characters except + at the beginning
        String sanitized = phoneNumber.replaceAll("[^\\d+]", "");
        
        if (sanitized.length() < 10 || sanitized.length() > 15) {
            throw new IllegalArgumentException("Phone number must be 10-15 digits");
        }
        
        return sanitized;
    }

    /**
     * Validate email format
     */
    private boolean isValidEmail(String email) {
        return email.matches("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$");
    }

    /**
     * Sanitize ticket title
     */
    public String sanitizeTicketTitle(String title) {
        if (!StringUtils.hasText(title)) {
            throw new IllegalArgumentException("Ticket title cannot be empty");
        }
        
        String sanitized = sanitizeText(title);
        
        if (sanitized.length() < 3 || sanitized.length() > 255) {
            throw new IllegalArgumentException("Ticket title must be 3-255 characters long");
        }
        
        return sanitized;
    }

    /**
     * Sanitize ticket description
     */
    public String sanitizeTicketDescription(String description) {
        if (!StringUtils.hasText(description)) {
            return "";
        }
        
        String sanitized = sanitizeHtml(description);
        
        if (sanitized.length() > 5000) {
            throw new IllegalArgumentException("Ticket description cannot exceed 5000 characters");
        }
        
        return sanitized;
    }
}
