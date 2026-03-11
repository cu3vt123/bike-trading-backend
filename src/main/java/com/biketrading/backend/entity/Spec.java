package com.biketrading.backend.entity;

import jakarta.persistence.Embeddable;
import lombok.Data;

@Embeddable
@Data
public class Spec {
    private String label;
    private String value;
}