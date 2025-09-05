package com.sav.ticket.api.dto;



import com.sav.common.enums.Team;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AssignTeamRequest {
    @NotNull(message = "Team is required")
    private Team team;
}
