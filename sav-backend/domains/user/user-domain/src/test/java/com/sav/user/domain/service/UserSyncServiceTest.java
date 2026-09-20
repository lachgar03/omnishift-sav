package com.sav.user.domain.service;

import com.sav.common.enums.UserRole;
import com.sav.common.enums.UserStatus;
import com.sav.user.domain.entity.User;
import com.sav.user.domain.repository.UserRepositoryPort;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserSyncServiceTest {

    @Mock
    private UserRepositoryPort userRepository;

    @InjectMocks
    private UserSyncService userSyncService;

    @Test
    @DisplayName("Should create user from Keycloak data when not existing")
    void syncUserFromKeycloak_NewUser_Creates() {
        when(userRepository.findById("kc-123")).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));

        User synced = userSyncService.syncUserFromKeycloak(
                "kc-123",
                "kc_user",
                "kc@sav.com",
                "First",
                "Last",
                "First Last",
                UserRole.USER
        );

        assertThat(synced).isNotNull();
        assertThat(synced.getId()).isEqualTo("kc-123");
        assertThat(synced.getUsername()).isEqualTo("kc_user");
        assertThat(synced.getEmail()).isEqualTo("kc@sav.com");
        assertThat(synced.getRole()).isEqualTo(UserRole.USER);
        assertThat(synced.getStatus()).isEqualTo(UserStatus.ACTIVE);
    }

    @Test
    @DisplayName("Should upgrade role from USER to TECHNICIAN on sync")
    void syncUserFromKeycloak_RoleUpgrade_Upgrades() {
        User existing = User.builder()
                .id("kc-123")
                .username("kc_user")
                .email("kc@sav.com")
                .role(UserRole.USER)
                .status(UserStatus.ACTIVE)
                .build();

        when(userRepository.findById("kc-123")).thenReturn(Optional.of(existing));
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));

        User synced = userSyncService.syncUserFromKeycloak(
                "kc-123",
                "kc_user",
                "kc@sav.com",
                "First",
                "Last",
                "First Last",
                UserRole.TECHNICIAN
        );

        assertThat(synced.getRole()).isEqualTo(UserRole.TECHNICIAN);
    }

    @Test
    @DisplayName("Should not downgrade role from ADMIN to USER on sync")
    void syncUserFromKeycloak_RoleDowngrade_KeepsHigherRole() {
        User existing = User.builder()
                .id("kc-admin")
                .username("admin")
                .email("admin@sav.com")
                .role(UserRole.ADMIN)
                .status(UserStatus.ACTIVE)
                .build();

        when(userRepository.findById("kc-admin")).thenReturn(Optional.of(existing));

        User synced = userSyncService.syncUserFromKeycloak(
                "kc-admin",
                "admin",
                "admin@sav.com",
                null,
                null,
                null,
                UserRole.USER
        );

        assertThat(synced.getRole()).isEqualTo(UserRole.ADMIN);
        verify(userRepository, never()).save(any());
    }
}
