package com.sav.ticket.api.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UpdateMyTicketRequest {
    @NotBlank(message = "Title is required")
    private String title;

    private String description;
}