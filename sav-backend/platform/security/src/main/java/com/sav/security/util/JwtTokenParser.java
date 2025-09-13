package com.sav.security.util;

import com.sav.common.dto.KeycloakUserInfo;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Utility class for parsing JWT tokens and extracting user information
 */
@Component
public class JwtTokenParser {

    /**
     * Parse JWT token and extract user information
     */
    public KeycloakUserInfo parseUserInfo(Authentication authentication) {
        if (!(authentication instanceof JwtAuthenticationToken jwtAuth)) {
            return null;
        }

        Jwt jwt = jwtAuth.getToken();
        
        return KeycloakUserInfo.builder()
                .id(jwt.getSubject()) // sub claim
                .username(jwt.getClaimAsString("preferred_username"))
                .email(jwt.getClaimAsString("email"))
                .firstName(jwt.getClaimAsString("given_name"))
                .lastName(jwt.getClaimAsString("family_name"))
                .fullName(jwt.getClaimAsString("name"))
                .roles(extractRoles(jwt))
                .build();
    }

    /**
     * Extract roles from JWT token
     * Checks both realm_access.roles and resource_access.sav-backend.roles
     */
    @SuppressWarnings("unchecked")
    private List<String> extractRoles(Jwt jwt) {
        Map<String, Object> realmAccess = jwt.getClaimAsMap("realm_access");
        if (realmAccess != null) {
            List<String> roles = (List<String>) realmAccess.get("roles");
            if (roles != null) {
                return roles.stream()
                        .filter(role -> List.of("ADMIN", "TECHNICIAN", "USER").contains(role))
                        .collect(Collectors.toList());
            }
        }

        Map<String, Object> resourceAccess = jwt.getClaimAsMap("resource_access");
        if (resourceAccess != null) {
            Map<String, Object> clientAccess = (Map<String, Object>) resourceAccess.get("sav-backend");
            if (clientAccess != null) {
                List<String> roles = (List<String>) clientAccess.get("roles");
                if (roles != null) {
                    return roles.stream()
                            .filter(role -> List.of("ADMIN", "TECHNICIAN", "USER").contains(role))
                            .collect(Collectors.toList());
                }
            }
        }

        return List.of();
    }

    /**
     * Extract user ID from JWT token
     */
    public String extractUserId(Authentication authentication) {
        if (authentication instanceof JwtAuthenticationToken jwtAuth) {
            return jwtAuth.getToken().getSubject();
        }
        return null;
    }

    /**
     * Extract username from JWT token
     */
    public String extractUsername(Authentication authentication) {
        if (authentication instanceof JwtAuthenticationToken jwtAuth) {
            return jwtAuth.getToken().getClaimAsString("preferred_username");
        }
        return null;
    }

    /**
     * Extract email from JWT token
     */
    public String extractEmail(Authentication authentication) {
        if (authentication instanceof JwtAuthenticationToken jwtAuth) {
            return jwtAuth.getToken().getClaimAsString("email");
        }
        return null;
    }

    /**
     * Check if JWT token contains valid user information
     */
    public boolean hasValidUserInfo(Authentication authentication) {
        KeycloakUserInfo userInfo = parseUserInfo(authentication);
        return userInfo != null && userInfo.isValid();
    }

    /**
     * Get all JWT claims as a map
     */
    public Map<String, Object> getAllClaims(Authentication authentication) {
        if (authentication instanceof JwtAuthenticationToken jwtAuth) {
            return jwtAuth.getToken().getClaims();
        }
        return Map.of();
    }
}