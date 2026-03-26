package com.biketrading.backend.controller;

import com.biketrading.backend.dto.ListingDTO;
import com.biketrading.backend.entity.Listing;
import com.biketrading.backend.entity.Order;
import com.biketrading.backend.enums.InspectionResult;
import com.biketrading.backend.enums.ListingState;
import com.biketrading.backend.enums.OrderStatus;
import com.biketrading.backend.repository.ListingRepository;
import com.biketrading.backend.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/inspector")
public class InspectorController {

    @Autowired private ListingRepository listingRepository;
    @Autowired private OrderRepository orderRepository;

    // --- KIỂM ĐỊNH TIN ĐĂNG BAN ĐẦU (ĐỂ LÊN SÀN) ---

    @GetMapping("/pending-listings")
    public ResponseEntity<List<ListingDTO>> getPendingListings() {
        List<Listing> pendingBikes = listingRepository.findAll().stream()
                .filter(b -> b.getState() == ListingState.PENDING_INSPECTION)
                .toList();
        List<ListingDTO> response = pendingBikes.stream()
                .map(ListingDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    /**
     * Chi tiết tin (mọi trạng thái) — FE trang /bikes/:id khi INSPECTOR/ADMIN duyệt.
     * GET /api/bikes/{id} chỉ trả tin đã public; endpoint này bổ sung cho luồng kiểm định.
     */
    @GetMapping("/listings/{id}")
    public ResponseEntity<ListingDTO> getListingById(@PathVariable Long id) {
        return listingRepository.findById(id)
                .map(listing -> ResponseEntity.ok(ListingDTO.fromEntity(listing)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/listings/{id}/approve")
    public ResponseEntity<?> approveBike(@PathVariable Long id) {
        Optional<Listing> listingOpt = listingRepository.findById(id);
        if (listingOpt.isPresent()) {
            Listing listing = listingOpt.get();
            listing.setInspectionResult(InspectionResult.APPROVE);
            listing.setState(ListingState.PUBLISHED);
            listing.setInspectionScore(5.0);
            listingRepository.save(listing);
            return ResponseEntity.ok(Map.of("message", "Đã duyệt xe lên sàn thành công!"));
        }
        return ResponseEntity.status(404).body(Map.of("message", "Không tìm thấy xe"));
    }

    // --- KIỂM ĐỊNH LẠI KHI XE ĐẾN KHO (LUỒNG SHIPPING) ---

    @PutMapping("/orders/{orderId}/re-inspect")
    public ResponseEntity<?> reInspectAtWarehouse(@PathVariable Long orderId) {
        Order order = orderRepository.findById(orderId).orElseThrow();

        // Cập nhật trạng thái hoàn tất kiểm định tại kho
        order.setStatus(OrderStatus.RE_INSPECTION_DONE);
        order.setReInspectionDoneAt(LocalDateTime.now());
        orderRepository.save(order);

        return ResponseEntity.ok(Map.of(
                "message", "Xe giống hệt mô tả trên web. Đã duyệt cho phép xuất kho để giao cho Buyer!"
        ));
    }
}