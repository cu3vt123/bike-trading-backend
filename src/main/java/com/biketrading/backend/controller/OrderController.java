package com.biketrading.backend.controller;

import com.biketrading.backend.entity.Order;
import com.biketrading.backend.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @Operation(
            summary = "Create order",
            description = "Buyer creates an order for a bike listing."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Created"),
            @ApiResponse(responseCode = "400", description = "Validation error")
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
            @RequestBody Order order
    ) {
        return ResponseEntity.status(201).body(orderService.createOrder(order));
    }

    @Operation(
            summary = "Pay for an order",
            description = "Buyer pays deposit/payment for an order. Updates order status."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "OK"),
            @ApiResponse(responseCode = "404", description = "Order not found", content = @Content())
    })
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