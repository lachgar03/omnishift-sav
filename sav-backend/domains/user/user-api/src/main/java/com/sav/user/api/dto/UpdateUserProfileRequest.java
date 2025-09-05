package com.sav.user.api.dto;

import jakarta.validation.constraints.Email;
import lombok.Data;

@Data
public class UpdateUserProfileRequest {
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private String company;
    private String department;

    @Email(message = "Valid email format required")
    private String email;
}