package com.biketrading.backend.dto;

import jakarta.validation.constraints.Min;
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

    // BỎ @NotNull Ở ĐÂY VÌ MÌNH SẼ LẤY TỪ TOKEN
    // @NotNull(message = "ID người mua không được để trống!")
    private Long buyerId;

    @NotNull(message = "Số tiền không được để trống!")
    @Min(value = 1000, message = "Số tiền tối thiểu là 1000 VNĐ")
    private BigDecimal amount;

    private String status = "PENDING";
}