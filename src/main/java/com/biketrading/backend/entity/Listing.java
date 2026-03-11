package com.biketrading.backend.entity;

import com.biketrading.backend.enums.*;
import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Entity
@Table(name = "listings")
@Data
public class Listing {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String brand;
    private String model;

    @Column(name = "bike_year")
    private Integer year;

    private String frameSize;

    @Enumerated(EnumType.STRING)
    @Column(name = "bike_condition")
    private Condition condition;

    private BigDecimal price;
    private BigDecimal msrp;
    private String currency = "VND";
    private String location;
    private String thumbnailUrl;

    @ElementCollection
    private List<String> imageUrls;

    @Enumerated(EnumType.STRING)
    private ListingState state = ListingState.DRAFT;

    @Enumerated(EnumType.STRING)
    private InspectionResult inspectionResult;
    private Double inspectionScore;

    @Column(columnDefinition = "TEXT")
    private String description;
    @ElementCollection

    @CollectionTable(name = "listing_specs", joinColumns = @JoinColumn(name = "listing_id"))
    private List<Spec> specs;

    @ManyToOne
    @JoinColumn(name = "seller_id")
    private User seller;
}