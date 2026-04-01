package com.bob.planb.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "listings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Listing {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String brand;

    private String model;
    private Integer year;
    private String frameSize;

    @Enumerated(EnumType.STRING)
    private ConditionType conditionType; // Tránh dùng chữ 'condition' vì là từ khóa SQL

    @Column(nullable = false)
    private Double price;

    private Double msrp;

    @Builder.Default
    private String currency = "VND";

    private String location;

    @Column(columnDefinition = "TEXT")
    private String thumbnailUrl;

    // Lưu mảng String (danh sách link ảnh) vào một bảng phụ ẩn trong MySQL
    @ElementCollection
    @CollectionTable(name = "listing_images", joinColumns = @JoinColumn(name = "listing_id"))
    @Column(name = "image_url", columnDefinition = "TEXT")
    @Builder.Default
    private List<String> imageUrls = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ListingState state = ListingState.DRAFT;

    @Enumerated(EnumType.STRING)
    private InspectionResult inspectionResult;

    private Double inspectionScore;

    @Embedded
    private InspectionReport inspectionReport;

    @Column(columnDefinition = "TEXT")
    private String inspectionSummary;

    @Column(columnDefinition = "TEXT")
    private String inspectionNeedUpdateReason;

    // Mảng các thông số kỹ thuật (Spec)
    @ElementCollection
    @CollectionTable(name = "listing_specs", joinColumns = @JoinColumn(name = "listing_id"))
    @Builder.Default
    private List<Spec> specs = new ArrayList<>();

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne
    @JoinColumn(name = "seller_id")
    private User seller;

    @Builder.Default
    private boolean isHidden = false;
    private LocalDateTime hiddenAt;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private CertificationStatus certificationStatus = CertificationStatus.UNVERIFIED;

    private LocalDateTime sellerShippedToWarehouseAt;
    private LocalDateTime warehouseIntakeVerifiedAt;
    private LocalDateTime publishedAt;
    private LocalDateTime listingExpiresAt;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;


}