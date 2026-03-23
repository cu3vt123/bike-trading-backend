package com.biketrading.backend.enums;

public enum PaymentStatus {
    PENDING,    // Đang chờ quét mã
    SUCCESS,    // Đã thanh toán thành công
    FAILED      // Thanh toán thất bại hoặc hủy
}