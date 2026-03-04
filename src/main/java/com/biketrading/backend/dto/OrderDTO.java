package com.biketrading.backend.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OrderDTO {

    @NotNull(message = "ID xe đạp không được để trống!")
    private Long bikeId;

    private Long buyerId;

    // Đã xóa @NotNull ở đây để chiều theo Frontend
    private BigDecimal amount;

    private String status = "PENDING";
}