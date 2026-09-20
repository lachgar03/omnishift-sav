package com.sav.ticket.domain.service;

import com.sav.common.enums.Priority;
import com.sav.common.enums.Team;
import com.sav.common.enums.TicketStatus;
import com.sav.common.enums.TicketType;
import com.sav.common.enums.UserRole;
import com.sav.common.enums.UserStatus;
import com.sav.common.events.ticket.TicketCreatedEvent;
import com.sav.common.service.MetricsServicePort;
import com.sav.ticket.domain.entity.Ticket;
import com.sav.ticket.domain.repository.TicketRepositoryPort;
import com.sav.user.domain.entity.User;
import com.sav.user.domain.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TicketServiceTest {

    @Mock
    private TicketRepositoryPort ticketRepository;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @Mock
    private UserService userService;

    @Mock
    private MetricsServicePort metricsService;

    @Mock
    private TicketEscalationService ticketEscalationService;

    @InjectMocks
    private TicketService ticketService;

    private User activeUser;
    private User inactiveUser;
    private Ticket sampleTicket;

    @BeforeEach
    void setUp() {
        activeUser = User.builder()
                .id("user-123")
                .username("testuser")
                .email("test@sav.com")
                .role(UserRole.USER)
                .status(UserStatus.ACTIVE)
                .build();

        inactiveUser = User.builder()
                .id("inactive-user")
                .username("inactive")
                .email("inactive@sav.com")
                .role(UserRole.USER)
                .status(UserStatus.INACTIVE)
                .build();

        sampleTicket = Ticket.builder()
                .id(1L)
                .title("Database connection issue")
                .description("Cannot connect to postgres")
                .type(TicketType.BUG)
                .priority(Priority.HIGH)
                .status(TicketStatus.OPEN)
                .createdByUserId("user-123")
                .createdAt(LocalDateTime.now().minusHours(1))
                .build();
    }

    @Test
    @DisplayName("Should successfully create ticket for active user and publish event")
    void createTicket_Success() {
        when(userService.getUserById("user-123")).thenReturn(Optional.of(activeUser));
        when(ticketRepository.save(any(Ticket.class))).thenAnswer(invocation -> {
            Ticket t = invocation.getArgument(0);
            t.setId(100L);
            return t;
        });

        Ticket created = ticketService.createTicket(
                "Login issue",
                "Cannot login with Google SSO",
                TicketType.BUG,
                Priority.HIGH,
                "user-123"
        );

        assertThat(created).isNotNull();
        assertThat(created.getId()).isEqualTo(100L);
        assertThat(created.getTitle()).isEqualTo("Login issue");
        assertThat(created.getStatus()).isEqualTo(TicketStatus.OPEN);
        assertThat(created.getCreatedByUserId()).isEqualTo("user-123");

        verify(ticketRepository).save(any(Ticket.class));
        verify(eventPublisher).publishEvent(any(TicketCreatedEvent.class));
        verify(metricsService).incrementTicketCreated(eq("HIGH"), eq("BUG"));
    }

    @Test
    @DisplayName("Should reject ticket creation when title is blank")
    void createTicket_BlankTitle_ThrowsException() {
        assertThatThrownBy(() -> ticketService.createTicket(
                "  ",
                "Description",
                TicketType.BUG,
                Priority.LOW,
                "user-123"
        )).isInstanceOf(IllegalArgumentException.class)
          .hasMessageContaining("Ticket title cannot be empty");

        verifyNoInteractions(ticketRepository);
        verifyNoInteractions(eventPublisher);
    }

    @Test
    @DisplayName("Should reject ticket creation when user does not exist")
    void createTicket_UserNotFound_ThrowsException() {
        when(userService.getUserById("non-existent")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> ticketService.createTicket(
                "Some Title",
                "Some Description",
                TicketType.BUG,
                Priority.MEDIUM,
                "non-existent"
        )).isInstanceOf(IllegalArgumentException.class)
          .hasMessageContaining("not found");

        verifyNoInteractions(ticketRepository);
    }

    @Test
    @DisplayName("Should reject ticket creation when user is inactive")
    void createTicket_InactiveUser_ThrowsException() {
        when(userService.getUserById("inactive-user")).thenReturn(Optional.of(inactiveUser));

        assertThatThrownBy(() -> ticketService.createTicket(
                "Some Title",
                "Some Description",
                TicketType.BUG,
                Priority.MEDIUM,
                "inactive-user"
        )).isInstanceOf(IllegalArgumentException.class)
          .hasMessageContaining("is not active");

        verifyNoInteractions(ticketRepository);
    }

    @Test
    @DisplayName("Creator can update ticket title and description")
    void updateTicket_OwnerCanUpdateContent() {
        when(ticketRepository.findById(1L)).thenReturn(Optional.of(sampleTicket));
        when(userService.getUserById("user-123")).thenReturn(Optional.of(activeUser));
        when(ticketRepository.save(any(Ticket.class))).thenAnswer(i -> i.getArgument(0));

        Optional<Ticket> updated = ticketService.updateTicket(
                1L,
                "Updated title",
                "Updated description",
                null,
                null,
                null,
                null,
                "user-123"
        );

        assertThat(updated).isPresent();
        assertThat(updated.get().getTitle()).isEqualTo("Updated title");
        assertThat(updated.get().getDescription()).isEqualTo("Updated description");
    }

    @Test
    @DisplayName("Unauthorized user cannot modify another user's ticket")
    void updateTicket_UnauthorizedUser_ThrowsSecurityException() {
        User otherUser = User.builder()
                .id("other-user")
                .username("other")
                .role(UserRole.USER)
                .status(UserStatus.ACTIVE)
                .build();

        when(ticketRepository.findById(1L)).thenReturn(Optional.of(sampleTicket));
        when(userService.getUserById("other-user")).thenReturn(Optional.of(otherUser));

        assertThatThrownBy(() -> ticketService.updateTicket(
                1L,
                "Malicious update",
                "Hacked description",
                null,
                null,
                null,
                null,
                "other-user"
        )).isInstanceOf(SecurityException.class)
          .hasMessageContaining("not authorized");
    }

    @Test
    @DisplayName("Should assign ticket to technician and update status to IN_PROGRESS")
    void assignTicketToUser_Success() {
        User technician = User.builder()
                .id("tech-1")
                .username("tech")
                .role(UserRole.TECHNICIAN)
                .status(UserStatus.ACTIVE)
                .build();
        User admin = User.builder()
                .id("admin-1")
                .username("admin")
                .role(UserRole.ADMIN)
                .status(UserStatus.ACTIVE)
                .build();

        when(ticketRepository.findById(1L)).thenReturn(Optional.of(sampleTicket));
        when(userService.getUserById("tech-1")).thenReturn(Optional.of(technician));
        when(userService.getUserById("admin-1")).thenReturn(Optional.of(admin));
        when(ticketRepository.countByAssignedUserId("tech-1")).thenReturn(2L);
        when(ticketRepository.save(any(Ticket.class))).thenAnswer(i -> i.getArgument(0));

        Optional<Ticket> assigned = ticketService.assignTicketToUser(1L, "tech-1", "admin-1");

        assertThat(assigned).isPresent();
        assertThat(assigned.get().getAssignedUserId()).isEqualTo("tech-1");
        assertThat(assigned.get().getStatus()).isEqualTo(TicketStatus.IN_PROGRESS);
    }

    @Test
    @DisplayName("Should assign ticket to team")
    void assignTicketToTeam_Success() {
        when(ticketRepository.findById(1L)).thenReturn(Optional.of(sampleTicket));
        when(ticketRepository.save(any(Ticket.class))).thenAnswer(i -> i.getArgument(0));

        Optional<Ticket> assigned = ticketService.assignTicketToTeam(1L, Team.SUPPORT);

        assertThat(assigned).isPresent();
        assertThat(assigned.get().getAssignedTeam()).isEqualTo(Team.SUPPORT);
    }

    @Test
    @DisplayName("Should close ticket and publish status changed event")
    void closeTicket_Success() {
        sampleTicket.setStatus(TicketStatus.RESOLVED);
        when(ticketRepository.findById(1L)).thenReturn(Optional.of(sampleTicket));
        when(userService.getUserById("user-123")).thenReturn(Optional.of(activeUser));
        when(ticketRepository.save(any(Ticket.class))).thenAnswer(i -> i.getArgument(0));

        Optional<Ticket> closed = ticketService.closeTicket(1L, "user-123");

        assertThat(closed).isPresent();
        assertThat(closed.get().getStatus()).isEqualTo(TicketStatus.CLOSED);
        verify(ticketRepository).save(sampleTicket);
    }

    @Test
    @DisplayName("Should reopen closed ticket")
    void reopenTicket_Success() {
        User technician = User.builder()
                .id("tech-1")
                .username("tech")
                .role(UserRole.TECHNICIAN)
                .status(UserStatus.ACTIVE)
                .build();

        sampleTicket.setStatus(TicketStatus.CLOSED);
        when(ticketRepository.findById(1L)).thenReturn(Optional.of(sampleTicket));
        when(userService.getUserById("tech-1")).thenReturn(Optional.of(technician));
        when(ticketRepository.save(any(Ticket.class))).thenAnswer(i -> i.getArgument(0));

        Optional<Ticket> reopened = ticketService.reopenTicket(1L, "tech-1");

        assertThat(reopened).isPresent();
        assertThat(reopened.get().getStatus()).isEqualTo(TicketStatus.REOPENED);
    }
}
