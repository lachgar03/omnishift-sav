package com.sav.ticket.api.dto;

import com.sav.common.enums.Priority;
import com.sav.common.enums.TicketType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateTicketRequest {
    @NotBlank(message = "Title is required")
    @jakarta.validation.constraints.Size(min = 3, max = 255, message = "Title must be between 3 and 255 characters")
    private String title;

    @jakarta.validation.constraints.Size(max = 2000, message = "Description cannot exceed 2000 characters")
    private String description;

    @NotNull(message = "Type is required")
    private TicketType type;

    @NotNull(message = "Priority is required")
    private Priority priority;
}
