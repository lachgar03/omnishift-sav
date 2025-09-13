package com.sav.user.domain.service;

import com.sav.common.enums.UserRole;
import com.sav.common.enums.UserStatus;
import com.sav.user.domain.entity.User;
import com.sav.user.domain.repository.UserRepositoryPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

/**
 * Service for synchronizing users between Keycloak and the application database
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class UserSyncService {

    private final UserRepositoryPort userRepository;

    /**
     * Synchronize user from Keycloak JWT token data
     * Creates user if not exists, updates if exists
     */
    @Transactional
    public User syncUserFromKeycloak(String keycloakId, String username, String email, 
                                   String firstName, String lastName, String fullName, 
                                   UserRole role) {
        log.info("Syncing user from Keycloak: {} (ID: {})", username, keycloakId);

        Optional<User> existingUser = userRepository.findById(keycloakId);

        if (existingUser.isPresent()) {
            // Update existing user with latest Keycloak data
            User user = existingUser.get();
            boolean updated = false;

            if (!username.equals(user.getUsername())) {
                user.setUsername(username);
                updated = true;
            }

            if (!email.equals(user.getEmail())) {
                user.setEmail(email);
                updated = true;
            }

            if (firstName != null && !firstName.equals(user.getFirstName())) {
                user.setFirstName(firstName);
                updated = true;
            }

            if (lastName != null && !lastName.equals(user.getLastName())) {
                user.setLastName(lastName);
                updated = true;
            }

            // Only update role if it's higher privilege (USER -> TECHNICIAN -> ADMIN)
            if (shouldUpdateRole(user.getRole(), role)) {
                user.setRole(role);
                updated = true;
                log.info("Updated user role from {} to {} for user: {}", 
                        user.getRole(), role, username);
            }

            if (updated) {
                log.info("Updated user profile from Keycloak: {}", username);
                return userRepository.save(user);
            } else {
                log.debug("No updates needed for user: {}", username);
                return user;
            }
        } else {
            // Create new user
            User user = User.builder()
                    .id(keycloakId)
                    .username(username)
                    .firstName(firstName != null ? firstName : username)
                    .lastName(lastName != null ? lastName : "")
                    .email(email)
                    .role(role)
                    .status(UserStatus.ACTIVE)
                    .build();

            log.info("Created new user from Keycloak: {} with role: {}", username, role);
            return userRepository.save(user);
        }
    }

    /**
     * Check if user exists in database
     */
    public boolean userExists(String keycloakId) {
        return userRepository.findById(keycloakId).isPresent();
    }

    /**
     * Get user by Keycloak ID
     */
    public Optional<User> getUserByKeycloakId(String keycloakId) {
        return userRepository.findById(keycloakId);
    }

    /**
     * Determine if role should be updated based on privilege hierarchy
     * Only allows upgrading roles, not downgrading
     */
    private boolean shouldUpdateRole(UserRole currentRole, UserRole newRole) {
        if (currentRole == null || newRole == null) {
            return true;
        }

        // Define role hierarchy: USER < TECHNICIAN < ADMIN
        int currentLevel = getRoleLevel(currentRole);
        int newLevel = getRoleLevel(newRole);

        // Only update if new role is higher or equal privilege
        return newLevel >= currentLevel;
    }

    /**
     * Get role hierarchy level for comparison
     */
    private int getRoleLevel(UserRole role) {
        return switch (role) {
            case USER -> 1;
            case TECHNICIAN -> 2;
            case ADMIN -> 3;
        };
    }

    /**
     * Create user with minimal required information
     * Used as fallback when user doesn't exist
     */
    @Transactional
    public User createMinimalUser(String keycloakId, String username, String email, UserRole role) {
        log.info("Creating minimal user: {} (ID: {})", username, keycloakId);

        User user = User.builder()
                .id(keycloakId)
                .username(username)
                .firstName(username) // Use username as firstName if not available
                .lastName("") // Empty lastName
                .email(email)
                .role(role)
                .status(UserStatus.ACTIVE)
                .build();

        return userRepository.save(user);
    }
}
