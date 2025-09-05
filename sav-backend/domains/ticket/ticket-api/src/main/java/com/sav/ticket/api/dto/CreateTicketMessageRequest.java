package com.sav.ticket.api.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateTicketMessageRequest {
    @NotBlank(message = "Message content is required")
    private String content;
}
