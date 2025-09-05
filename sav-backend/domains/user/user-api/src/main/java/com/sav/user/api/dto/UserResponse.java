package com.sav.user.api.dto;

import com.sav.common.enums.UserRole;
import com.sav.common.enums.UserStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class UserResponse {
    private String id;
    private String username;
    private String firstName;
    private String lastName;
    private String fullName;
    private String email;
    private String phoneNumber;
    private UserRole role;
    private UserStatus status;
    private String company;
    private String department;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}