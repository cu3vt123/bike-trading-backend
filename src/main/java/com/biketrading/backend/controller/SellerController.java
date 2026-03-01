package com.biketrading.backend.controller;

import com.biketrading.backend.dto.SellerDTO;
import com.biketrading.backend.entity.Seller;
import com.biketrading.backend.service.SellerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sellers") // Đổi sang /sellers để phân biệt với /auth
public class SellerController {

    @Autowired
    private SellerService sellerService;

    @Operation(summary = "Đăng ký Seller mới", description = "Tạo tài khoản người bán hàng trên hệ thống.")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Tạo thành công"),
            @ApiResponse(responseCode = "400", description = "Dữ liệu nhập vào không hợp lệ"),
            @ApiResponse(responseCode = "409", description = "Username hoặc Email đã tồn tại")
    })
    @PostMapping("/signup")
    public ResponseEntity<Seller> register(@Valid @RequestBody SellerDTO sellerDTO) {
        // Map từ DTO sang Entity (Sau này dùng ModelMapper cho nhanh nhé anh)
        Seller seller = new Seller();
        seller.setUsername(sellerDTO.getUsername());
        seller.setPassword(sellerDTO.getPassword()); // Trong Service sẽ mã hóa password sau
        seller.setEmail(sellerDTO.getEmail());
        seller.setPhone(sellerDTO.getPhone());
        seller.setShopName(sellerDTO.getShopName());

        return ResponseEntity.status(HttpStatus.CREATED).body(sellerService.createSeller(seller));
    }

    @Operation(summary = "Lấy thông tin Seller", description = "Lấy chi tiết Profile của người bán theo ID.")
    @GetMapping("/{id}")
    public ResponseEntity<Seller> getSeller(@PathVariable Long id) {
        return ResponseEntity.ok(sellerService.getSellerById(id));
    }

    @Operation(summary = "Lấy danh sách Seller", description = "Lấy toàn bộ danh sách người bán trên hệ thống.")
    @GetMapping
    public ResponseEntity<List<Seller>> getAllSellers() {
        return ResponseEntity.ok(sellerService.getAllSellers());
    }
}