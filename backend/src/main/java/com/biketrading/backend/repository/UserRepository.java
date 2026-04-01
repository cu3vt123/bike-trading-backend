package com.biketrading.backend.repository;

import com.biketrading.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmailIgnoreCase(String email);

    Optional<User> findByUsernameIgnoreCase(String username);

    boolean existsByEmailIgnoreCase(String email);

    boolean existsByUsernameIgnoreCase(String username);

    @Query("""
        select u
        from User u
        where lower(u.email) = lower(:identifier)
           or lower(coalesce(u.username, '')) = lower(:identifier)
        """)
    Optional<User> findByEmailOrUsername(@Param("identifier") String identifier);
}