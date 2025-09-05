package com.sav.user.api.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserStatsResponse {
    private long totalUsers;
    private long activeUsers;
    private long clients;
    private long technicians;
    private long admins;
    private long inactiveUsers;
}