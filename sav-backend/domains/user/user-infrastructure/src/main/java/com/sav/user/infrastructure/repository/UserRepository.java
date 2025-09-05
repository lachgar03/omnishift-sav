package com.sav.user.infrastructure.repository;

import com.sav.user.domain.entity.User;
import com.sav.user.domain.repository.UserRepositoryPort;
import com.sav.common.enums.UserRole;
import com.sav.common.enums.UserStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String>, UserRepositoryPort {

    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    List<User> findByStatus(UserStatus status);

    List<User> findByRole(UserRole role);

    List<User> findByRoleAndStatus(UserRole role, UserStatus status);

    long countByStatus(UserStatus status);

    long countByRole(UserRole role);

    @Query("SELECT u FROM User u WHERE u.role = :role AND u.status = :status ORDER BY u.firstName, u.lastName")
    List<User> findActiveUsersByRole(UserRole role, UserStatus status);

    @Query("SELECT u FROM User u WHERE u.status = 'ACTIVE' ORDER BY u.firstName, u.lastName")
    List<User> findAllActiveUsers();
}