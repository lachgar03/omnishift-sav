package com.sav.security.util;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

/**
 * Enhanced security utility for consistent user ID extraction and security operations
 */
@Component
public class SecurityUtil {

    /**
     * Get current user ID from JWT token (consistent across application)
     */
    public static String getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth instanceof JwtAuthenticationToken jwtToken) {
            Jwt jwt = jwtToken.getToken();
            String userId = jwt.getClaimAsString("sub");
            if (userId == null || userId.trim().isEmpty()) {
                throw new SecurityException("No valid user ID found in JWT token");
            }
            return userId.trim();
        }
        throw new SecurityException("No valid JWT token found in security context");
    }

    /**
     * Get current username from JWT token
     */
    public static String getCurrentUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth instanceof JwtAuthenticationToken jwtToken) {
            Jwt jwt = jwtToken.getToken();
            return jwt.getClaimAsString("preferred_username");
        }
        throw new SecurityException("No valid JWT token found in security context");
    }

    /**
     * Get current user email from JWT token
     */
    public static String getCurrentUserEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth instanceof JwtAuthenticationToken jwtToken) {
            Jwt jwt = jwtToken.getToken();
            return jwt.getClaimAsString("email");
        }
        throw new SecurityException("No valid JWT token found in security context");
    }

    /**
     * Get current user roles from JWT token
     */
    @SuppressWarnings("unchecked")
    public static List<String> getCurrentUserRoles() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth instanceof JwtAuthenticationToken jwtToken) {
            Jwt jwt = jwtToken.getToken();
            Map<String, Object> realmAccess = jwt.getClaimAsMap("realm_access");
            if (realmAccess != null) {
                List<String> roles = (List<String>) realmAccess.get("roles");
                if (roles != null) {
                    return roles.stream()
                            .filter(role -> List.of("ADMIN", "TECHNICIAN", "USER").contains(role))
                            .toList();
                }
            }
        }
        return List.of();
    }

    /**
     * Check if current user has specific role
     */
    public static boolean hasRole(String role) {
        return getCurrentUserRoles().contains(role);
    }

    /**
     * Check if current user has any of the specified roles
     */
    public static boolean hasAnyRole(String... roles) {
        List<String> userRoles = getCurrentUserRoles();
        for (String role : roles) {
            if (userRoles.contains(role)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Check if current user is admin
     */
    public static boolean isAdmin() {
        return hasRole("ADMIN");
    }

    /**
     * Check if current user is technician
     */
    public static boolean isTechnician() {
        return hasRole("TECHNICIAN");
    }

    /**
     * Check if current user is regular user
     */
    public static boolean isUser() {
        return hasRole("USER");
    }

    /**
     * Get all JWT claims for debugging
     */
    public static Map<String, Object> getAllClaims() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth instanceof JwtAuthenticationToken jwtToken) {
            return jwtToken.getToken().getClaims();
        }
        return Map.of();
    }

    /**
     * Validate that user is authenticated
     */
    public static void validateAuthentication() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new SecurityException("User is not authenticated");
        }
    }

    /**
     * Validate that user has required role
     */
    public static void validateRole(String requiredRole) {
        validateAuthentication();
        if (!hasRole(requiredRole)) {
            throw new SecurityException("User does not have required role: " + requiredRole);
        }
    }

    /**
     * Validate that user has any of the required roles
     */
    public static void validateAnyRole(String... requiredRoles) {
        validateAuthentication();
        if (!hasAnyRole(requiredRoles)) {
            throw new SecurityException("User does not have any of the required roles: " + String.join(", ", requiredRoles));
        }
    }
}
