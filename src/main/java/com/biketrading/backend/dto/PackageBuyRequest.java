package com.biketrading.backend.dto;

import lombok.Data;

@Data
public class PackageBuyRequest {
    private String plan; // BASIC, VIP, hoặc INSPECTION
}