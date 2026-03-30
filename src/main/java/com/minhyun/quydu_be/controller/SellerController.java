package com.minhyun.quydu_be.controller;

import com.minhyun.quydu_be.dto.ApiResponse;
import com.minhyun.quydu_be.dto.request.PublishListingRequest;
import com.minhyun.quydu_be.dto.request.SubscriptionCheckoutRequest;
import com.minhyun.quydu_be.dto.request.UpsertListingRequest;
import com.minhyun.quydu_be.service.SellerService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/seller")
@PreAuthorize("hasAnyRole('SELLER','ADMIN')")
public class SellerController {

    private final SellerService sellerService;

    public SellerController(SellerService sellerService) {
        this.sellerService = sellerService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<Map<String, Object>>> dashboard() {
        return ResponseEntity.ok(new ApiResponse<>(true, "Fetched dashboard", sellerService.dashboard()));
    }

    @GetMapping("/ratings")
    public ResponseEntity<ApiResponse<Map<String, Object>>> ratings() {
        return ResponseEntity.ok(new ApiResponse<>(true, "Fetched ratings", sellerService.getRatings()));
    }

    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> orders() {
        return ResponseEntity.ok(new ApiResponse<>(true, "Fetched orders", sellerService.listOrders()));
    }

    @PutMapping("/orders/{orderId}/ship-to-buyer")
    public ResponseEntity<ApiResponse<Map<String, Object>>> shipToBuyer(@PathVariable Long orderId) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Shipped to buyer", sellerService.shipToBuyer(orderId)));
    }

    @PutMapping("/orders/{orderId}/ship-to-warehouse")
    public ResponseEntity<ApiResponse<Map<String, Object>>> shipToWarehouse(@PathVariable Long orderId) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Shipped to warehouse", sellerService.shipToWarehouse(orderId)));
    }

    @PutMapping("/listings/{id}/mark-shipped-to-warehouse")
    public ResponseEntity<ApiResponse<Map<String, Object>>> markShipped(@PathVariable Long id) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Listing marked shipped", sellerService.markListingShippedToWarehouse(id)));
    }

    @GetMapping("/listings")
    public ResponseEntity<Map<String, Object>> listings() {
        return ResponseEntity.ok(Map.of("content", sellerService.listMyListings()));
    }

    @PostMapping("/listings/upload-images")
    public ResponseEntity<ApiResponse<Map<String, Object>>> upload(@RequestParam("images") MultipartFile[] images) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Uploaded images", sellerService.uploadImages(images)));
    }

    @GetMapping("/listings/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getListing(@PathVariable Long id) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Fetched listing", sellerService.getMyListing(id)));
    }

    @PostMapping("/listings")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createListing(@Valid @RequestBody UpsertListingRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(new ApiResponse<>(true, "Created listing", sellerService.createListing(request)));
    }

    @PutMapping("/listings/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateListing(@PathVariable Long id, @Valid @RequestBody UpsertListingRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Updated listing", sellerService.updateListing(id, request)));
    }

    @PutMapping("/listings/{id}/publish")
    public ResponseEntity<ApiResponse<Map<String, Object>>> publish(@PathVariable Long id, @RequestBody(required = false) PublishListingRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Published listing", sellerService.publishListing(id, request == null ? new PublishListingRequest() : request)));
    }

    @PutMapping("/listings/{id}/submit")
    public ResponseEntity<ApiResponse<Map<String, Object>>> submit(@PathVariable Long id) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Submitted for inspection", sellerService.submitForInspection(id)));
    }

    @PostMapping("/subscription/checkout")
    public ResponseEntity<ApiResponse<Map<String, Object>>> checkout(@Valid @RequestBody SubscriptionCheckoutRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(new ApiResponse<>(true, "Subscription checkout created", sellerService.checkoutSubscription(request)));
    }

    @PostMapping("/subscription/orders/{orderId}/mock-complete")
    public ResponseEntity<ApiResponse<Map<String, Object>>> completeSub(@PathVariable Long orderId) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Subscription completed", sellerService.mockCompleteSubscriptionOrder(orderId)));
    }

    @PutMapping("/subscription/revoke-self")
    public ResponseEntity<ApiResponse<Map<String, Object>>> revokeSub() {
        return ResponseEntity.ok(new ApiResponse<>(true, "Subscription revoked", sellerService.revokeSelfSubscription()));
    }
}
