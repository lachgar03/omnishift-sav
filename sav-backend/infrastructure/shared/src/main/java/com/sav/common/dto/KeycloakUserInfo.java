package com.sav.common.dto;

import com.sav.common.enums.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO for extracting user information from Keycloak JWT tokens
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KeycloakUserInfo {
    
    private String id; // Keycloak user ID (sub claim)
    private String username; // preferred_username claim
    private String email; // email claim
    private String firstName; // given_name claim
    private String lastName; // family_name claim
    private String fullName; // name claim
    private List<String> roles; // realm_access.roles or resource_access.sav-backend.roles
    
    /**
     * Map Keycloak roles to application UserRole
     * Defaults to USER if no valid role is found
     */
    public UserRole getMappedRole() {
        if (roles == null || roles.isEmpty()) {
            return UserRole.USER;
        }
        
        // Check for admin role first
        if (roles.contains("ADMIN") || roles.contains("admin")) {
            return UserRole.ADMIN;
        }
        
        // Check for technician role
        if (roles.contains("TECHNICIAN") || roles.contains("technician")) {
            return UserRole.TECHNICIAN;
        }
        
        // Default to USER
        return UserRole.USER;
    }
    
    /**
     * Check if the user info is valid for user creation
     */
    public boolean isValid() {
        return id != null && !id.trim().isEmpty() &&
               username != null && !username.trim().isEmpty() &&
               email != null && !email.trim().isEmpty();
    }
    
    /**
     * Get display name (fullName if available, otherwise firstName + lastName)
     */
    public String getDisplayName() {
        if (fullName != null && !fullName.trim().isEmpty()) {
            return fullName;
        }
        
        if (firstName != null && lastName != null) {
            return firstName + " " + lastName;
        }
        
        return username;
    }
}
