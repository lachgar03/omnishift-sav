package com.sav.user.domain.service;

import com.sav.common.enums.UserRole;
import com.sav.common.enums.UserStatus;
import com.sav.user.domain.entity.User;
import com.sav.user.domain.repository.UserRepositoryPort;
import org.junit.jupiter.api.BeforeEach;
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
class UserServiceTest {

    @Mock
    private UserRepositoryPort userRepository;

    @Mock
    private UserSyncService userSyncService;

    @InjectMocks
    private UserService userService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = User.builder()
                .id("kc-user-001")
                .username("john_doe")
                .firstName("John")
                .lastName("Doe")
                .email("john@sav.com")
                .role(UserRole.USER)
                .status(UserStatus.ACTIVE)
                .build();
    }

    @Test
    @DisplayName("Should create new user if user does not exist")
    void createOrUpdateUser_NewUser_CreatesSuccessfully() {
        when(userRepository.findById("kc-user-001")).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));

        User created = userService.createOrUpdateUser(
                "kc-user-001",
                "john_doe",
                "John",
                "Doe",
                "john@sav.com",
                UserRole.USER
        );

        assertThat(created).isNotNull();
        assertThat(created.getId()).isEqualTo("kc-user-001");
        assertThat(created.getUsername()).isEqualTo("john_doe");
        assertThat(created.getStatus()).isEqualTo(UserStatus.ACTIVE);
        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("Should update existing user profile fields")
    void createOrUpdateUser_ExistingUser_UpdatesSuccessfully() {
        when(userRepository.findById("kc-user-001")).thenReturn(Optional.of(sampleUser));
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));

        User updated = userService.createOrUpdateUser(
                "kc-user-001",
                "john_updated",
                "Johnny",
                "Doe",
                "john.new@sav.com",
                UserRole.TECHNICIAN
        );

        assertThat(updated.getUsername()).isEqualTo("john_updated");
        assertThat(updated.getFirstName()).isEqualTo("Johnny");
        assertThat(updated.getEmail()).isEqualTo("john.new@sav.com");
        assertThat(updated.getRole()).isEqualTo(UserRole.TECHNICIAN);
    }

    @Test
    @DisplayName("Should update user profile additional info")
    void updateUserProfile_Success() {
        when(userRepository.findById("kc-user-001")).thenReturn(Optional.of(sampleUser));
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));

        Optional<User> updated = userService.updateUserProfile(
                "kc-user-001",
                "John",
                "Smith",
                "+1-555-1234",
                "SAV Corp",
                "Customer Support"
        );

        assertThat(updated).isPresent();
        assertThat(updated.get().getLastName()).isEqualTo("Smith");
        assertThat(updated.get().getPhoneNumber()).isEqualTo("+1-555-1234");
        assertThat(updated.get().getCompany()).isEqualTo("SAV Corp");
    }

    @Test
    @DisplayName("Should update user status")
    void updateUserStatus_Success() {
        when(userRepository.findById("kc-user-001")).thenReturn(Optional.of(sampleUser));
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));

        Optional<User> updated = userService.updateUserStatus("kc-user-001", UserStatus.SUSPENDED);

        assertThat(updated).isPresent();
        assertThat(updated.get().getStatus()).isEqualTo(UserStatus.SUSPENDED);
    }

    @Test
    @DisplayName("Should update user role")
    void updateUserRole_Success() {
        when(userRepository.findById("kc-user-001")).thenReturn(Optional.of(sampleUser));
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));

        Optional<User> updated = userService.updateUserRole("kc-user-001", UserRole.ADMIN);

        assertThat(updated).isPresent();
        assertThat(updated.get().getRole()).isEqualTo(UserRole.ADMIN);
    }

    @Test
    @DisplayName("Should return user statistics accurately")
    void getUserStatistics_Success() {
        when(userRepository.count()).thenReturn(10L);
        when(userRepository.countByStatus(UserStatus.ACTIVE)).thenReturn(8L);
        when(userRepository.countByRole(UserRole.USER)).thenReturn(5L);
        when(userRepository.countByRole(UserRole.TECHNICIAN)).thenReturn(3L);
        when(userRepository.countByRole(UserRole.ADMIN)).thenReturn(2L);

        UserService.UserStats stats = userService.getUserStatistics();

        assertThat(stats.totalUsers()).isEqualTo(10L);
        assertThat(stats.activeUsers()).isEqualTo(8L);
        assertThat(stats.clients()).isEqualTo(5L);
        assertThat(stats.technicians()).isEqualTo(3L);
        assertThat(stats.admins()).isEqualTo(2L);
    }
}
