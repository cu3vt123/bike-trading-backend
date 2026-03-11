package com.biketrading.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "inspectors")
@Data
public class Inspector {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long inspectorId;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String email;
}