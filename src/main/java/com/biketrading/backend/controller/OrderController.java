package com.biketrading.backend.controller;

import com.biketrading.backend.dto.OrderDTO;
import com.biketrading.backend.entity.Order;
import com.biketrading.backend.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid; // Thư viện cực kỳ quan trọng
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @Operation(summary = "Create order", description = "Buyer creates an order for a bike listing.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Created thành công"),
            @ApiResponse(responseCode = "400", description = "Dữ liệu nhập vào bị thiếu hoặc sai định dạng")
    })
    @PostMapping
    public ResponseEntity<Order> createOrder(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    required = true,
                    content = @Content(
                            examples = @ExampleObject(
                                    name = "CreateOrderExample",
                                    value = """
                                    {
                                      "bikeId": 1,
                                      "buyerId": 1,
                                      "amount": 3500000,
                                      "status": "PENDING"
                                    }
                                    """
                            )
                    )
            )
            @Valid @RequestBody OrderDTO orderDTO // Dùng @Valid để hứng lỗi 400
    ) {
        // Map dữ liệu từ DTO sang Entity trước khi gọi Service
        Order order = new Order();
        order.setBikeId(orderDTO.getBikeId());
        order.setBuyerId(orderDTO.getBuyerId());
        order.setAmount(orderDTO.getAmount());
        order.setStatus(orderDTO.getStatus());

        return ResponseEntity.status(HttpStatus.CREATED).body(orderService.createOrder(order));
    }

    @Operation(summary = "Pay for an order", description = "Buyer pays deposit/payment for an order.")
    @PutMapping("/{id}/pay")
    public ResponseEntity<Order> payDeposit(
            @Parameter(description = "Order id", example = "1")
            @PathVariable Long id
    ) {
        Order paidOrder = orderService.payDeposit(id);
        if (paidOrder != null) {
            return ResponseEntity.ok(paidOrder);
        }
        return ResponseEntity.notFound().build();
    }
}