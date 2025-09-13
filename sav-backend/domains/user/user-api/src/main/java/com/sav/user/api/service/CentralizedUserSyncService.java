package com.sav.user.api.service;

import com.sav.common.dto.KeycloakUserInfo;
import com.sav.common.enums.UserRole;
import com.sav.security.util.AuthUtil;
import com.sav.security.util.JwtTokenParser;
import com.sav.user.domain.entity.User;
import com.sav.user.domain.service.UserSyncService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.concurrent.locks.ReentrantLock;

/**
 * Centralized service for handling all user synchronization and JWT-based user creation
 * This service consolidates all user creation logic from controllers
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class CentralizedUserSyncService {

    private final UserSyncService userSyncService;
    private final JwtTokenParser jwtTokenParser;
    
    // Thread-safe locks for user creation to prevent race conditions
    private final Map<String, ReentrantLock> userCreationLocks = new java.util.concurrent.ConcurrentHashMap<>();

    /**
     * Get or create user from JWT token with automatic fallback
     * This is the main entry point for user creation from JWT data
     */
    @Transactional
    public User getOrCreateUserFromJwt(Authentication authentication) {
        String userId = AuthUtil.extractUserIdFromAuth(authentication);
        if (userId == null) {
            log.error("No user ID found in JWT token");
            throw new IllegalArgumentException("No user ID found in JWT token");
        }

        log.info("Getting or creating user from JWT for ID: {}", userId);

        // First try to get existing user
        return userSyncService.getUserByKeycloakId(userId)
                .orElseGet(() -> createUserFromJwtToken(authentication, userId));
    }

    /**
     * Create user from JWT token data with comprehensive fallback logic
     */
    @Transactional
    public User createUserFromJwtToken(Authentication authentication, String userId) {
        // Use thread-safe locking to prevent duplicate user creation
        ReentrantLock lock = userCreationLocks.computeIfAbsent(userId, k -> new ReentrantLock());
        
        try {
            lock.lock();
            
            // Double-check if user was created by another thread
            return userSyncService.getUserByKeycloakId(userId)
                    .orElseGet(() -> performUserCreation(authentication, userId));
                    
        } finally {
            lock.unlock();
            // Clean up lock if no longer needed
            if (!lock.hasQueuedThreads()) {
                userCreationLocks.remove(userId);
            }
        }
    }

    /**
     * Perform the actual user creation with comprehensive fallback logic
     */
    private User performUserCreation(Authentication authentication, String userId) {
        try {
            // Try full JWT parsing first
            KeycloakUserInfo userInfo = jwtTokenParser.parseUserInfo(authentication);
            
            if (userInfo != null && userInfo.isValid()) {
                log.info("Creating user with full JWT information: {}", userInfo.getUsername());
                return userSyncService.syncUserFromKeycloak(
                        userInfo.getId(),
                        userInfo.getUsername(),
                        userInfo.getEmail(),
                        userInfo.getFirstName(),
                        userInfo.getLastName(),
                        userInfo.getFullName(),
                        userInfo.getMappedRole()
                );
            }
        } catch (Exception e) {
            log.warn("Failed to parse full JWT user info for user: {}, trying fallback", userId, e);
        }

        // Fallback to basic JWT claims extraction
        try {
            String username = AuthUtil.extractUsernameFromAuth(authentication);
            String email = AuthUtil.extractEmailFromAuth(authentication);
            UserRole role = extractRoleFromAuth(authentication);

            if (username != null && email != null) {
                log.info("Creating minimal user from basic JWT claims: {}", username);
                return userSyncService.createMinimalUser(userId, username, email, role);
            }
        } catch (Exception e) {
            log.error("Failed to extract basic JWT claims for user: {}", userId, e);
        }

        // Last resort: create user with minimal information
        log.warn("Creating emergency fallback user for ID: {}", userId);
        return userSyncService.createMinimalUser(
                userId, 
                "user_" + userId, 
                "unknown@example.com", 
                UserRole.USER
        );
    }

    /**
     * Force sync user from JWT token (admin/debug operation)
     */
    @Transactional
    public User forceSyncUserFromJwt(Authentication authentication) {
        String userId = AuthUtil.extractUserIdFromAuth(authentication);
        if (userId == null) {
            throw new IllegalArgumentException("No user ID found in JWT token");
        }

        log.info("Force syncing user: {}", userId);

        KeycloakUserInfo userInfo = jwtTokenParser.parseUserInfo(authentication);
        if (userInfo == null || !userInfo.isValid()) {
            throw new IllegalArgumentException("Invalid user information in JWT token");
        }

        return userSyncService.syncUserFromKeycloak(
                userInfo.getId(),
                userInfo.getUsername(),
                userInfo.getEmail(),
                userInfo.getFirstName(),
                userInfo.getLastName(),
                userInfo.getFullName(),
                userInfo.getMappedRole()
        );
    }

    /**
     * Create minimal user from basic JWT claims (debug/testing operation)
     */
    @Transactional
    public User createMinimalUserFromJwt(Authentication authentication) {
        String userId = AuthUtil.extractUserIdFromAuth(authentication);
        String username = AuthUtil.extractUsernameFromAuth(authentication);
        String email = AuthUtil.extractEmailFromAuth(authentication);

        if (userId == null || username == null || email == null) {
            throw new IllegalArgumentException("Missing required JWT claims for minimal user creation");
        }

        UserRole role = extractRoleFromAuth(authentication);
        return userSyncService.createMinimalUser(userId, username, email, role);
    }

    /**
     * Check if user exists in database
     */
    public boolean userExists(String userId) {
        return userSyncService.userExists(userId);
    }

    /**
     * Get JWT token information for debugging
     */
    public Map<String, Object> getTokenInfo(Authentication authentication) {
        return Map.of(
                "userId", AuthUtil.extractUserIdFromAuth(authentication),
                "username", AuthUtil.extractUsernameFromAuth(authentication),
                "email", AuthUtil.extractEmailFromAuth(authentication),
                "roles", AuthUtil.extractRolesFromAuth(authentication),
                "fullName", AuthUtil.extractFullNameFromAuth(authentication),
                "allClaims", jwtTokenParser.getAllClaims(authentication)
        );
    }

    /**
     * Get parsed user information from JWT for debugging
     */
    public KeycloakUserInfo getParsedUserInfo(Authentication authentication) {
        return jwtTokenParser.parseUserInfo(authentication);
    }

    /**
     * Extract user role from authentication with fallback
     */
    private UserRole extractRoleFromAuth(Authentication authentication) {
        try {
            KeycloakUserInfo userInfo = jwtTokenParser.parseUserInfo(authentication);
            if (userInfo != null && userInfo.getMappedRole() != null) {
                return userInfo.getMappedRole();
            }
        } catch (Exception e) {
            log.debug("Failed to extract role from parsed user info, using basic extraction", e);
        }

        // Fallback to basic role extraction
        try {
            var roles = AuthUtil.extractRolesFromAuth(authentication);
            if (roles != null && !roles.isEmpty()) {
                String roleString = roles.get(0).toUpperCase();
                return switch (roleString) {
                    case "ADMIN" -> UserRole.ADMIN;
                    case "TECHNICIAN" -> UserRole.TECHNICIAN;
                    default -> UserRole.USER;
                };
            }
        } catch (Exception e) {
            log.debug("Failed to extract role from basic auth, using default USER role", e);
        }

        return UserRole.USER;
    }
}
