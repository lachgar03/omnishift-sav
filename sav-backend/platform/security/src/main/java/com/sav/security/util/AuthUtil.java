package com.sav.security.util;

import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

/**
 * Utility class for extracting information from JWT authentication tokens
 */
@Component
public class AuthUtil {

    /**
     * Extract user ID from JWT authentication
     */
    public static String extractUserIdFromAuth(Authentication authentication) {
        if (authentication instanceof JwtAuthenticationToken jwtAuth) {
            return jwtAuth.getToken().getSubject(); // Gets the 'sub' claim (user ID)
        }
        return null;
    }

    /**
     * Extract username from JWT authentication
     */
    public static String extractUsernameFromAuth(Authentication authentication) {
        if (authentication instanceof JwtAuthenticationToken jwtAuth) {
            return jwtAuth.getToken().getClaimAsString("preferred_username");
        }
        return null;
    }

    /**
     * Extract email from JWT authentication
     */
    public static String extractEmailFromAuth(Authentication authentication) {
        if (authentication instanceof JwtAuthenticationToken jwtAuth) {
            return jwtAuth.getToken().getClaimAsString("email");
        }
        return null;
    }

    /**
     * Extract roles from JWT authentication
     */
    @SuppressWarnings("unchecked")
    public static List<String> extractRolesFromAuth(Authentication authentication) {
        if (authentication instanceof JwtAuthenticationToken jwtAuth) {
            Jwt jwt = jwtAuth.getToken();
            Map<String, Object> realmAccess = jwt.getClaimAsMap("realm_access");
            if (realmAccess != null) {
                return (List<String>) realmAccess.get("roles");
            }
        }
        return List.of();
    }

    /**
     * Extract full name from JWT authentication
     */
    public static String extractFullNameFromAuth(Authentication authentication) {
        if (authentication instanceof JwtAuthenticationToken jwtAuth) {
            return jwtAuth.getToken().getClaimAsString("name");
        }
        return null;
    }

    /**
     * Check if user has specific role
     */
    public static boolean hasRole(Authentication authentication, String role) {
        return authentication.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_" + role));
    }

    /**
     * Check if user has any of the specified roles
     */
    public static boolean hasAnyRole(Authentication authentication, String... roles) {
        return authentication.getAuthorities().stream()
                .anyMatch(authority -> {
                    String auth = authority.getAuthority();
                    for (String role : roles) {
                        if (auth.equals("ROLE_" + role)) {
                            return true;
                        }
                    }
                    return false;
                });
    }

    /**
     * Extract all JWT claims as a map
     */
    public static Map<String, Object> extractAllClaims(Authentication authentication) {
        if (authentication instanceof JwtAuthenticationToken jwtAuth) {
            return jwtAuth.getToken().getClaims();
        }
        return Map.of();
    }
}