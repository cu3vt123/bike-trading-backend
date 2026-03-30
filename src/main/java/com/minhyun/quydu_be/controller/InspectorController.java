package com.minhyun.quydu_be.controller;

import com.minhyun.quydu_be.dto.ApiResponse;
import com.minhyun.quydu_be.dto.request.InspectionNeedUpdateRequest;
import com.minhyun.quydu_be.dto.request.InspectorApproveRequest;
import com.minhyun.quydu_be.service.InspectorService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/inspector")
@PreAuthorize("hasAnyRole('INSPECTOR','ADMIN')")
public class InspectorController {

    private final InspectorService inspectorService;

    public InspectorController(InspectorService inspectorService) {
        this.inspectorService = inspectorService;
    }

    @GetMapping("/pending-listings")
    public ResponseEntity<Map<String, Object>> pendingListings() {
        List<Map<String, Object>> content = inspectorService.pendingListings();
        return ResponseEntity.ok(Map.of("content", content));
    }

    @GetMapping("/listings/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getListing(@PathVariable Long id) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Fetched listing", inspectorService.getListing(id)));
    }

    @PutMapping("/listings/{id}/approve")
    public ResponseEntity<ApiResponse<Map<String, Object>>> approve(
        @PathVariable Long id,
        @RequestBody(required = false) InspectorApproveRequest request
    ) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Approved listing", inspectorService.approve(id, request)));
    }

    @PutMapping("/listings/{id}/reject")
    public ResponseEntity<ApiResponse<Map<String, Object>>> reject(@PathVariable Long id) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Rejected listing", inspectorService.reject(id)));
    }

    @PutMapping("/listings/{id}/need-update")
    public ResponseEntity<ApiResponse<Map<String, Object>>> needUpdate(
        @PathVariable Long id,
        @Valid @RequestBody InspectionNeedUpdateRequest request
    ) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Need update", inspectorService.needUpdate(id, request.getReason())));
    }
}
