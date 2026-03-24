package com.biketrading.backend.entity;

import com.biketrading.backend.enums.*;
import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "listings")
@Data
public class Listing {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "seller_id")
    private User seller;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String brand;

    private String model;

    @Column(name = "bike_year")
    private Integer year;

    private String frameSize;

    @Enumerated(EnumType.STRING)
    private Condition condition;

    @Column(nullable = false)
    private BigDecimal price;

    private BigDecimal msrp;
    private String currency = "VND";
    private String location;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String thumbnailUrl;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "listing_images", joinColumns = @JoinColumn(name = "listing_id"))
    @Column(name = "image_url")
    private List<String> imageUrls = new ArrayList<>();

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "listing_id")
    private List<Spec> specs = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    private ListingState state = ListingState.DRAFT;

    @Enumerated(EnumType.STRING)
    private InspectionResult inspectionResult;

    private Double inspectionScore;

    @Column(columnDefinition = "TEXT")
    private String inspectionReportJson;

    @Column(columnDefinition = "TEXT")
    private String inspectionNeedUpdateReason;

    @Enumerated(EnumType.STRING)
    private CertificationStatus certificationStatus = CertificationStatus.UNVERIFIED;

    private Boolean isHidden = false;
    private LocalDateTime hiddenAt;
    private LocalDateTime sellerShippedToWarehouseAt;
    private LocalDateTime warehouseIntakeVerifiedAt;
    private LocalDateTime publishedAt;
    private LocalDateTime listingExpiresAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    public void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}