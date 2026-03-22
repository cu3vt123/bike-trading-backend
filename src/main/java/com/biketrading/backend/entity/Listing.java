package com.biketrading.backend.entity;

import com.biketrading.backend.enums.Condition;
import com.biketrading.backend.enums.InspectionResult;
import com.biketrading.backend.enums.ListingState;
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

    @ManyToOne
    @JoinColumn(name = "seller_id", nullable = false)
    private User seller;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String brand;

    @Column(nullable = false)
    private String model;

    private Integer year;

    @Column(nullable = false)
    private BigDecimal price;

    private BigDecimal msrp; // Giá gốc tham khảo

    @Column(nullable = false)
    private String currency = "VND";

    @Enumerated(EnumType.STRING)
    @Column(name = "`condition`", nullable = false) // Backtick do 'condition' là từ khóa SQL
    private Condition condition;

    private String frameSize;

    @Column(nullable = false)
    private String location;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String thumbnailUrl;

    @ElementCollection
    private List<String> imageUrls;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "listing_id")
    private List<Spec> specs;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ListingState state = ListingState.DRAFT;

    // --- QUẢN LÝ KIỂM ĐỊNH TỪ INSPECTOR ---
    @Enumerated(EnumType.STRING)
    private InspectionResult inspectionResult;

    private Double inspectionScore;

    // --- TÍCH XANH XE KIỂM ĐỊNH (LƯU LOGIC GIAO HÀNG TRỰC TIẾP) ---
    @Column(nullable = false, columnDefinition = "boolean default false")
    private Boolean isVerified = false;
}