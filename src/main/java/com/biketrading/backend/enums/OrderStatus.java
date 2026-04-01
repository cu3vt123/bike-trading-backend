package com.biketrading.backend.enums;

public enum OrderStatus {
    PENDING,
    RESERVED,                 // Đã đặt cọc
    PENDING_SELLER_SHIP,      // Chờ seller gửi xe tới kho
    SELLER_SHIPPED,           // Seller đã gửi, chờ kho nhận
    AT_WAREHOUSE_PENDING_ADMIN, // Xe tại kho, chờ admin xác nhận
    RE_INSPECTION,            // Đang kiểm định lại tại kho
    RE_INSPECTION_DONE,       // Inspector đã xác nhận
    SHIPPING,                 // Đang giao hàng cho buyer
    IN_TRANSACTION,
    COMPLETED,                // Hoàn thành
    CANCELLED,
    REFUNDED
}