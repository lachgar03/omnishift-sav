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

    // Inner class for statistics
    public record UserStats(long totalUsers, long activeUsers, long clients,
                            long technicians, long admins) {}
}