package com.sav.ticket.api.dto;

import com.sav.common.enums.Priority;
import com.sav.common.enums.TicketType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateTicketRequest {
    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotNull(message = "Type is required")
    private TicketType type;

    @NotNull(message = "Priority is required")
    private Priority priority;
}
