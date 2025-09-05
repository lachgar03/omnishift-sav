package com.sav.user.domain.repository;

import com.sav.user.domain.entity.User;
import com.sav.common.enums.UserRole;
import com.sav.common.enums.UserStatus;

import java.util.List;
import java.util.Optional;

public interface UserRepositoryPort {
    User save(User user);
    Optional<User> findById(String id);
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    List<User> findByStatus(UserStatus status);
    List<User> findByRole(UserRole role);
    List<User> findByRoleAndStatus(UserRole role, UserStatus status);
    boolean existsById(String id);
    long count();
    long countByStatus(UserStatus status);
    long countByRole(UserRole role);
    List<User> findAll();
    void deleteById(String id);
}