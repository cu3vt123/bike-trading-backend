package com.minhyun.quydu_be.controller;

import com.minhyun.quydu_be.dto.request.AdminBrandRequest;
import com.minhyun.quydu_be.dto.request.AdminUpdateReviewRequest;
import com.minhyun.quydu_be.dto.request.WarehouseReInspectionRequest;
import com.minhyun.quydu_be.service.AdminService;
import com.minhyun.quydu_be.service.BrandService;
import com.minhyun.quydu_be.web.RestResponses;
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
    public ResponseEntity<Map<String, Object>> listWarehousePending() {
        return RestResponses.okData(adminService.listWarehousePending());
    }

    @PutMapping("/orders/{id}/confirm-warehouse")
    public ResponseEntity<Map<String, Object>> confirmWarehouse(@PathVariable Long id) {
        return RestResponses.okData(adminService.confirmWarehouse(id));
    }

    @GetMapping("/orders/re-inspection")
    @PreAuthorize("hasAnyRole('ADMIN','INSPECTOR')")
    public ResponseEntity<Map<String, Object>> listReInspection() {
        return RestResponses.okData(adminService.listReInspectionOrders());
    }

    @PutMapping("/orders/{id}/re-inspection-done")
    @PreAuthorize("hasAnyRole('ADMIN','INSPECTOR')")
    public ResponseEntity<Map<String, Object>> reInspectionDone(@PathVariable Long id) {
        return RestResponses.okData(adminService.markReInspectionDone(id));
    }

    @GetMapping("/dashboard/stats")
    public ResponseEntity<Map<String, Object>> stats() {
        return RestResponses.okData(adminService.getStats());
    }

    @GetMapping("/users")
    public ResponseEntity<Map<String, Object>> users() {
        return RestResponses.okData(adminService.listUsers());
    }

    @PutMapping("/users/{id}/hide")
    public ResponseEntity<Map<String, Object>> hideUser(@PathVariable Long id) {
        return RestResponses.okData(adminService.hideUser(id));
    }

    @PutMapping("/users/{id}/unhide")
    public ResponseEntity<Map<String, Object>> unhideUser(@PathVariable Long id) {
        return RestResponses.okData(adminService.unhideUser(id));
    }

    @GetMapping("/listings/pending-warehouse-intake")
    @PreAuthorize("hasAnyRole('ADMIN','INSPECTOR')")
    public ResponseEntity<Map<String, Object>> pendingWarehouseIntake() {
        return RestResponses.okData(adminService.listWarehouseIntakePending());
    }

    @PutMapping("/listings/{id}/confirm-warehouse-intake")
    public ResponseEntity<Map<String, Object>> confirmWarehouseIntake(@PathVariable Long id) {
        return RestResponses.okData(adminService.confirmWarehouseIntake(id));
    }

    @PutMapping("/listings/{id}/confirm-warehouse-re-inspection")
    @PreAuthorize("hasAnyRole('ADMIN','INSPECTOR')")
    public ResponseEntity<Map<String, Object>> confirmWarehouseReInspection(
        @PathVariable Long id,
        @RequestBody(required = false) WarehouseReInspectionRequest request
    ) {
        String action = request == null ? null : request.getAction();
        String reason = request == null ? null : request.getReason();
        return RestResponses.okData(adminService.confirmWarehouseReInspection(id, action, reason));
    }

    @GetMapping("/listings")
    public ResponseEntity<Map<String, Object>> listings() {
        return RestResponses.okData(adminService.listListings());
    }

    @PutMapping("/listings/{id}/hide")
    public ResponseEntity<Map<String, Object>> hideListing(@PathVariable Long id) {
        return RestResponses.okData(adminService.hideListing(id));
    }

    @PutMapping("/listings/{id}/unhide")
    public ResponseEntity<Map<String, Object>> unhideListing(@PathVariable Long id) {
        return RestResponses.okData(adminService.unhideListing(id));
    }

    @GetMapping("/reviews")
    public ResponseEntity<Map<String, Object>> reviews() {
        return RestResponses.okData(adminService.listReviews());
    }

    @PutMapping("/reviews/{id}")
    public ResponseEntity<Map<String, Object>> updateReview(@PathVariable Long id, @RequestBody AdminUpdateReviewRequest request) {
        return RestResponses.okData(adminService.updateReview(
            id,
            request == null ? null : request.getRating(),
            request == null ? null : request.getComment(),
            request == null ? null : request.getStatus()
        ));
    }

    @GetMapping("/seller-subscriptions")
    public ResponseEntity<Map<String, Object>> sellerSubscriptions() {
        return RestResponses.okData(adminService.listSellerSubscriptions());
    }

    @PutMapping("/users/{id}/revoke-subscription")
    public ResponseEntity<Map<String, Object>> revokeSubscription(@PathVariable Long id) {
        return RestResponses.okData(adminService.revokeSellerSubscription(id));
    }

    @GetMapping("/brands")
    public ResponseEntity<Map<String, Object>> brands() {
        return RestResponses.okData(brandService.adminListBrands());
    }

    @PostMapping("/brands")
    public ResponseEntity<Map<String, Object>> createBrand(@RequestBody AdminBrandRequest request) {
        return RestResponses.okData(brandService.adminCreateBrand(
            request == null ? null : request.getName(),
            request == null ? null : request.getSlug()
        ));
    }

    @PutMapping("/brands/{id}")
    public ResponseEntity<Map<String, Object>> updateBrand(@PathVariable Long id, @RequestBody AdminBrandRequest request) {
        return RestResponses.okData(brandService.adminUpdateBrand(
            id,
            request == null ? null : request.getName(),
            request == null ? null : request.getSlug(),
            request == null ? null : request.getActive()
        ));
    }

    @DeleteMapping("/brands/{id}")
    public ResponseEntity<Map<String, Object>> deleteBrand(@PathVariable Long id) {
        return RestResponses.okData(brandService.adminDeleteBrand(id));
    }
}

