package com.minhyun.quydu_be.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;

@Entity
@Table(name = "package_orders")
public class PackageOrder extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id", nullable = false)
    private User seller;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SubscriptionPlan plan;

    @Column(nullable = false, length = 20)
    private String provider = "VNPAY";

    @Column(name = "amount_vnd", nullable = false, precision = 18, scale = 2)
    private BigDecimal amountVnd;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PackageOrderStatus status = PackageOrderStatus.PENDING;

    @Column(name = "payment_url", length = 1000)
    private String paymentUrl;

    public User getSeller() { return seller; }
    public void setSeller(User seller) { this.seller = seller; }
    public SubscriptionPlan getPlan() { return plan; }
    public void setPlan(SubscriptionPlan plan) { this.plan = plan; }
    public String getProvider() { return provider; }
    public void setProvider(String provider) { this.provider = provider; }
    public BigDecimal getAmountVnd() { return amountVnd; }
    public void setAmountVnd(BigDecimal amountVnd) { this.amountVnd = amountVnd; }
    public PackageOrderStatus getStatus() { return status; }
    public void setStatus(PackageOrderStatus status) { this.status = status; }
    public String getPaymentUrl() { return paymentUrl; }
    public void setPaymentUrl(String paymentUrl) { this.paymentUrl = paymentUrl; }
}
