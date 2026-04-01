package com.minhyun.quydu_be.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "orders")
public class Order extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "buyer_id", nullable = false)
    private User buyer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "listing_id", nullable = false)
    private Listing listing;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private OrderStatus status = OrderStatus.RESERVED;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private OrderPlan plan = OrderPlan.DEPOSIT;

    @Enumerated(EnumType.STRING)
    @Column(name = "fulfillment_type", nullable = false, length = 20)
    private OrderFulfillmentType fulfillmentType = OrderFulfillmentType.WAREHOUSE;

    @Column(name = "total_price", nullable = false, precision = 18, scale = 2)
    private BigDecimal totalPrice;

    @Column(name = "deposit_amount", precision = 18, scale = 2)
    private BigDecimal depositAmount;

    @Column(name = "deposit_paid", nullable = false)
    private boolean depositPaid = false;

    @Column(name = "balance_paid", nullable = false)
    private boolean balancePaid = false;

    @Embedded
    private ShippingAddress shippingAddress;

    @Column(name = "shipped_at")
    private LocalDateTime shippedAt;

    @Column(name = "warehouse_confirmed_at")
    private LocalDateTime warehouseConfirmedAt;

    @Column(name = "re_inspection_done_at")
    private LocalDateTime reInspectionDoneAt;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    /** Thời điểm buyer chủ động hủy qua API (không set khi hết hạn giữ chỗ tự động). Dùng giới hạn chống spam hủy. */
    @Column(name = "buyer_cancelled_at")
    private LocalDateTime buyerCancelledAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "vnpay_payment_status", length = 30)
    private VnpayPaymentStatus vnpayPaymentStatus;

    @Column(name = "vnpay_amount_vnd", precision = 18, scale = 2)
    private BigDecimal vnpayAmountVnd;

    public User getBuyer() { return buyer; }
    public void setBuyer(User buyer) { this.buyer = buyer; }
    public Listing getListing() { return listing; }
    public void setListing(Listing listing) { this.listing = listing; }
    public OrderStatus getStatus() { return status; }
    public void setStatus(OrderStatus status) { this.status = status; }
    public OrderPlan getPlan() { return plan; }
    public void setPlan(OrderPlan plan) { this.plan = plan; }
    public OrderFulfillmentType getFulfillmentType() { return fulfillmentType; }
    public void setFulfillmentType(OrderFulfillmentType fulfillmentType) { this.fulfillmentType = fulfillmentType; }
    public BigDecimal getTotalPrice() { return totalPrice; }
    public void setTotalPrice(BigDecimal totalPrice) { this.totalPrice = totalPrice; }
    public BigDecimal getDepositAmount() { return depositAmount; }
    public void setDepositAmount(BigDecimal depositAmount) { this.depositAmount = depositAmount; }
    public boolean isDepositPaid() { return depositPaid; }
    public void setDepositPaid(boolean depositPaid) { this.depositPaid = depositPaid; }
    public boolean isBalancePaid() { return balancePaid; }
    public void setBalancePaid(boolean balancePaid) { this.balancePaid = balancePaid; }
    public ShippingAddress getShippingAddress() { return shippingAddress; }
    public void setShippingAddress(ShippingAddress shippingAddress) { this.shippingAddress = shippingAddress; }
    public LocalDateTime getShippedAt() { return shippedAt; }
    public void setShippedAt(LocalDateTime shippedAt) { this.shippedAt = shippedAt; }
    public LocalDateTime getWarehouseConfirmedAt() { return warehouseConfirmedAt; }
    public void setWarehouseConfirmedAt(LocalDateTime warehouseConfirmedAt) { this.warehouseConfirmedAt = warehouseConfirmedAt; }
    public LocalDateTime getReInspectionDoneAt() { return reInspectionDoneAt; }
    public void setReInspectionDoneAt(LocalDateTime reInspectionDoneAt) { this.reInspectionDoneAt = reInspectionDoneAt; }
    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }
    public LocalDateTime getBuyerCancelledAt() { return buyerCancelledAt; }
    public void setBuyerCancelledAt(LocalDateTime buyerCancelledAt) { this.buyerCancelledAt = buyerCancelledAt; }
    public VnpayPaymentStatus getVnpayPaymentStatus() { return vnpayPaymentStatus; }
    public void setVnpayPaymentStatus(VnpayPaymentStatus vnpayPaymentStatus) { this.vnpayPaymentStatus = vnpayPaymentStatus; }
    public BigDecimal getVnpayAmountVnd() { return vnpayAmountVnd; }
    public void setVnpayAmountVnd(BigDecimal vnpayAmountVnd) { this.vnpayAmountVnd = vnpayAmountVnd; }
}
