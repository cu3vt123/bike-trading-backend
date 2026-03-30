package com.minhyun.quydu_be.controller;

import com.minhyun.quydu_be.dto.ApiResponse;
import com.minhyun.quydu_be.dto.request.AdminBrandRequest;
import com.minhyun.quydu_be.dto.request.AdminUpdateReviewRequest;
import com.minhyun.quydu_be.dto.request.WarehouseReInspectionRequest;
import com.minhyun.quydu_be.service.AdminService;
import com.minhyun.quydu_be.service.BrandService;
import java.util.List;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;
    private final BrandService brandService;

    public AdminController(AdminService adminService, BrandService brandService) {
        this.adminService = adminService;
        this.brandService = brandService;
    }

    @GetMapping("/orders/warehouse-pending")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> listWarehousePending() {
        return ResponseEntity.ok(new ApiResponse<>(true, "Fetched warehouse pending orders", adminService.listWarehousePending()));
    }

    @PutMapping("/orders/{id}/confirm-warehouse")
    public ResponseEntity<ApiResponse<Map<String, Object>>> confirmWarehouse(@PathVariable Long id) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Warehouse confirmed", adminService.confirmWarehouse(id)));
    }

    @GetMapping("/orders/re-inspection")
    @PreAuthorize("hasAnyRole('ADMIN','INSPECTOR')")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> listReInspection() {
        return ResponseEntity.ok(new ApiResponse<>(true, "Fetched re-inspection orders", adminService.listReInspectionOrders()));
    }

    @PutMapping("/orders/{id}/re-inspection-done")
    @PreAuthorize("hasAnyRole('ADMIN','INSPECTOR')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> reInspectionDone(@PathVariable Long id) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Re-inspection done", adminService.markReInspectionDone(id)));
    }

    @GetMapping("/dashboard/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> stats() {
        return ResponseEntity.ok(new ApiResponse<>(true, "Fetched stats", adminService.getStats()));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> users() {
        return ResponseEntity.ok(new ApiResponse<>(true, "Fetched users", adminService.listUsers()));
    }

    @PutMapping("/users/{id}/hide")
    public ResponseEntity<ApiResponse<Map<String, Object>>> hideUser(@PathVariable Long id) {
        return ResponseEntity.ok(new ApiResponse<>(true, "User hidden", adminService.hideUser(id)));
    }

    @PutMapping("/users/{id}/unhide")
    public ResponseEntity<ApiResponse<Map<String, Object>>> unhideUser(@PathVariable Long id) {
        return ResponseEntity.ok(new ApiResponse<>(true, "User unhidden", adminService.unhideUser(id)));
    }

    @GetMapping("/listings/pending-warehouse-intake")
    @PreAuthorize("hasAnyRole('ADMIN','INSPECTOR')")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> pendingWarehouseIntake() {
        return ResponseEntity.ok(new ApiResponse<>(true, "Fetched pending warehouse intake", adminService.listWarehouseIntakePending()));
    }

    @PutMapping("/listings/{id}/confirm-warehouse-intake")
    public ResponseEntity<ApiResponse<Map<String, Object>>> confirmWarehouseIntake(@PathVariable Long id) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Warehouse intake confirmed", adminService.confirmWarehouseIntake(id)));
    }

    @PutMapping("/listings/{id}/confirm-warehouse-re-inspection")
    @PreAuthorize("hasAnyRole('ADMIN','INSPECTOR')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> confirmWarehouseReInspection(
        @PathVariable Long id,
        @RequestBody(required = false) WarehouseReInspectionRequest request
    ) {
        String action = request == null ? null : request.getAction();
        String reason = request == null ? null : request.getReason();
        return ResponseEntity.ok(new ApiResponse<>(true, "Warehouse re-inspection confirmed", adminService.confirmWarehouseReInspection(id, action, reason)));
    }

    @GetMapping("/listings")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> listings() {
        return ResponseEntity.ok(new ApiResponse<>(true, "Fetched listings", adminService.listListings()));
    }

    @PutMapping("/listings/{id}/hide")
    public ResponseEntity<ApiResponse<Map<String, Object>>> hideListing(@PathVariable Long id) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Listing hidden", adminService.hideListing(id)));
    }

    @PutMapping("/listings/{id}/unhide")
    public ResponseEntity<ApiResponse<Map<String, Object>>> unhideListing(@PathVariable Long id) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Listing unhidden", adminService.unhideListing(id)));
    }

    @GetMapping("/reviews")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> reviews() {
        return ResponseEntity.ok(new ApiResponse<>(true, "Fetched reviews", adminService.listReviews()));
    }

    @PutMapping("/reviews/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateReview(@PathVariable Long id, @RequestBody AdminUpdateReviewRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Review updated", adminService.updateReview(
            id,
            request == null ? null : request.getRating(),
            request == null ? null : request.getComment(),
            request == null ? null : request.getStatus()
        )));
    }

    @GetMapping("/seller-subscriptions")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> sellerSubscriptions() {
        return ResponseEntity.ok(new ApiResponse<>(true, "Fetched seller subscriptions", adminService.listSellerSubscriptions()));
    }

    @PutMapping("/users/{id}/revoke-subscription")
    public ResponseEntity<ApiResponse<Map<String, Object>>> revokeSubscription(@PathVariable Long id) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Subscription revoked", adminService.revokeSellerSubscription(id)));
    }

    @GetMapping("/brands")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> brands() {
        return ResponseEntity.ok(new ApiResponse<>(true, "Fetched brands", brandService.adminListBrands()));
    }

    @PostMapping("/brands")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createBrand(@RequestBody AdminBrandRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Created brand", brandService.adminCreateBrand(
            request == null ? null : request.getName(),
            request == null ? null : request.getSlug()
        )));
    }

    @PutMapping("/brands/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateBrand(@PathVariable Long id, @RequestBody AdminBrandRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Updated brand", brandService.adminUpdateBrand(
            id,
            request == null ? null : request.getName(),
            request == null ? null : request.getSlug(),
            request == null ? null : request.getActive()
        )));
    }

    @DeleteMapping("/brands/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> deleteBrand(@PathVariable Long id) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Deleted brand", brandService.adminDeleteBrand(id)));
    }
}
