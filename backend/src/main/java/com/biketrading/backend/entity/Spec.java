package com.biketrading.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "specs")
@Data
public class Spec {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String label;

    @Column(name = "spec_value", nullable = false)
    private String value;
}