package com.biketrading.backend.entity;

import com.biketrading.backend.enums.Condition;
import com.biketrading.backend.enums.InspectionResult;
import com.biketrading.backend.enums.ListingState;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "listings")
@Getter
@Setter
public class Listing {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "seller_id", nullable = false)
    private User seller;

    @Column(nullable = false, length = 180)
    private String title;

    @Column(nullable = false, length = 120)
    private String brand;

    @Column(length = 120)
    private String model;

    private Integer year;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal price;

    @Column(precision = 15, scale = 2)
    private BigDecimal msrp;

    @Column(nullable = false, length = 10)
    private String currency = "VND";

    @Enumerated(EnumType.STRING)
    @Column(name = "bike_condition", length = 30)
    private Condition condition;

    @Column(length = 30)
    private String frameSize;

    @Column(length = 120)
    private String location;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 500)
    private String thumbnailUrl;

    @ElementCollection
    @CollectionTable(name = "listing_images", joinColumns = @JoinColumn(name = "listing_id"))
    @Column(name = "image_url", length = 500)
    private List<String> imageUrls = new ArrayList<>();

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "listing_id")
    private List<Spec> specs = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private ListingState state = ListingState.DRAFT;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private InspectionResult inspectionResult;

    private Double inspectionScore;

    @Column(columnDefinition = "TEXT")
    private String inspectionSummary;

    @Column(nullable = false)
    private Boolean isHidden = false;

    private LocalDateTime hiddenAt;

    private LocalDateTime publishedAt;

    private LocalDateTime listingExpiresAt;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}