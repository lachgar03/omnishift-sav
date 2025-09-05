package com.sav.common.events.user;

import com.sav.common.enums.UserRole;
import com.sav.common.events.BaseDomainEvent;
import lombok.Getter;

@Getter
public class UserCreatedEvent extends BaseDomainEvent {
    private final String userId;
    private final String username;
    private final String email;
    private final UserRole role;

    public UserCreatedEvent(String userId, String username, String email, UserRole role) {
        super();
        this.userId = userId;
        this.username = username;
        this.email = email;
        this.role = role;
    }

    @Override
    public String getAggregateId() {
        return userId;
    }

    @Override
    public String getEventType() {
        return "UserCreated";
    }
}
