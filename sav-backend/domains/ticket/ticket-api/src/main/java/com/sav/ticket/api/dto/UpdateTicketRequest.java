package com.sav.ticket.api.dto;

import com.sav.common.enums.Priority;
import com.sav.common.enums.TicketStatus;
import com.sav.common.enums.Team;
import lombok.Data;

@Data
public class UpdateTicketRequest {
    private String title;
    private String description;
    private TicketStatus status;
    private Priority priority;
    private Team assignedTeam;
    private String assignedUserId;
}
