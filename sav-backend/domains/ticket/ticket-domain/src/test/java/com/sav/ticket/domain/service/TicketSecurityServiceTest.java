package com.sav.ticket.domain.service;

import com.sav.common.enums.Priority;
import com.sav.common.enums.TicketStatus;
import com.sav.common.enums.TicketType;
import com.sav.common.enums.UserRole;
import com.sav.common.enums.UserStatus;
import com.sav.ticket.domain.entity.Ticket;
import com.sav.ticket.domain.repository.TicketRepositoryPort;
import com.sav.user.domain.entity.User;
import com.sav.user.domain.service.UserService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TicketSecurityServiceTest {

    @Mock
    private UserService userService;

    @Mock
    private TicketRepositoryPort ticketRepository;

    @InjectMocks
    private TicketSecurityService ticketSecurityService;

    private Ticket ticket;

    @BeforeEach
    void setUp() {
        ticket = Ticket.builder()
                .id(1L)
                .title("Network outage")
                .description("Router offline")
                .type(TicketType.INCIDENT)
                .priority(Priority.HIGH)
                .status(TicketStatus.OPEN)
                .createdByUserId("user-1")
                .assignedUserId("tech-1")
                .build();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    private void authenticateAs(String userId) {
        Jwt jwt = new Jwt(
                "mock-token",
                Instant.now(),
                Instant.now().plusSeconds(3600),
                Map.of("alg", "none"),
                Map.of("sub", userId, "preferred_username", userId)
        );
        Authentication auth = new JwtAuthenticationToken(jwt, List.of());
        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(auth);
        SecurityContextHolder.setContext(context);
    }

    @Test
    @DisplayName("Admin can modify any ticket")
    void canModifyTicket_Admin_ReturnsTrue() {
        authenticateAs("admin-1");
        User admin = User.builder()
                .id("admin-1")
                .role(UserRole.ADMIN)
                .status(UserStatus.ACTIVE)
                .build();

        when(userService.getUserById("admin-1")).thenReturn(Optional.of(admin));
        when(ticketRepository.findById(1L)).thenReturn(Optional.of(ticket));

        boolean canModify = ticketSecurityService.canModifyTicket(1L, "admin-1");
        assertThat(canModify).isTrue();
    }

    @Test
    @DisplayName("Technician can modify assigned ticket")
    void canModifyTicket_AssignedTechnician_ReturnsTrue() {
        authenticateAs("tech-1");
        User tech = User.builder()
                .id("tech-1")
                .role(UserRole.TECHNICIAN)
                .status(UserStatus.ACTIVE)
                .build();

        when(userService.getUserById("tech-1")).thenReturn(Optional.of(tech));
        when(ticketRepository.findById(1L)).thenReturn(Optional.of(ticket));

        boolean canModify = ticketSecurityService.canModifyTicket(1L, "tech-1");
        assertThat(canModify).isTrue();
    }

    @Test
    @DisplayName("Creator can modify own ticket")
    void canModifyTicket_Creator_ReturnsTrue() {
        authenticateAs("user-1");
        User user = User.builder()
                .id("user-1")
                .role(UserRole.USER)
                .status(UserStatus.ACTIVE)
                .build();

        when(userService.getUserById("user-1")).thenReturn(Optional.of(user));
        when(ticketRepository.findById(1L)).thenReturn(Optional.of(ticket));

        boolean canModify = ticketSecurityService.canModifyTicket(1L, "user-1");
        assertThat(canModify).isTrue();
    }

    @Test
    @DisplayName("Other user cannot modify ticket")
    void canModifyTicket_OtherUser_ReturnsFalse() {
        authenticateAs("other-user");
        User other = User.builder()
                .id("other-user")
                .role(UserRole.USER)
                .status(UserStatus.ACTIVE)
                .build();

        when(userService.getUserById("other-user")).thenReturn(Optional.of(other));
        when(ticketRepository.findById(1L)).thenReturn(Optional.of(ticket));

        boolean canModify = ticketSecurityService.canModifyTicket(1L, "other-user");
        assertThat(canModify).isFalse();
    }
}
