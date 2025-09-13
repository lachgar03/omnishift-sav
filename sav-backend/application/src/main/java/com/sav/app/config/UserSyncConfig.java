package com.sav.app.config;

import com.sav.common.enums.UserRole;
import com.sav.common.dto.KeycloakUserInfo;
import com.sav.user.domain.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;


@Component
@RequiredArgsConstructor
@Slf4j
public class UserSyncConfig {

    private final UserService userService;

    @EventListener(ApplicationReadyEvent.class)
    @Order(100)
    public void initializeUserSync() {
        log.info("Initializing user synchronization system");
        
        try {

            log.info("User sync system initialized successfully");
            log.info("Automatic user creation is enabled for JWT token authentication");
            log.info("Fallback user creation is enabled for missing users");
            
        } catch (Exception e) {
            log.error("Error initializing user sync system", e);
        }
    }


    public void syncUserFromKeycloak(KeycloakUserInfo userInfo) {
        if (userInfo == null || !userInfo.isValid()) {
            log.warn("Invalid user information provided for sync");
            return;
        }

        try {
            log.info("Syncing user from external Keycloak data: {}", userInfo.getUsername());

            userService.getOrCreateUserFromKeycloak(
                    userInfo.getId(),
                    userInfo.getUsername(),
                    userInfo.getEmail(),
                    userInfo.getFirstName(),
                    userInfo.getLastName(),
                    userInfo.getFullName(),
                    userInfo.getMappedRole()
            );

            log.info("Successfully synced user: {}", userInfo.getUsername());
        } catch (Exception e) {
            log.error("Failed to sync user from Keycloak data: {}", userInfo.getUsername(), e);
        }
    }


    public void createMinimalUser(String keycloakId, String username, String email, UserRole role) {
        try {
            log.info("Creating minimal user: {} (ID: {})", username, keycloakId);

            userService.getOrCreateMinimalUser(keycloakId, username, email, role);

            log.info("Successfully created minimal user: {}", username);
        } catch (Exception e) {
            log.error("Failed to create minimal user: {}", username, e);
        }
    }
}
