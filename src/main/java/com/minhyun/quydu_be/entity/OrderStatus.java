package com.minhyun.quydu_be.entity;

public enum OrderStatus {
    PENDING,
    RESERVED,
    PENDING_SELLER_SHIP,
    SELLER_SHIPPED,
    AT_WAREHOUSE_PENDING_ADMIN,
    RE_INSPECTION,
    RE_INSPECTION_DONE,
    SHIPPING,
    IN_TRANSACTION,
    COMPLETED,
    CANCELLED,
    REFUNDED
}
