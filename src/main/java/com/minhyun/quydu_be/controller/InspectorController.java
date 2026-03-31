package com.minhyun.quydu_be.controller;

import com.minhyun.quydu_be.dto.request.InspectionNeedUpdateRequest;
import com.minhyun.quydu_be.dto.request.InspectorApproveRequest;
import com.minhyun.quydu_be.service.InspectorService;
import com.minhyun.quydu_be.web.RestResponses;
import jakarta.validation.Valid;
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
        return RestResponses.okContent(inspectorService.pendingListings());
    }

    @GetMapping("/listings/{id}")
    public ResponseEntity<Map<String, Object>> getListing(@PathVariable Long id) {
        return RestResponses.okData(inspectorService.getListing(id));
    }

    @PutMapping("/listings/{id}/approve")
    public ResponseEntity<Map<String, Object>> approve(
        @PathVariable Long id,
        @RequestBody(required = false) InspectorApproveRequest request
    ) {
        return RestResponses.okData(inspectorService.approve(id, request));
    }

    @PutMapping("/listings/{id}/reject")
    public ResponseEntity<Map<String, Object>> reject(@PathVariable Long id) {
        return RestResponses.okData(inspectorService.reject(id));
    }

    @PutMapping("/listings/{id}/need-update")
    public ResponseEntity<Map<String, Object>> needUpdate(
        @PathVariable Long id,
        @Valid @RequestBody InspectionNeedUpdateRequest request
    ) {
        return RestResponses.okData(inspectorService.needUpdate(id, request.getReason()));
    }
}

