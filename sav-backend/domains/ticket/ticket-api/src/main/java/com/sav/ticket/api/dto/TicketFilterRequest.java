package com.sav.ticket.api.dto;

import com.sav.common.enums.Priority;
import com.sav.common.enums.TicketStatus;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TicketFilterRequest {
    private TicketStatus status;
    private Priority priority;
    private String assignedUserId;
    private String createdByUserId;
    private String searchTerm;

    // Pagination
    private int page;
    private int size;
    private String sortBy;
    private String sortDirection;
}