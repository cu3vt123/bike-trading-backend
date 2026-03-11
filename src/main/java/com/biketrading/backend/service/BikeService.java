package com.biketrading.backend.service;

import com.biketrading.backend.entity.Bike;
import com.biketrading.backend.repository.BikeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import static org.springframework.http.HttpStatus.NOT_FOUND;
import com.biketrading.backend.dto.BikeDTO;
import java.time.LocalDateTime;

import java.util.List;

@Service
public class BikeService {
    // 1. Chức năng tạo bản DRAFT cho Seller
    public Bike createDraftBike(BikeDTO dto, Long sellerId) {
        Bike bike = new Bike();
        bike.setName(dto.getName());
        bike.setPrice(dto.getPrice());
        bike.setDescription(dto.getDescription());
        bike.setSellerId(sellerId);

        // Gán trạng thái nháp (giống Node.js)
        bike.setApprovalStatus("DRAFT");
        bike.setSalesStatus("AVAILABLE");
        bike.setCreatedAt(LocalDateTime.now());

        return bikeRepository.save(bike);
    }

    // 2. Chức năng Seller gửi yêu cầu kiểm duyệt
    public Bike submitForInspection(Long bikeId, Long sellerId) {
        Bike bike = getBikeById(bikeId);
        if(!bike.getSellerId().equals(sellerId)) {
            throw new RuntimeException("Bạn không có quyền gửi duyệt xe này!");
        }
        bike.setApprovalStatus("PENDING_INSPECTION");
        return bikeRepository.save(bike);
    }

    // 3. Chức năng cho Inspector lấy danh sách chờ duyệt
    public List<Bike> getPendingListings() {
        return bikeRepository.findAll().stream()
                .filter(b -> "PENDING_INSPECTION".equals(b.getApprovalStatus()))
                .toList();
    }

    // 4. Chức năng cho Inspector Duyệt/Từ chối
    public Bike inspectBike(Long bikeId, String result) {
        Bike bike = getBikeById(bikeId);
        if ("APPROVE".equals(result)) {
            bike.setApprovalStatus("APPROVED");
        } else if ("REJECT".equals(result)) {
            bike.setApprovalStatus("REJECTED");
        }
        return bikeRepository.save(bike);
    }

    @Autowired
    private BikeRepository bikeRepository;

    // SHOP-15 (BE2) - GIỮ NGUYÊN
    public Bike getBikeById(Long id) {
        return bikeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Bike not found"));
    }

    // SHOP-12 (BE1) - THÊM MỚI
    public List<Bike> getAllBikes(Long sellerId) {
        if (sellerId != null) {
            return bikeRepository.findBySellerId(sellerId);
        }
        return bikeRepository.findAll();
    }
}
