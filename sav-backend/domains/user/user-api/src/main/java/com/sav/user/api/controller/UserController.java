package com.sav.user.api.controller;

import com.sav.common.enums.UserRole;
import com.sav.common.enums.UserStatus;
import com.sav.security.util.AuthUtil;
import com.sav.user.api.dto.*;
import com.sav.user.api.mapper.UserMapper;
import com.sav.user.domain.entity.User;
import com.sav.user.domain.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@Slf4j
public class UserController {

    private final UserService userService;
    private final UserMapper userMapper;

    /**
     * Get current user profile
     */
    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('USER', 'TECHNICIAN', 'ADMIN')")
    public ResponseEntity<UserResponse> getCurrentUser(Authentication authentication) {
        String userId = AuthUtil.extractUserIdFromAuth(authentication);
        if (userId == null) {
            return ResponseEntity.badRequest().build();
        }

        return userService.getUserById(userId)
                .map(user -> ResponseEntity.ok(userMapper.toResponse(user)))
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Update current user profile
     */
    @PutMapping("/me")
    @PreAuthorize("hasAnyRole('USER', 'TECHNICIAN', 'ADMIN')")
    public ResponseEntity<UserResponse> updateCurrentUser(
            @Valid @RequestBody UpdateUserProfileRequest request,
            Authentication authentication) {

        String userId = AuthUtil.extractUserIdFromAuth(authentication);
        if (userId == null) {
            return ResponseEntity.badRequest().build();
        }

        log.info("Updating profile for user: {}", userId);

        return userService.updateUserProfile(
                        userId,
                        request.getFirstName(),
                        request.getLastName(),
                        request.getPhoneNumber(),
                        request.getCompany(),
                        request.getDepartment()
                )
                .map(user -> ResponseEntity.ok(userMapper.toResponse(user)))
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Create new user - Admin only
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> createUser(@Valid @RequestBody CreateUserRequest request) {
        log.info("Creating new user: {}", request.getUsername());

        // Generate a placeholder Keycloak ID (in real implementation, this would come from Keycloak)
        String keycloakId = java.util.UUID.randomUUID().toString();

        User user = userService.createOrUpdateUser(
                keycloakId,
                request.getUsername(),
                request.getFirstName(),
                request.getLastName(),
                request.getEmail(),
                request.getRole()
        );

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(userMapper.toResponse(user));
    }

    /**
     * Get all users - Technician and Admin only
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('TECHNICIAN', 'ADMIN')")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        List<User> users = userService.getActiveUsers();
        List<UserResponse> response = userMapper.toResponseList(users);
        return ResponseEntity.ok(response);
    }

    /**
     * Get user by ID - Technician and Admin only
     */
    @GetMapping("/{userId}")
    @PreAuthorize("hasAnyRole('TECHNICIAN', 'ADMIN')")
    public ResponseEntity<UserResponse> getUserById(
            @PathVariable(name = "userId") String userId) {
        return userService.getUserById(userId)
                .map(user -> ResponseEntity.ok(userMapper.toResponse(user)))
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get available technicians - Technician and Admin only
     */
    @GetMapping("/technicians")
    @PreAuthorize("hasAnyRole('TECHNICIAN', 'ADMIN')")
    public ResponseEntity<List<UserResponse>> getAvailableTechnicians() {
        List<User> technicians = userService.getAvailableTechnicians();
        List<UserResponse> response = userMapper.toResponseList(technicians);
        return ResponseEntity.ok(response);
    }

    /**
     * Get users by role - Admin only
     */
    @GetMapping("/role/{role}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserResponse>> getUsersByRole(
            @PathVariable(name = "role") UserRole role) {
        List<User> users = userService.getUsersByRole(role);
        List<UserResponse> response = userMapper.toResponseList(users);
        return ResponseEntity.ok(response);
    }

    /**
     * Update user role - Admin only
     */
    @PutMapping("/{userId}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> updateUserRole(
            @PathVariable(name = "userId") String userId,
            @Valid @RequestBody UpdateUserRoleRequest request) {

        log.info("Updating role for user: {} to: {}", userId, request.getRole());

        return userService.updateUserRole(userId, request.getRole())
                .map(user -> ResponseEntity.ok(userMapper.toResponse(user)))
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Update user status - Admin only
     */
    @PutMapping("/{userId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> updateUserStatus(
            @PathVariable(name = "userId") String userId,
            @Valid @RequestBody UpdateUserStatusRequest request) {

        log.info("Updating status for user: {} to: {}", userId, request.getStatus());

        return userService.updateUserStatus(userId, request.getStatus())
                .map(user -> ResponseEntity.ok(userMapper.toResponse(user)))
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get user statistics - Admin only
     */
    @GetMapping("/statistics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserStatsResponse> getUserStatistics() {
        UserService.UserStats stats = userService.getUserStatistics();
        UserStatsResponse response = userMapper.toStatsResponse(stats);
        return ResponseEntity.ok(response);
    }

    /**
     * Activate user - Admin only
     */
    @PatchMapping("/{userId}/activate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> activateUser(
            @PathVariable(name = "userId") String userId) {

        log.info("Activating user: {}", userId);

        return userService.updateUserStatus(userId, UserStatus.ACTIVE)
                .map(user -> ResponseEntity.ok(userMapper.toResponse(user)))
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Deactivate user - Admin only
     */
    @PatchMapping("/{userId}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserResponse> deactivateUser(
            @PathVariable(name = "userId") String userId) {

        log.info("Deactivating user: {}", userId);

        return userService.updateUserStatus(userId, UserStatus.INACTIVE)
                .map(user -> ResponseEntity.ok(userMapper.toResponse(user)))
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get users by status - Admin only
     */
    @GetMapping("/status/{status}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserResponse>> getUsersByStatus(
            @PathVariable(name = "status") UserStatus status) {
        List<User> users = userService.getUsersByStatus(status);
        List<UserResponse> response = userMapper.toResponseList(users);
        return ResponseEntity.ok(response);
    }

    /**
     * Search users by username - Technician and Admin only
     */
    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('TECHNICIAN', 'ADMIN')")
    public ResponseEntity<UserResponse> searchUserByUsername(
            @RequestParam(name = "username") String username) {
        return userService.getUserByUsername(username)
                .map(user -> ResponseEntity.ok(userMapper.toResponse(user)))
                .orElse(ResponseEntity.notFound().build());
    }
}