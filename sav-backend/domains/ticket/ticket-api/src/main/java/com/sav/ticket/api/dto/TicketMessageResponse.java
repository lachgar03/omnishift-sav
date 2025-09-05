package com.sav.ticket.api.dto;


import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class TicketMessageResponse {
    private Long id;
    private String content;
    private LocalDateTime createdAt;
    private String authorId;
}
