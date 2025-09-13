package com.sav.user.api.controller;

import com.sav.security.util.AuthUtil;
import com.sav.user.api.dto.UserResponse;
import com.sav.user.api.mapper.UserMapper;
import com.sav.user.domain.entity.User;
import com.sav.user.api.service.CentralizedUserSyncService;
import com.sav.common.dto.KeycloakUserInfo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/users/sync")
@RequiredArgsConstructor
@Slf4j
public class UserSyncController {

    private final CentralizedUserSyncService centralizedUserSyncService;
    private final UserMapper userMapper;

    /**
     * Debug endpoint to get JWT token information
     */
    @GetMapping("/token-info")
    @PreAuthorize("hasAnyRole('USER','TECHNICIAN','ADMIN')")
    public ResponseEntity<Map<String, Object>> getTokenInfo(Authentication authentication) {
        log.info("Getting JWT token information for debugging");
        try {
            Map<String, Object> tokenInfo = centralizedUserSyncService.getTokenInfo(authentication);
            return ResponseEntity.ok(tokenInfo);
        } catch (Exception e) {
            log.error("Error extracting token information", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Debug endpoint to get parsed user information from JWT
     */
    @GetMapping("/user-info")
    @PreAuthorize("hasAnyRole('USER','TECHNICIAN','ADMIN')")
    public ResponseEntity<KeycloakUserInfo> getUserInfo(Authentication authentication) {
        log.info("Getting parsed user information from JWT token");
        try {
            KeycloakUserInfo userInfo = centralizedUserSyncService.getParsedUserInfo(authentication);
            if (userInfo == null) {
                return ResponseEntity.badRequest().build();
            }
            return ResponseEntity.ok(userInfo);
        } catch (Exception e) {
            log.error("Error parsing user information from JWT", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Force user sync for current user (Admin/Debug operation)
     */
    @PostMapping("/force-sync")
    @PreAuthorize("hasAnyRole('TECHNICIAN','ADMIN')")
    public ResponseEntity<UserResponse> forceUserSync(Authentication authentication) {
        log.info("Force syncing user from JWT token");
        try {
            User user = centralizedUserSyncService.forceSyncUserFromJwt(authentication);
            log.info("Successfully force synced user: {}", user.getUsername());
            return ResponseEntity.ok(userMapper.toResponse(user));
        } catch (Exception e) {
            log.error("Error force syncing user", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Check if current user exists in database (Debug operation)
     */
    @GetMapping("/exists")
    @PreAuthorize("hasAnyRole('TECHNICIAN','ADMIN')")
    public ResponseEntity<Map<String, Object>> checkUserExists(Authentication authentication) {
        String userId = AuthUtil.extractUserIdFromAuth(authentication);
        if (userId == null) {
            return ResponseEntity.badRequest().build();
        }

        log.info("Checking if user exists: {}", userId);
        try {
            boolean exists = centralizedUserSyncService.userExists(userId);
            String username = AuthUtil.extractUsernameFromAuth(authentication);
            Map<String, Object> result = Map.of(
                    "userId", userId,
                    "username", username != null ? username : "unknown",
                    "exists", exists
            );
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Error checking user existence: {}", userId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Create minimal user for testing (Debug operation)
     */
    @PostMapping("/create-minimal")
    @PreAuthorize("hasAnyRole('TECHNICIAN','ADMIN')")
    public ResponseEntity<UserResponse> createMinimalUser(Authentication authentication) {
        log.info("Creating minimal user from JWT token");
        try {
            User user = centralizedUserSyncService.createMinimalUserFromJwt(authentication);
            return ResponseEntity.ok(userMapper.toResponse(user));
        } catch (Exception e) {
            log.error("Error creating minimal user", e);
            return ResponseEntity.internalServerError().build();
        }
    }
}
