package com.bob.planb.entity;

public enum OrderStatus {
    PENDING,
    PENDING_SELLER_SHIP,
    SELLER_SHIPPED,
    AT_WAREHOUSE_PENDING_ADMIN,
    RE_INSPECTION,
    RE_INSPECTION_DONE,
    SHIPPING,
    DELIVERED,
    COMPLETED, // Đã thêm COMPLETED
    CANCELLED  // Đã thêm CANCELLED
}