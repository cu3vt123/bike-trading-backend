package com.bob.planb.dto;

import lombok.Data;

@Data
public class PublishListingRequest {
    private boolean requestInspection; // true: Gửi kiểm định, false: Đăng thẳng lên sàn
}