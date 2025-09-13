package com.sav.app.config;

import com.sav.common.enums.Priority;
import com.sav.common.enums.Team;
import com.sav.common.enums.TicketStatus;
import com.sav.common.enums.TicketType;
import com.sav.common.enums.UserRole;
import com.sav.common.enums.UserStatus;
import com.sav.ticket.domain.entity.Ticket;
import com.sav.ticket.domain.entity.TicketMessage;
import com.sav.ticket.domain.repository.TicketRepositoryPort;
import com.sav.user.domain.entity.User;
import com.sav.user.domain.repository.UserRepositoryPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
@Profile({"dev", "test"})
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepositoryPort userRepository;
    private final TicketRepositoryPort ticketRepository;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        log.info("🌱 Initializing demo data...");
        
        createDemoUsers();
        
        createDemoTickets();
        
        log.info("✅ Demo data initialization completed!");
    }

    private void createDemoUsers() {
        log.info("👥 Creating demo users...");
        
        User admin = User.builder()
                .id("admin-demo-uuid-001")
                .username("admin")
                .firstName("System")
                .lastName("Administrator")
                .email("admin@sav.com")
                .phoneNumber("+1-555-0001")
                .role(UserRole.ADMIN)
                .status(UserStatus.ACTIVE)
                .company("SAV Company")
                .department("IT Administration")
                .build();
        
        User technician = User.builder()
                .id("tech-demo-uuid-002")
                .username("tech1")
                .firstName("John")
                .lastName("Technician")
                .email("tech1@sav.com")
                .phoneNumber("+1-555-0002")
                .role(UserRole.TECHNICIAN)
                .status(UserStatus.ACTIVE)
                .company("SAV Company")
                .department("IT Support")
                .build();
        
        User user = User.builder()
                .id("user-demo-uuid-003")
                .username("user1")
                .firstName("Jane")
                .lastName("User")
                .email("user1@sav.com")
                .phoneNumber("+1-555-0003")
                .role(UserRole.USER)
                .status(UserStatus.ACTIVE)
                .company("Customer Corp")
                .department("Operations")
                .build();
        
        List<User> users = List.of(admin, technician, user);
        for (User u : users) {
            if (userRepository.findById(u.getId()).isEmpty()) {
                userRepository.save(u);
                log.info("✅ Created user: {} ({})", u.getUsername(), u.getRole());
            } else {
                log.info("ℹ️ User already exists: {} ({})", u.getUsername(), u.getRole());
            }
        }
    }

    private void createDemoTickets() {
        log.info("🎫 Creating demo tickets...");
        
        User admin = userRepository.findById("admin-demo-uuid-001").orElseThrow();
        User technician = userRepository.findById("tech-demo-uuid-002").orElseThrow();
        User user = userRepository.findById("user-demo-uuid-003").orElseThrow();
        
        Ticket openTicket = Ticket.builder()
                .title("Login issues with new system")
                .description("Users are experiencing intermittent login failures with the new authentication system. The issue occurs randomly and affects about 30% of users.")
                .status(TicketStatus.OPEN)
                .type(TicketType.BUG)
                .priority(Priority.HIGH)
                .createdByUserId(user.getId())
                .build();
        
        Ticket inProgressTicket = Ticket.builder()
                .title("Add user profile picture upload")
                .description("Implement functionality to allow users to upload and manage their profile pictures. Should support common image formats and have size limits.")
                .status(TicketStatus.IN_PROGRESS)
                .type(TicketType.FEATURE_REQUEST)
                .priority(Priority.MEDIUM)
                .createdByUserId(admin.getId())
                .assignedUserId(technician.getId())
                .assignedTeam(Team.DEVELOPMENT)
                .build();
        
        Ticket resolvedTicket = Ticket.builder()
                .title("Database connection timeout")
                .description("Application occasionally times out when connecting to the database during peak hours. This affects user experience and needs immediate attention.")
                .status(TicketStatus.RESOLVED)
                .type(TicketType.INCIDENT)
                .priority(Priority.CRITICAL)
                .createdByUserId(user.getId())
                .assignedUserId(technician.getId())
                .assignedTeam(Team.SUPPORT)
                .build();
        
        Ticket closedTicket = Ticket.builder()
                .title("Update user documentation")
                .description("The user manual needs to be updated to reflect the new features added in the latest release. Include screenshots and step-by-step instructions.")
                .status(TicketStatus.CLOSED)
                .type(TicketType.ASSISTANCE)
                .priority(Priority.LOW)
                .createdByUserId(admin.getId())
                .assignedUserId(technician.getId())
                .assignedTeam(Team.SUPPORT)
                .build();
        
        List<Ticket> tickets = List.of(openTicket, inProgressTicket, resolvedTicket, closedTicket);
        for (Ticket ticket : tickets) {
            if (ticketRepository.findByTitle(ticket.getTitle()).isEmpty()) {
                Ticket savedTicket = ticketRepository.save(ticket);
                log.info("✅ Created ticket: {} ({})", savedTicket.getTitle(), savedTicket.getStatus());
                
                createTicketMessages(savedTicket, admin, technician, user);
            } else {
                log.info("ℹ️ Ticket already exists: {}", ticket.getTitle());
            }
        }
    }

    private void createTicketMessages(Ticket ticket, User admin, User technician, User user) {
        if (ticket.getStatus() == TicketStatus.OPEN) {
            TicketMessage message = TicketMessage.builder()
                    .content("I'm experiencing this issue since yesterday. Can someone please help?")
                    .authorId(user.getId())
                    .ticket(ticket)
                    .build();
            ticket.getMessages().add(message);
        } else if (ticket.getStatus() == TicketStatus.IN_PROGRESS) {
            TicketMessage message1 = TicketMessage.builder()
                    .content("This feature request has been approved. Starting development.")
                    .authorId(admin.getId())
                    .ticket(ticket)
                    .build();
            TicketMessage message2 = TicketMessage.builder()
                    .content("Working on the implementation. Will update progress soon.")
                    .authorId(technician.getId())
                    .ticket(ticket)
                    .build();
            ticket.getMessages().addAll(List.of(message1, message2));
        } else if (ticket.getStatus() == TicketStatus.RESOLVED) {
            TicketMessage message1 = TicketMessage.builder()
                    .content("This is a critical issue. Investigating immediately.")
                    .authorId(technician.getId())
                    .ticket(ticket)
                    .build();
            TicketMessage message2 = TicketMessage.builder()
                    .content("Issue resolved by increasing connection pool size and optimizing queries.")
                    .authorId(technician.getId())
                    .ticket(ticket)
                    .build();
            ticket.getMessages().addAll(List.of(message1, message2));
        } else if (ticket.getStatus() == TicketStatus.CLOSED) {
            TicketMessage message1 = TicketMessage.builder()
                    .content("Documentation update task assigned.")
                    .authorId(admin.getId())
                    .ticket(ticket)
                    .build();
            TicketMessage message2 = TicketMessage.builder()
                    .content("Documentation has been updated and published. Task completed.")
                    .authorId(technician.getId())
                    .ticket(ticket)
                    .build();
            ticket.getMessages().addAll(List.of(message1, message2));
        }
    }
}
