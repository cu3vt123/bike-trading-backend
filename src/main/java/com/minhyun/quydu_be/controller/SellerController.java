package com.minhyun.quydu_be.controller;

import com.minhyun.quydu_be.dto.request.PublishListingRequest;
import com.minhyun.quydu_be.dto.request.SubscriptionCheckoutRequest;
import com.minhyun.quydu_be.dto.request.UpsertListingRequest;
import com.minhyun.quydu_be.service.SellerService;
import com.minhyun.quydu_be.web.RestResponses;
import jakarta.validation.Valid;
import java.util.Map;
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
    public ResponseEntity<Map<String, Object>> dashboard() {
        return RestResponses.okData(sellerService.dashboard());
    }

    @GetMapping("/ratings")
    public ResponseEntity<Map<String, Object>> ratings() {
        return RestResponses.okData(sellerService.getRatings());
    }

    @GetMapping("/orders")
    public ResponseEntity<Map<String, Object>> orders() {
        return RestResponses.okData(sellerService.listOrders());
    }

    @PutMapping("/orders/{orderId}/ship-to-buyer")
    public ResponseEntity<Map<String, Object>> shipToBuyer(@PathVariable Long orderId) {
        return RestResponses.okData(sellerService.shipToBuyer(orderId));
    }

    @PutMapping("/orders/{orderId}/ship-to-warehouse")
    public ResponseEntity<Map<String, Object>> shipToWarehouse(@PathVariable Long orderId) {
        return RestResponses.okData(sellerService.shipToWarehouse(orderId));
    }

    @PutMapping("/listings/{id}/mark-shipped-to-warehouse")
    public ResponseEntity<Map<String, Object>> markShipped(@PathVariable Long id) {
        return RestResponses.okData(sellerService.markListingShippedToWarehouse(id));
    }

    @GetMapping("/listings")
    public ResponseEntity<Map<String, Object>> listings() {
        return RestResponses.okContent(sellerService.listMyListings());
    }

    @PostMapping("/listings/upload-images")
    public ResponseEntity<Map<String, Object>> upload(@RequestParam("images") MultipartFile[] images) {
        return RestResponses.okData(sellerService.uploadImages(images));
    }

    @GetMapping("/listings/{id}")
    public ResponseEntity<Map<String, Object>> getListing(@PathVariable Long id) {
        return RestResponses.okData(sellerService.getMyListing(id));
    }

    @PostMapping("/listings")
    public ResponseEntity<Map<String, Object>> createListing(@Valid @RequestBody UpsertListingRequest request) {
        return RestResponses.createdData(sellerService.createListing(request));
    }

    @PutMapping("/listings/{id}")
    public ResponseEntity<Map<String, Object>> updateListing(@PathVariable Long id, @Valid @RequestBody UpsertListingRequest request) {
        return RestResponses.okData(sellerService.updateListing(id, request));
    }

    @PutMapping("/listings/{id}/publish")
    public ResponseEntity<Map<String, Object>> publish(@PathVariable Long id, @RequestBody(required = false) PublishListingRequest request) {
        return RestResponses.okData(sellerService.publishListing(id, request == null ? new PublishListingRequest() : request));
    }

    @PutMapping("/listings/{id}/submit")
    public ResponseEntity<Map<String, Object>> submit(@PathVariable Long id) {
        return RestResponses.okData(sellerService.submitForInspection(id));
    }

    @PostMapping("/subscription/checkout")
    public ResponseEntity<Map<String, Object>> checkout(@Valid @RequestBody SubscriptionCheckoutRequest request) {
        return RestResponses.createdData(sellerService.checkoutSubscription(request));
    }

    @PostMapping("/subscription/orders/{orderId}/mock-complete")
    public ResponseEntity<Map<String, Object>> completeSub(@PathVariable Long orderId) {
        return RestResponses.okData(sellerService.mockCompleteSubscriptionOrder(orderId));
    }

    @PutMapping("/subscription/revoke-self")
    public ResponseEntity<Map<String, Object>> revokeSub() {
        return RestResponses.okData(sellerService.revokeSelfSubscription());
    }
}

