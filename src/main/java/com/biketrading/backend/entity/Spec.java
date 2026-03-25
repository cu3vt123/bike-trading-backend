package com.biketrading.backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "listing_specs")
@Getter
@Setter
public class Spec {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "spec_key", nullable = false, length = 120)
    private String key;

    @Column(name = "spec_value", nullable = false, length = 255)
    private String value;
}