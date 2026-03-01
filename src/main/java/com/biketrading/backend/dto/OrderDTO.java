package com.biketrading.backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data // Cái này cực quan trọng để nó tự sinh ra getAmount() và getStatus()
@AllArgsConstructor
@NoArgsConstructor
public class OrderDTO {

    @NotNull(message = "ID xe đạp không được để trống!")
    private Long bikeId;

    @NotNull(message = "ID người mua không được để trống!")
    private Long buyerId;

    @NotNull(message = "Số tiền không được để trống!")
    @Min(value = 1000, message = "Số tiền tối thiểu là 1000 VNĐ")
    private Double amount; // Đổi tên thành amount cho khớp Controller

    private String status = "PENDING"; // Thêm trường status
}