package com.sav.app.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sav.common.enums.Priority;
import com.sav.common.enums.TicketStatus;
import com.sav.common.enums.TicketType;
import com.sav.ticket.api.controller.TicketController;
import com.sav.ticket.api.dto.CreateTicketRequest;
import com.sav.ticket.api.dto.TicketResponse;
import com.sav.ticket.api.mapper.TicketMapper;
import com.sav.ticket.domain.entity.Ticket;
import com.sav.ticket.domain.service.TicketSecurityService;
import com.sav.ticket.domain.service.TicketService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = TicketController.class)
@ContextConfiguration(classes = {TicketController.class})
@AutoConfigureMockMvc(addFilters = false)
class TicketControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private TicketService ticketService;

    @MockBean
    private TicketMapper ticketMapper;

    @MockBean
    private TicketSecurityService ticketSecurityService;

    @Test
    @WithMockUser(username = "user-1", roles = {"USER"})
    @DisplayName("POST /tickets creates a ticket and returns 201")
    void createTicket_ValidInput_ReturnsCreated() throws Exception {
        CreateTicketRequest request = new CreateTicketRequest();
        request.setTitle("Printer not working");
        request.setDescription("Paper jam in 2nd floor printer");
        request.setType(TicketType.BUG);
        request.setPriority(Priority.MEDIUM);

        Ticket savedTicket = Ticket.builder()
                .id(1L)
                .title("Printer not working")
                .description("Paper jam in 2nd floor printer")
                .type(TicketType.BUG)
                .priority(Priority.MEDIUM)
                .status(TicketStatus.OPEN)
                .createdByUserId("user-1")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        TicketResponse response = TicketResponse.builder()
                .id(1L)
                .title("Printer not working")
                .description("Paper jam in 2nd floor printer")
                .type(TicketType.BUG)
                .priority(Priority.MEDIUM)
                .status(TicketStatus.OPEN)
                .createdByUserId("user-1")
                .build();

        when(ticketService.createTicket(eq("Printer not working"), any(), eq(TicketType.BUG), eq(Priority.MEDIUM), any()))
                .thenReturn(savedTicket);
        when(ticketMapper.toResponse(savedTicket)).thenReturn(response);

        mockMvc.perform(post("/tickets")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.title").value("Printer not working"))
                .andExpect(jsonPath("$.status").value("OPEN"));
    }

    @Test
    @WithMockUser(username = "user-1", roles = {"USER"})
    @DisplayName("POST /tickets with blank title returns 400 Bad Request")
    void createTicket_BlankTitle_ReturnsBadRequest() throws Exception {
        CreateTicketRequest request = new CreateTicketRequest();
        request.setTitle("");
        request.setType(TicketType.BUG);
        request.setPriority(Priority.LOW);

        mockMvc.perform(post("/tickets")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    @DisplayName("GET /tickets returns paginated ticket list")
    void getAllTickets_ReturnsPaginatedList() throws Exception {
        Ticket ticket = Ticket.builder().id(1L).title("Test").build();
        TicketResponse response = TicketResponse.builder().id(1L).title("Test").build();
        Page<Ticket> page = new PageImpl<>(List.of(ticket));

        when(ticketService.getAllTickets(any())).thenReturn(page);
        when(ticketMapper.toResponse(ticket)).thenReturn(response);

        mockMvc.perform(get("/tickets")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").value(1));
    }

    @Test
    @WithMockUser(username = "user-1", roles = {"USER"})
    @DisplayName("GET /tickets/{id} returns 200 when ticket exists")
    void getTicketById_Exists_ReturnsOk() throws Exception {
        Ticket ticket = Ticket.builder().id(1L).title("Existing Ticket").build();
        TicketResponse response = TicketResponse.builder().id(1L).title("Existing Ticket").build();

        when(ticketService.getTicketWithMessages(1L)).thenReturn(Optional.of(ticket));
        when(ticketMapper.toResponse(ticket)).thenReturn(response);

        mockMvc.perform(get("/tickets/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.title").value("Existing Ticket"));
    }

    @Test
    @WithMockUser(username = "user-1", roles = {"USER"})
    @DisplayName("GET /tickets/{id} returns 404 when ticket not found")
    void getTicketById_NotFound_Returns404() throws Exception {
        when(ticketService.getTicketWithMessages(999L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/tickets/999"))
                .andExpect(status().isNotFound());
    }
}
