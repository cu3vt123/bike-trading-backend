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

    @Column(name = "spec_key", nullable = false)
    private String key;   // Ví dụ: "Chất liệu khung", "Trọng lượng"

    @Column(name = "spec_value", nullable = false)
    private String value; // Ví dụ: "Carbon", "8kg"
}