package com.sav.app.listener;

import com.sav.common.enums.UserRole;
import com.sav.user.domain.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Event listener for user synchronization events
 * This can be extended to listen for Keycloak events in the future
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class UserSyncEventListener {

    private final UserService userService;

    /**
     * Handle user creation event from Keycloak
     * This method can be called when Keycloak sends user creation events
     */
    @EventListener
    @Transactional
    public void handleUserCreatedEvent(UserCreatedEvent event) {
        log.info("Handling user creation event for user: {}", event.getUsername());

        try {
            // Create user in database from Keycloak event data
            userService.getOrCreateUserFromKeycloak(
                    event.getKeycloakId(),
                    event.getUsername(),
                    event.getEmail(),
                    event.getFirstName(),
                    event.getLastName(),
                    event.getFullName(),
                    event.getRole()
            );

            log.info("Successfully synchronized user from Keycloak event: {}", event.getUsername());
        } catch (Exception e) {
            log.error("Failed to synchronize user from Keycloak event: {}", event.getUsername(), e);
        }
    }

    /**
     * Handle user update event from Keycloak
     */
    @EventListener
    @Transactional
    public void handleUserUpdatedEvent(UserUpdatedEvent event) {
        log.info("Handling user update event for user: {}", event.getUsername());

        try {
            // Update user in database from Keycloak event data
            userService.getOrCreateUserFromKeycloak(
                    event.getKeycloakId(),
                    event.getUsername(),
                    event.getEmail(),
                    event.getFirstName(),
                    event.getLastName(),
                    event.getFullName(),
                    event.getRole()
            );

            log.info("Successfully synchronized user update from Keycloak event: {}", event.getUsername());
        } catch (Exception e) {
            log.error("Failed to synchronize user update from Keycloak event: {}", event.getUsername(), e);
        }
    }

    /**
     * Event class for user creation
     */
    public static class UserCreatedEvent {
        private final String keycloakId;
        private final String username;
        private final String email;
        private final String firstName;
        private final String lastName;
        private final String fullName;
        private final UserRole role;

        public UserCreatedEvent(String keycloakId, String username, String email, 
                              String firstName, String lastName, String fullName, UserRole role) {
            this.keycloakId = keycloakId;
            this.username = username;
            this.email = email;
            this.firstName = firstName;
            this.lastName = lastName;
            this.fullName = fullName;
            this.role = role;
        }

        // Getters
        public String getKeycloakId() { return keycloakId; }
        public String getUsername() { return username; }
        public String getEmail() { return email; }
        public String getFirstName() { return firstName; }
        public String getLastName() { return lastName; }
        public String getFullName() { return fullName; }
        public UserRole getRole() { return role; }
    }

    /**
     * Event class for user updates
     */
    public static class UserUpdatedEvent {
        private final String keycloakId;
        private final String username;
        private final String email;
        private final String firstName;
        private final String lastName;
        private final String fullName;
        private final UserRole role;

        public UserUpdatedEvent(String keycloakId, String username, String email, 
                              String firstName, String lastName, String fullName, UserRole role) {
            this.keycloakId = keycloakId;
            this.username = username;
            this.email = email;
            this.firstName = firstName;
            this.lastName = lastName;
            this.fullName = fullName;
            this.role = role;
        }

        // Getters
        public String getKeycloakId() { return keycloakId; }
        public String getUsername() { return username; }
        public String getEmail() { return email; }
        public String getFirstName() { return firstName; }
        public String getLastName() { return lastName; }
        public String getFullName() { return fullName; }
        public UserRole getRole() { return role; }
    }
}
