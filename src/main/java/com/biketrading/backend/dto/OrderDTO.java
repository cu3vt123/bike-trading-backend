package com.biketrading.backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data; // Phải có cái này
import lombok.NoArgsConstructor;

import java.math.BigDecimal; // Import này cực kỳ quan trọng

@Data // "Bùa" này để tự tạo Getter/Setter
@AllArgsConstructor
@NoArgsConstructor
public class OrderDTO {

    @NotNull(message = "ID xe đạp không được để trống!")
    private Long bikeId;

    @NotNull(message = "ID người mua không được để trống!")
    private Long buyerId;

    @NotNull(message = "Số tiền không được để trống!")
    @Min(value = 1000, message = "Số tiền tối thiểu là 1000 VNĐ")
    private BigDecimal amount; // Chuẩn BigDecimal để lưu tiền cho chính xác

    private String status = "PENDING";
}