package com.sav.ticket.api.dto;



import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AssignUserRequest {
    @NotBlank(message = "User ID is required")
    private String userId;
}
