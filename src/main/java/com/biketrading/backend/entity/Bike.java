package com.biketrading.backend.entity;


import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "bikes")
@Data
public class Bike {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long bikeId;

    private Long sellerId;
    private Integer categoryId;
    private Integer brandId;

    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    private BigDecimal price;
    private String frameSize;
    private Integer conditionPercentage;

    private String approvalStatus;
    private String salesStatus;
    private Boolean isVerified;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}