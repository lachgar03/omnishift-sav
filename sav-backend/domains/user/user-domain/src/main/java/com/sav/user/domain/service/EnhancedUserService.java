package com.sav.user.domain.service;

import com.sav.user.domain.entity.User;
import com.sav.user.domain.repository.UserRepositoryPort;
import com.sav.common.enums.UserRole;
import com.sav.common.enums.UserStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Optional;
import java.util.concurrent.locks.ReentrantLock;
import java.util.regex.Pattern;

/**
 * Enhanced User Service with improved business logic, caching, and security
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class EnhancedUserService {

    private final UserRepositoryPort userRepository;
    private final UserSyncService userSyncService;
    
    // Thread-safe lock for user creation
    private final ReentrantLock userCreationLock = new ReentrantLock();
    
    // Email validation pattern
    private static final Pattern EMAIL_PATTERN = Pattern.compile(
            "^[a-zA-Z0-9_+&*-]+(?:\\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,7}$"
    );
    
    // Username validation pattern
    private static final Pattern USERNAME_PATTERN = Pattern.compile("^[a-zA-Z0-9._-]{3,50}$");

    /**
     * Create or update user profile with enhanced validation and caching
     */
    @Transactional
    @CacheEvict(value = "users", allEntries = true)
    public User createOrUpdateUser(String keycloakId, String username, String firstName,
                                   String lastName, String email, UserRole role) {
        log.info("Creating/updating user: {} with role: {}", username, role);

        // Enhanced input validation
        validateUserInput(keycloakId, username, firstName, lastName, email, role);

        Optional<User> existingUser = userRepository.findById(keycloakId);

        if (existingUser.isPresent()) {
            // Update existing user with enhanced validation
            User user = existingUser.get();
            boolean updated = false;

            if (StringUtils.hasText(username) && !username.equals(user.getUsername())) {
                validateUsernameUniqueness(username, keycloakId);
                user.setUsername(username);
                updated = true;
            }

            if (StringUtils.hasText(firstName) && !firstName.equals(user.getFirstName())) {
                user.setFirstName(firstName);
                updated = true;
            }

            if (StringUtils.hasText(lastName) && !lastName.equals(user.getLastName())) {
                user.setLastName(lastName);
                updated = true;
            }

            if (StringUtils.hasText(email) && !email.equals(user.getEmail())) {
                validateEmailUniqueness(email, keycloakId);
                user.setEmail(email);
                updated = true;
            }

            // Enhanced role update logic
            if (role != null && shouldUpdateRole(user.getRole(), role)) {
                user.setRole(role);
                updated = true;
                log.info("Updated user role from {} to {} for user: {}", 
                        user.getRole(), role, username);
            }

            if (updated) {
                log.info("Updated user profile: {}", username);
                return userRepository.save(user);
            } else {
                log.debug("No updates needed for user: {}", username);
                return user;
            }
        } else {
            // Create new user with enhanced validation
            User user = User.builder()
                    .id(keycloakId)
                    .username(username)
                    .firstName(firstName)
                    .lastName(lastName)
                    .email(email)
                    .role(role)
                    .status(UserStatus.ACTIVE)
                    .build();

            log.info("Created new user: {} with role: {}", username, role);
            return userRepository.save(user);
        }
    }

    /**
     * Get user by Keycloak ID with caching
     */
    @Cacheable(value = "users", key = "#keycloakId")
    public Optional<User> getUserById(String keycloakId) {
        if (!StringUtils.hasText(keycloakId)) {
            return Optional.empty();
        }
        return userRepository.findById(keycloakId);
    }

    /**
     * Get user by username with caching
     */
    @Cacheable(value = "users", key = "'username:' + #username")
    public Optional<User> getUserByUsername(String username) {
        if (!StringUtils.hasText(username)) {
            return Optional.empty();
        }
        return userRepository.findByUsername(username);
    }

    /**
     * Get user by email with caching
     */
    @Cacheable(value = "users", key = "'email:' + #email")
    public Optional<User> getUserByEmail(String email) {
        if (!StringUtils.hasText(email)) {
            return Optional.empty();
        }
        return userRepository.findByEmail(email);
    }

    /**
     * Get all active users with caching
     */
    @Cacheable(value = "users", key = "'active'")
    public List<User> getActiveUsers() {
        return userRepository.findByStatus(UserStatus.ACTIVE);
    }

    /**
     * Get users by role with caching
     */
    @Cacheable(value = "users", key = "'role:' + #role")
    public List<User> getUsersByRole(UserRole role) {
        if (role == null) {
            return List.of();
        }
        return userRepository.findByRole(role);
    }

    /**
     * Get all technicians (for ticket assignment) with caching
     */
    @Cacheable(value = "users", key = "'technicians'")
    public List<User> getAvailableTechnicians() {
        return userRepository.findByRoleAndStatus(UserRole.TECHNICIAN, UserStatus.ACTIVE);
    }

    /**
     * Get all administrators with caching
     */
    @Cacheable(value = "users", key = "'admins'")
    public List<User> getAdministrators() {
        return userRepository.findByRoleAndStatus(UserRole.ADMIN, UserStatus.ACTIVE);
    }

    /**
     * Update user profile with enhanced validation
     */
    @Transactional
    @CacheEvict(value = "users", allEntries = true)
    public Optional<User> updateUserProfile(String keycloakId, String firstName, String lastName,
                                            String phoneNumber, String company, String department) {
        log.info("Updating profile for user: {}", keycloakId);

        if (!StringUtils.hasText(keycloakId)) {
            throw new IllegalArgumentException("User ID cannot be null or empty");
        }

        return userRepository.findById(keycloakId)
                .map(user -> {
                    boolean updated = false;

                    if (StringUtils.hasText(firstName) && !firstName.equals(user.getFirstName())) {
                        validateName(firstName, "First name");
                        user.setFirstName(firstName);
                        updated = true;
                    }

                    if (StringUtils.hasText(lastName) && !lastName.equals(user.getLastName())) {
                        validateName(lastName, "Last name");
                        user.setLastName(lastName);
                        updated = true;
                    }

                    if (phoneNumber != null && !phoneNumber.equals(user.getPhoneNumber())) {
                        validatePhoneNumber(phoneNumber);
                        user.setPhoneNumber(phoneNumber);
                        updated = true;
                    }

                    if (company != null && !company.equals(user.getCompany())) {
                        user.setCompany(company);
                        updated = true;
                    }

                    if (department != null && !department.equals(user.getDepartment())) {
                        user.setDepartment(department);
                        updated = true;
                    }

                    if (updated) {
                        log.info("Updated profile for user: {}", keycloakId);
                        return userRepository.save(user);
                    } else {
                        log.debug("No profile updates needed for user: {}", keycloakId);
                        return user;
                    }
                });
    }

    /**
     * Update user status with enhanced validation
     */
    @Transactional
    @CacheEvict(value = "users", allEntries = true)
    public Optional<User> updateUserStatus(String keycloakId, UserStatus status) {
        log.info("Updating status for user: {} to: {}", keycloakId, status);

        if (!StringUtils.hasText(keycloakId)) {
            throw new IllegalArgumentException("User ID cannot be null or empty");
        }
        if (status == null) {
            throw new IllegalArgumentException("Status cannot be null");
        }

        return userRepository.findById(keycloakId)
                .map(user -> {
                    UserStatus oldStatus = user.getStatus();
                    
                    // Validate status transition
                    if (!isValidStatusTransition(oldStatus, status)) {
                        throw new IllegalStateException("Invalid status transition from " + oldStatus + " to " + status);
                    }

                    user.setStatus(status);
                    log.info("Updated status for user: {} from {} to {}", keycloakId, oldStatus, status);
                    return userRepository.save(user);
                });
    }

    /**
     * Update user role with enhanced validation (admin only)
     */
    @Transactional
    @CacheEvict(value = "users", allEntries = true)
    public Optional<User> updateUserRole(String keycloakId, UserRole newRole) {
        log.info("Updating role for user: {} to: {}", keycloakId, newRole);

        if (!StringUtils.hasText(keycloakId)) {
            throw new IllegalArgumentException("User ID cannot be null or empty");
        }
        if (newRole == null) {
            throw new IllegalArgumentException("Role cannot be null");
        }

        return userRepository.findById(keycloakId)
                .map(user -> {
                    UserRole oldRole = user.getRole();
                    
                    // Validate role transition
                    if (!isValidRoleTransition(oldRole, newRole)) {
                        throw new IllegalStateException("Invalid role transition from " + oldRole + " to " + newRole);
                    }

                    user.setRole(newRole);
                    log.info("Updated role for user: {} from {} to {}", keycloakId, oldRole, newRole);
                    return userRepository.save(user);
                });
    }

    /**
     * Check if user exists
     */
    public boolean userExists(String keycloakId) {
        if (!StringUtils.hasText(keycloakId)) {
            return false;
        }
        return userRepository.existsById(keycloakId);
    }

    /**
     * Get user statistics with caching
     */
    @Cacheable(value = "userStats", key = "'stats'")
    public UserStats getUserStatistics() {
        long totalUsers = userRepository.count();
        long activeUsers = userRepository.countByStatus(UserStatus.ACTIVE);
        long technicians = userRepository.countByRole(UserRole.TECHNICIAN);
        long admins = userRepository.countByRole(UserRole.ADMIN);
        long clients = userRepository.countByRole(UserRole.USER);

        return new UserStats(totalUsers, activeUsers, clients, technicians, admins);
    }

    /**
     * Get users by status with caching
     */
    @Cacheable(value = "users", key = "'status:' + #status")
    public List<User> getUsersByStatus(UserStatus status) {
        if (status == null) {
            return List.of();
        }
        return userRepository.findByStatus(status);
    }

    /**
     * Get or create user from Keycloak JWT token data with enhanced thread safety
     */
    @Transactional
    public User getOrCreateUserFromKeycloak(String keycloakId, String username, String email, 
                                          String firstName, String lastName, String fullName, 
                                          UserRole role) {
        log.info("Getting or creating user from Keycloak: {} (ID: {})", username, keycloakId);

        userCreationLock.lock();
        try {
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
        } finally {
            userCreationLock.unlock();
        }
    }

    /**
     * Get or create user with minimal information (fallback) with enhanced thread safety
     */
    @Transactional
    public User getOrCreateMinimalUser(String keycloakId, String username, String email, UserRole role) {
        log.info("Getting or creating minimal user: {} (ID: {})", username, keycloakId);

        userCreationLock.lock();
        try {
            // First try to get existing user
            Optional<User> existingUser = userRepository.findById(keycloakId);
            if (existingUser.isPresent()) {
                log.debug("User already exists: {}", username);
                return existingUser.get();
            }

            // User doesn't exist, create minimal user
            log.info("User not found in database, creating minimal user: {}", username);
            return userSyncService.createMinimalUser(keycloakId, username, email, role);
        } finally {
            userCreationLock.unlock();
        }
    }

    /**
     * Ensure user exists in database (fallback method) with enhanced thread safety
     */
    @Transactional
    public User ensureUserExists(String keycloakId, String username, String email) {
        log.info("Ensuring user exists: {} (ID: {})", username, keycloakId);

        userCreationLock.lock();
        try {
            Optional<User> existingUser = userRepository.findById(keycloakId);
            if (existingUser.isPresent()) {
                return existingUser.get();
            }

            // Create user with default USER role
            log.warn("User not found in database, creating with default role: {}", username);
            return userSyncService.createMinimalUser(keycloakId, username, email, UserRole.USER);
        } finally {
            userCreationLock.unlock();
        }
    }

    /**
     * Search users by criteria with enhanced filtering
     */
    public List<User> searchUsers(String query, UserRole role, UserStatus status) {
        if (!StringUtils.hasText(query)) {
            return List.of();
        }

        // This would need to be implemented in the repository
        // For now, return empty list
        return List.of();
    }

    /**
     * Get user workload statistics
     */
    public UserWorkloadStats getUserWorkloadStats(String userId) {
        if (!StringUtils.hasText(userId)) {
            return new UserWorkloadStats(0, 0, 0, 0);
        }

        // This would need to be implemented with ticket counts
        // For now, return default values
        return new UserWorkloadStats(0, 0, 0, 0);
    }

    // Enhanced validation methods

    private void validateUserInput(String keycloakId, String username, String firstName, 
                                 String lastName, String email, UserRole role) {
        if (!StringUtils.hasText(keycloakId)) {
            throw new IllegalArgumentException("Keycloak ID is required");
        }
        if (!StringUtils.hasText(username)) {
            throw new IllegalArgumentException("Username is required");
        }
        if (!StringUtils.hasText(firstName)) {
            throw new IllegalArgumentException("First name is required");
        }
        if (!StringUtils.hasText(lastName)) {
            throw new IllegalArgumentException("Last name is required");
        }
        if (!StringUtils.hasText(email)) {
            throw new IllegalArgumentException("Email is required");
        }
        if (role == null) {
            throw new IllegalArgumentException("Role is required");
        }

        validateUsername(username);
        validateEmail(email);
        validateName(firstName, "First name");
        validateName(lastName, "Last name");
    }

    private void validateUsername(String username) {
        if (!StringUtils.hasText(username)) {
            throw new IllegalArgumentException("Username cannot be null or empty");
        }
        if (!USERNAME_PATTERN.matcher(username).matches()) {
            throw new IllegalArgumentException("Username must be 3-50 characters and contain only letters, numbers, dots, underscores, and hyphens");
        }
    }

    private void validateEmail(String email) {
        if (!StringUtils.hasText(email)) {
            throw new IllegalArgumentException("Email cannot be null or empty");
        }
        if (!EMAIL_PATTERN.matcher(email).matches()) {
            throw new IllegalArgumentException("Invalid email format");
        }
    }

    private void validateName(String name, String fieldName) {
        if (!StringUtils.hasText(name)) {
            throw new IllegalArgumentException(fieldName + " cannot be null or empty");
        }
        if (name.trim().length() < 2) {
            throw new IllegalArgumentException(fieldName + " must be at least 2 characters long");
        }
        if (name.trim().length() > 50) {
            throw new IllegalArgumentException(fieldName + " cannot exceed 50 characters");
        }
    }

    private void validatePhoneNumber(String phoneNumber) {
        if (StringUtils.hasText(phoneNumber)) {
            // Basic phone number validation
            if (phoneNumber.length() < 10 || phoneNumber.length() > 15) {
                throw new IllegalArgumentException("Phone number must be between 10 and 15 characters");
            }
        }
    }

    private void validateUsernameUniqueness(String username, String excludeUserId) {
        Optional<User> existingUser = userRepository.findByUsername(username);
        if (existingUser.isPresent() && !existingUser.get().getId().equals(excludeUserId)) {
            throw new IllegalArgumentException("Username already exists: " + username);
        }
    }

    private void validateEmailUniqueness(String email, String excludeUserId) {
        Optional<User> existingUser = userRepository.findByEmail(email);
        if (existingUser.isPresent() && !existingUser.get().getId().equals(excludeUserId)) {
            throw new IllegalArgumentException("Email already exists: " + email);
        }
    }

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

    private int getRoleLevel(UserRole role) {
        return switch (role) {
            case USER -> 1;
            case TECHNICIAN -> 2;
            case ADMIN -> 3;
        };
    }

    private boolean isValidStatusTransition(UserStatus from, UserStatus to) {
        if (from == null || to == null) {
            return false;
        }

        // Define valid status transitions
        return switch (from) {
            case PENDING_ACTIVATION -> to == UserStatus.ACTIVE || to == UserStatus.INACTIVE;
            case ACTIVE -> to == UserStatus.INACTIVE || to == UserStatus.SUSPENDED;
            case INACTIVE -> to == UserStatus.ACTIVE || to == UserStatus.SUSPENDED;
            case SUSPENDED -> to == UserStatus.ACTIVE || to == UserStatus.INACTIVE;
        };
    }

    private boolean isValidRoleTransition(UserRole from, UserRole to) {
        if (from == null || to == null) {
            return true;
        }

        // Only allow upgrading roles, not downgrading
        return getRoleLevel(to) >= getRoleLevel(from);
    }

    // Inner classes for statistics

    public record UserStats(long totalUsers, long activeUsers, long clients,
                            long technicians, long admins) {
        public double getActiveUserPercentage() {
            if (totalUsers == 0) return 0.0;
            return (double) activeUsers / totalUsers * 100;
        }
    }

    public record UserWorkloadStats(long assignedTickets, long completedTickets, 
                                   long overdueTickets, long averageResolutionTime) {
        public double getCompletionRate() {
            if (assignedTickets == 0) return 0.0;
            return (double) completedTickets / assignedTickets * 100;
        }
    }
}
