package com.sav.user.domain.service;

import com.sav.user.domain.entity.User;
import com.sav.user.domain.repository.UserRepositoryPort;
import com.sav.common.enums.UserRole;
import com.sav.common.enums.UserStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class UserService {

    private final UserRepositoryPort userRepository;
    private final UserSyncService userSyncService;

    /**
     * Create or update user profile (sync with Keycloak)
     */
    @Transactional
    public User createOrUpdateUser(String keycloakId, String username, String firstName,
                                   String lastName, String email, UserRole role) {
        log.info("Creating/updating user: {} with role: {}", username, role);

        Optional<User> existingUser = userRepository.findById(keycloakId);

        if (existingUser.isPresent()) {
            // Update existing user
            User user = existingUser.get();
            user.setUsername(username);
            user.setFirstName(firstName);
            user.setLastName(lastName);
            user.setEmail(email);
            user.setRole(role);

            return userRepository.save(user);
        } else {
            // Create new user
            User user = User.builder()
                    .id(keycloakId)
                    .username(username)
                    .firstName(firstName)
                    .lastName(lastName)
                    .email(email)
                    .role(role)
                    .status(UserStatus.ACTIVE)
                    .build();

            return userRepository.save(user);
        }
    }

    /**
     * Get user by Keycloak ID
     */
    public Optional<User> getUserById(String keycloakId) {
        return userRepository.findById(keycloakId);
    }

    /**
     * Get user by username
     */
    public Optional<User> getUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    /**
     * Get user by email
     */
    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    /**
     * Get all active users
     */
    public List<User> getActiveUsers() {
        return userRepository.findByStatus(UserStatus.ACTIVE);
    }

    /**
     * Get users by role
     */
    public List<User> getUsersByRole(UserRole role) {
        return userRepository.findByRole(role);
    }

    /**
     * Get all technicians (for ticket assignment)
     */
    public List<User> getAvailableTechnicians() {
        return userRepository.findByRoleAndStatus(UserRole.TECHNICIAN, UserStatus.ACTIVE);
    }

    /**
     * Get all administrators
     */
    public List<User> getAdministrators() {
        return userRepository.findByRoleAndStatus(UserRole.ADMIN, UserStatus.ACTIVE);
    }

    /**
     * Update user profile
     */
    @Transactional
    public Optional<User> updateUserProfile(String keycloakId, String firstName, String lastName,
                                            String phoneNumber, String company, String department) {
        log.info("Updating profile for user: {}", keycloakId);

        return userRepository.findById(keycloakId)
                .map(user -> {
                    user.setFirstName(firstName);
                    user.setLastName(lastName);
                    user.setPhoneNumber(phoneNumber);
                    user.setCompany(company);
                    user.setDepartment(department);

                    return userRepository.save(user);
                });
    }

    /**
     * Update user status
     */
    @Transactional
    public Optional<User> updateUserStatus(String keycloakId, UserStatus status) {
        log.info("Updating status for user: {} to: {}", keycloakId, status);

        return userRepository.findById(keycloakId)
                .map(user -> {
                    user.setStatus(status);
                    return userRepository.save(user);
                });
    }

    /**
     * Update user role (admin only)
     */
    @Transactional
    public Optional<User> updateUserRole(String keycloakId, UserRole newRole) {
        log.info("Updating role for user: {} to: {}", keycloakId, newRole);

        return userRepository.findById(keycloakId)
                .map(user -> {
                    user.setRole(newRole);
                    return userRepository.save(user);
                });
    }

    /**
     * Check if user exists
     */
    public boolean userExists(String keycloakId) {
        return userRepository.existsById(keycloakId);
    }

    /**
     * Get user statistics
     */
    public UserStats getUserStatistics() {
        long totalUsers = userRepository.count();
        long activeUsers = userRepository.countByStatus(UserStatus.ACTIVE);
        long technicians = userRepository.countByRole(UserRole.TECHNICIAN);
        long admins = userRepository.countByRole(UserRole.ADMIN);
        long clients = userRepository.countByRole(UserRole.USER);

        return new UserStats(totalUsers, activeUsers, clients, technicians, admins);
    }

    public List<User> getUsersByStatus(UserStatus status) {
        return userRepository.findByStatus(status);
    }

    /**
     * Get or create user from Keycloak JWT token data
     * This method ensures user exists in database, creating if necessary
     * Thread-safe implementation to prevent race conditions
     */
    @Transactional
    public synchronized User getOrCreateUserFromKeycloak(String keycloakId, String username, String email, 
                                          String firstName, String lastName, String fullName, 
                                          UserRole role) {
        log.info("Getting or creating user from Keycloak: {} (ID: {})", username, keycloakId);

        // First try to get existing user
        Optional<User> existingUser = userRepository.findById(keycloakId);
        if (existingUser.isPresent()) {
            log.debug("User already exists: {}", username);
            return existingUser.get();
        }

        // User doesn't exist, create from Keycloak data
        log.info("User not found in database, creating from Keycloak data: {}", username);
        return userSyncService.syncUserFromKeycloak(keycloakId, username, email, 
                firstName, lastName, fullName, role);
    }

    /**
     * Get or create user with minimal information (fallback)
     * Used when JWT token has limited information
     * Thread-safe implementation to prevent race conditions
     */
    @Transactional
    public synchronized User getOrCreateMinimalUser(String keycloakId, String username, String email, UserRole role) {
        log.info("Getting or creating minimal user: {} (ID: {})", username, keycloakId);

        // First try to get existing user
        Optional<User> existingUser = userRepository.findById(keycloakId);
        if (existingUser.isPresent()) {
            log.debug("User already exists: {}", username);
            return existingUser.get();
        }

        // User doesn't exist, create minimal user
        log.info("User not found in database, creating minimal user: {}", username);
        return userSyncService.createMinimalUser(keycloakId, username, email, role);
    }

    /**
     * Ensure user exists in database (fallback method)
     * This is called when user tries to access the app but doesn't exist in database
     * Thread-safe implementation to prevent race conditions
     */
    @Transactional
    public synchronized User ensureUserExists(String keycloakId, String username, String email) {
        log.info("Ensuring user exists: {} (ID: {})", username, keycloakId);

        Optional<User> existingUser = userRepository.findById(keycloakId);
        if (existingUser.isPresent()) {
            return existingUser.get();
        }

        // Create user with default USER role
        log.warn("User not found in database, creating with default role: {}", username);
        return userSyncService.createMinimalUser(keycloakId, username, email, UserRole.USER);
    }

    // Inner class for statistics
    public record UserStats(long totalUsers, long activeUsers, long clients,
                            long technicians, long admins) {}
}