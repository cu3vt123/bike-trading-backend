package com.biketrading.backend.controller;

import com.biketrading.backend.entity.Seller;
import com.biketrading.backend.repository.SellerRepository;
import com.biketrading.backend.service.SellerService;
import com.biketrading.backend.dto.LoginRequest;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;



@RestController
@RequestMapping("/api/auth")
public class SellerController {

    @Autowired
    private SellerService sellerService;

    @Autowired
    private SellerRepository sellerRepository;

    // Signup
        // POST http://localhost:8081/api/auth/signup
    @Operation(
            summary = "Signup seller",
            description = "Create a new seller account. Returns created seller profile."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Seller created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid input data")
    })
    @PostMapping("/signup")
    public ResponseEntity<Seller> signup(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    required = true,
                    content = @Content(
                            examples = @ExampleObject(
                                    name = "SignupExample",
                                    value = """
                                {
                                  "username": "buyer_demo",
                                  "password": "123456",
                                  "email": "demo@gmail.com",
                                  "phone": "0900000000",
                                  "shopName": "Demo Bike Shop"
                                }
                                """
                            )
                    )
            )
            @RequestBody Seller seller
    ) {
        return ResponseEntity.status(201).body(
                sellerService.createSeller(seller)
        );
    }

    //  (Login)
    // POST http://localhost:8081/api/auth/login
    @Operation(
            summary = "Login seller",
            description = "Authenticate seller by username/password. Returns seller profile when success."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Login successful"),
            @ApiResponse(responseCode = "401", description = "Invalid username or password",
                    content = @Content(examples = @ExampleObject(value = "\"Sai tài khoản hoặc mật khẩu\"")))
    })
    @PostMapping("/login")
    public ResponseEntity<?> login(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    required = true,
                    content = @Content(
                            examples = @ExampleObject(
                                    name = "LoginExample",
                                    value = """
                                {
                                  "username": "buyer_demo",
                                  "password": "123456"
                                }
                                """
                            )
                    )
            )
            @RequestBody LoginRequest loginInfo
    ) {
        Seller user = sellerRepository.findByUsernameAndPassword(
                loginInfo.getUsername(),
                loginInfo.getPassword()
        );

        if (user != null) {
            return ResponseEntity.ok(user);
        }
        return ResponseEntity.status(401).body("Sai tài khoản hoặc mật khẩu");
    }

    // xem Profile shop
    // GET http://localhost:8081/api/auth/profile/{id}
    @Operation(
            summary = "Get seller profile",
            description = "Get seller/shop profile by id."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "OK"),
            @ApiResponse(responseCode = "404", description = "Seller not found")
    })
    @GetMapping("/profile/{id}")
    public ResponseEntity<Seller> getProfile(@PathVariable Long id) {
        Seller seller = sellerService.getSellerById(id);
        if (seller == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(seller);
    }
}