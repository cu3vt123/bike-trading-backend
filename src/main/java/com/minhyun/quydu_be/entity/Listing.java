package com.minhyun.quydu_be.entity;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "listings")
public class Listing extends BaseEntity {

    @Column(nullable = false, length = 255)
    private String title;

    @Column(nullable = false, length = 120)
    private String brand;

    @Column(length = 120)
    private String model;

    private Integer year;

    @Column(name = "frame_size", length = 80)
    private String frameSize;

    @Column(nullable = false, precision = 18, scale = 2)
    private BigDecimal price;

    @Column(precision = 18, scale = 2)
    private BigDecimal msrp;

    @Column(length = 10)
    private String currency = "VND";

    @Column(length = 150)
    private String location;

    @Column(name = "thumbnail_url", length = 500)
    private String thumbnailUrl;

    @ElementCollection
    @CollectionTable(name = "listing_images", joinColumns = @JoinColumn(name = "listing_id"))
    @Column(name = "image_url", length = 500)
    private List<String> imageUrls = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private ListingState state = ListingState.DRAFT;

    @Column(name = "is_hidden", nullable = false)
    private boolean hidden = false;

    @Column(name = "hidden_at")
    private LocalDateTime hiddenAt;

    @Column(name = "listing_expires_at")
    private LocalDateTime listingExpiresAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id", nullable = false)
    private User seller;

    @Column(length = 3000)
    private String description;

    @Column(name = "published_at")
    private LocalDateTime publishedAt;

    @Column(name = "certification_status", length = 50)
    private String certificationStatus = "UNVERIFIED";

    @Column(name = "inspection_need_update_reason", length = 1000)
    private String inspectionNeedUpdateReason;

    /** NEW, LIKE_NEW, MINT_USED, GOOD_USED, FAIR_USED — khớp Node Listing.condition */
    @Column(name = "condition_code", length = 32)
    private String condition;

    @Column(name = "inspection_result", length = 20)
    private String inspectionResult;

    @Column(name = "inspection_score")
    private Double inspectionScore;

    @Column(name = "inspection_report_json", columnDefinition = "TEXT")
    private String inspectionReportJson;

    @Column(name = "seller_shipped_to_warehouse_at")
    private LocalDateTime sellerShippedToWarehouseAt;

    @Column(name = "warehouse_intake_verified_at")
    private LocalDateTime warehouseIntakeVerifiedAt;

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getBrand() {
        return brand;
    }

    public void setBrand(String brand) {
        this.brand = brand;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public Integer getYear() {
        return year;
    }

    public void setYear(Integer year) {
        this.year = year;
    }

    public String getFrameSize() {
        return frameSize;
    }

    public void setFrameSize(String frameSize) {
        this.frameSize = frameSize;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public BigDecimal getMsrp() {
        return msrp;
    }

    public void setMsrp(BigDecimal msrp) {
        this.msrp = msrp;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getThumbnailUrl() {
        return thumbnailUrl;
    }

    public void setThumbnailUrl(String thumbnailUrl) {
        this.thumbnailUrl = thumbnailUrl;
    }

    public List<String> getImageUrls() {
        return imageUrls;
    }

    public void setImageUrls(List<String> imageUrls) {
        this.imageUrls = imageUrls;
    }

    public ListingState getState() {
        return state;
    }

    public void setState(ListingState state) {
        this.state = state;
    }

    public boolean isHidden() {
        return hidden;
    }

    public void setHidden(boolean hidden) {
        this.hidden = hidden;
    }

    public LocalDateTime getHiddenAt() {
        return hiddenAt;
    }

    public void setHiddenAt(LocalDateTime hiddenAt) {
        this.hiddenAt = hiddenAt;
    }

    public LocalDateTime getListingExpiresAt() {
        return listingExpiresAt;
    }

    public void setListingExpiresAt(LocalDateTime listingExpiresAt) {
        this.listingExpiresAt = listingExpiresAt;
    }

    public User getSeller() {
        return seller;
    }

    public void setSeller(User seller) {
        this.seller = seller;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getPublishedAt() {
        return publishedAt;
    }

    public void setPublishedAt(LocalDateTime publishedAt) {
        this.publishedAt = publishedAt;
    }

    public String getCertificationStatus() {
        return certificationStatus;
    }

    public void setCertificationStatus(String certificationStatus) {
        this.certificationStatus = certificationStatus;
    }

    public String getInspectionNeedUpdateReason() {
        return inspectionNeedUpdateReason;
    }

    public void setInspectionNeedUpdateReason(String inspectionNeedUpdateReason) {
        this.inspectionNeedUpdateReason = inspectionNeedUpdateReason;
    }

    public String getCondition() {
        return condition;
    }

    public void setCondition(String condition) {
        this.condition = condition;
    }

    public String getInspectionResult() {
        return inspectionResult;
    }

    public void setInspectionResult(String inspectionResult) {
        this.inspectionResult = inspectionResult;
    }

    public Double getInspectionScore() {
        return inspectionScore;
    }

    public void setInspectionScore(Double inspectionScore) {
        this.inspectionScore = inspectionScore;
    }

    public String getInspectionReportJson() {
        return inspectionReportJson;
    }

    public void setInspectionReportJson(String inspectionReportJson) {
        this.inspectionReportJson = inspectionReportJson;
    }

    public LocalDateTime getSellerShippedToWarehouseAt() {
        return sellerShippedToWarehouseAt;
    }

    public void setSellerShippedToWarehouseAt(LocalDateTime sellerShippedToWarehouseAt) {
        this.sellerShippedToWarehouseAt = sellerShippedToWarehouseAt;
    }

    public LocalDateTime getWarehouseIntakeVerifiedAt() {
        return warehouseIntakeVerifiedAt;
    }

    public void setWarehouseIntakeVerifiedAt(LocalDateTime warehouseIntakeVerifiedAt) {
        this.warehouseIntakeVerifiedAt = warehouseIntakeVerifiedAt;
    }
}
