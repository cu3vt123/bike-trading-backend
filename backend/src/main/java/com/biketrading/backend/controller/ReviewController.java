package com.biketrading.backend.controller;

import com.biketrading.backend.entity.Review;
import com.biketrading.backend.enums.ReviewStatus;
import com.biketrading.backend.repository.ReviewRepository;
import com.biketrading.backend.util.ApiResponse;
import com.biketrading.backend.util.MapperUtil;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/reviews")
public class ReviewController {
    private final ReviewRepository reviewRepository;

    public ReviewController(ReviewRepository reviewRepository) {
        this.reviewRepository = reviewRepository;
    }

    @GetMapping
    public ResponseEntity<?> list() {
        return ApiResponse.ok(reviewRepository.findAll().stream().map(MapperUtil::reviewDto).collect(Collectors.toList()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        Review review = reviewRepository.findById(id).orElse(null);
        if (review == null) return ApiResponse.error(HttpStatus.NOT_FOUND, "Review not found");
        if (body.containsKey("rating")) review.setRating(Integer.parseInt(String.valueOf(body.get("rating"))));
        if (body.containsKey("comment")) review.setComment(String.valueOf(body.get("comment")));
        if (body.containsKey("status")) review.setStatus(ReviewStatus.valueOf(String.valueOf(body.get("status")).toUpperCase()));
        reviewRepository.save(review);
        return ApiResponse.ok(MapperUtil.reviewDto(review));
    }
}
