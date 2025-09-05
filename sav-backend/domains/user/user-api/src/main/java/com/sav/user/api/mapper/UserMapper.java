package com.sav.user.api.mapper;

import com.sav.user.api.dto.UserResponse;
import com.sav.user.api.dto.UserStatsResponse;
import com.sav.user.domain.entity.User;
import com.sav.user.domain.service.UserService.UserStats;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class UserMapper {

    /**
     * Convert User entity to UserResponse DTO
     */
    public UserResponse toResponse(User user) {
        if (user == null) {
            return null;
        }

        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .role(user.getRole())
                .status(user.getStatus())
                .company(user.getCompany())
                .department(user.getDepartment())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }

    /**
     * Convert list of User entities to list of DTOs
     */
    public List<UserResponse> toResponseList(List<User> users) {
        if (users == null) {
            return List.of();
        }

        return users.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Convert UserStats to UserStatsResponse DTO
     */
    public UserStatsResponse toStatsResponse(UserStats stats) {
        if (stats == null) {
            return null;
        }

        return UserStatsResponse.builder()
                .totalUsers(stats.totalUsers())
                .activeUsers(stats.activeUsers())
                .clients(stats.clients())
                .technicians(stats.technicians())
                .admins(stats.admins())
                .inactiveUsers(stats.totalUsers() - stats.activeUsers())
                .build();
    }
}