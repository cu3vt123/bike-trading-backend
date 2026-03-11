package com.biketrading.backend.repository;

import com.biketrading.backend.entity.Inspector;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InspectorRepository extends JpaRepository<Inspector, Long> {
    Optional<Inspector> findByUsername(String username);
}