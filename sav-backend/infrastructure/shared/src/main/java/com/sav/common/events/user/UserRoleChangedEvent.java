package com.sav.common.events.user;

import com.sav.common.enums.UserRole;
import com.sav.common.events.BaseDomainEvent;
import lombok.Getter;

@Getter
public class UserRoleChangedEvent extends BaseDomainEvent {
    private final String userId;
    private final UserRole oldRole;
    private final UserRole newRole;
    private final String changedBy;

    public UserRoleChangedEvent(String userId, UserRole oldRole, UserRole newRole, String changedBy) {
        super();
        this.userId = userId;
        this.oldRole = oldRole;
        this.newRole = newRole;
        this.changedBy = changedBy;
    }

    @Override
    public String getAggregateId() {
        return userId;
    }

    @Override
    public String getEventType() {
        return "UserRoleChanged";
    }
}
