package com.biketrading.backend.controller;

import com.biketrading.backend.entity.Listing;
import com.biketrading.backend.entity.Order;
import com.biketrading.backend.entity.Review;
import com.biketrading.backend.entity.User;
import com.biketrading.backend.enums.*;
import com.biketrading.backend.repository.ListingRepository;
import com.biketrading.backend.repository.OrderRepository;
import com.biketrading.backend.repository.ReviewRepository;
import com.biketrading.backend.util.ApiResponse;
import com.biketrading.backend.util.CurrentUserService;
import com.biketrading.backend.util.MapperUtil;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/seller")
public class SellerController {
    private final ListingRepository listingRepository;
    private final OrderRepository orderRepository;
    private final ReviewRepository reviewRepository;
    private final CurrentUserService currentUserService;

    public SellerController(ListingRepository listingRepository, OrderRepository orderRepository, ReviewRepository reviewRepository, CurrentUserService currentUserService) {
        this.listingRepository = listingRepository;
        this.orderRepository = orderRepository;
        this.reviewRepository = reviewRepository;
        this.currentUserService = currentUserService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<?> dashboard() {
        User seller = currentUserService.requireUser();
        List<Listing> listings = listingRepository.findBySeller(seller);
        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("total", listings.size());
        stats.put("published", listings.stream().filter(l -> l.getState() == ListingState.PUBLISHED).count());
        stats.put("inReview", listings.stream().filter(l -> l.getState() == ListingState.PENDING_INSPECTION).count());
        stats.put("awaitingWarehouse", listings.stream().filter(l -> l.getState() == ListingState.AWAITING_WAREHOUSE).count());
        stats.put("atWarehousePendingVerify", listings.stream().filter(l -> l.getState() == ListingState.AT_WAREHOUSE_PENDING_VERIFY || l.getState() == ListingState.AT_WAREHOUSE_PENDING_RE_INSPECTION).count());
        stats.put("needUpdate", listings.stream().filter(l -> l.getState() == ListingState.NEED_UPDATE).count());
        return ApiResponse.ok(Map.of(
                "stats", stats,
                "listings", listings.stream().map(MapperUtil::listingDto).collect(Collectors.toList())
        ));
    }

    @GetMapping("/ratings")
    public ResponseEntity<?> ratings() {
        User seller = currentUserService.requireUser();
        List<Review> reviews = reviewRepository.findBySellerOrderByCreatedAtDesc(seller);
        double avg = reviews.stream().mapToInt(Review::getRating).average().orElse(0);
        long positive = reviews.stream().filter(r -> r.getRating() >= 4).count();
        Map<Integer, Long> breakdown = reviews.stream().collect(Collectors.groupingBy(Review::getRating, LinkedHashMap::new, Collectors.counting()));
        return ApiResponse.ok(Map.of(
                "averageRating", avg,
                "totalReviews", reviews.size(),
                "positivePercent", reviews.isEmpty() ? 0 : Math.round(positive * 100.0 / reviews.size()),
                "breakdown", breakdown
        ));
    }

    @GetMapping("/listings")
    public ResponseEntity<?> getListings() {
        User seller = currentUserService.requireUser();
        return ApiResponse.ok(listingRepository.findBySeller(seller).stream().map(MapperUtil::listingDto).collect(Collectors.toList()));
    }

    @GetMapping("/listings/{id}")
    public ResponseEntity<?> getListing(@PathVariable Long id) {
        User seller = currentUserService.requireUser();
        Listing listing = listingRepository.findById(id).orElse(null);
        if (listing == null || !listing.getSeller().getId().equals(seller.getId())) return ApiResponse.error(HttpStatus.NOT_FOUND, "Listing not found");
        return ApiResponse.ok(MapperUtil.listingDto(listing));
    }

    @PostMapping("/listings")
    public ResponseEntity<?> create(@RequestBody Map<String, Object> body) {
        User seller = currentUserService.requireUser();
        Listing listing = new Listing();
        listing.setSeller(seller);
        listing.setTitle(String.valueOf(body.getOrDefault("title", "Untitled bike")));
        listing.setBrand(String.valueOf(body.getOrDefault("brand", "Unknown")));
        listing.setModel(String.valueOf(body.getOrDefault("model", "")));
        if (body.get("year") != null && !String.valueOf(body.get("year")).isBlank()) listing.setYear(Integer.parseInt(String.valueOf(body.get("year"))));
        listing.setPrice(new BigDecimal(String.valueOf(body.getOrDefault("price", "0"))));
        listing.setCurrency(String.valueOf(body.getOrDefault("currency", "VND")));
        listing.setFrameSize(String.valueOf(body.getOrDefault("frameSize", "")));
        listing.setLocation(String.valueOf(body.getOrDefault("location", "")));
        listing.setDescription(String.valueOf(body.getOrDefault("description", "")));
        if (body.get("condition") != null && !String.valueOf(body.get("condition")).isBlank()) {
            listing.setCondition(Condition.valueOf(String.valueOf(body.get("condition")).toUpperCase()));
        }
        Object imageUrls = body.get("imageUrls");
        if (imageUrls instanceof List<?> list) {
            listing.setImageUrls(list.stream().map(String::valueOf).collect(Collectors.toList()));
            if (!list.isEmpty()) listing.setThumbnailUrl(String.valueOf(list.get(0)));
        }
        listing.setState(ListingState.DRAFT);
        listingRepository.save(listing);
        return ApiResponse.ok(MapperUtil.listingDto(listing));
    }

    @PutMapping("/listings/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        User seller = currentUserService.requireUser();
        Listing listing = listingRepository.findById(id).orElse(null);
        if (listing == null || !listing.getSeller().getId().equals(seller.getId())) return ApiResponse.error(HttpStatus.NOT_FOUND, "Listing not found");
        if (body.containsKey("title")) listing.setTitle(String.valueOf(body.get("title")));
        if (body.containsKey("brand")) listing.setBrand(String.valueOf(body.get("brand")));
        if (body.containsKey("model")) listing.setModel(String.valueOf(body.get("model")));
        if (body.containsKey("price")) listing.setPrice(new BigDecimal(String.valueOf(body.get("price"))));
        if (body.containsKey("description")) listing.setDescription(String.valueOf(body.get("description")));
        if (body.containsKey("location")) listing.setLocation(String.valueOf(body.get("location")));
        listingRepository.save(listing);
        return ApiResponse.ok(MapperUtil.listingDto(listing));
    }

    @PutMapping("/listings/{id}/submit")
    public ResponseEntity<?> submit(@PathVariable Long id) {
        User seller = currentUserService.requireUser();
        Listing listing = listingRepository.findById(id).orElse(null);
        if (listing == null || !listing.getSeller().getId().equals(seller.getId())) return ApiResponse.error(HttpStatus.NOT_FOUND, "Listing not found");
        listing.setState(ListingState.PENDING_INSPECTION);
        listing.setCertificationStatus(CertificationStatus.PENDING_CERTIFICATION);
        listingRepository.save(listing);
        return ApiResponse.ok(MapperUtil.listingDto(listing));
    }

    @PutMapping("/listings/{id}/publish")
    public ResponseEntity<?> publish(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        User seller = currentUserService.requireUser();
        Listing listing = listingRepository.findById(id).orElse(null);
        if (listing == null || !listing.getSeller().getId().equals(seller.getId())) return ApiResponse.error(HttpStatus.NOT_FOUND, "Listing not found");
        boolean requestInspection = Boolean.parseBoolean(String.valueOf(body.getOrDefault("requestInspection", false)));
        if (requestInspection) {
            listing.setState(ListingState.PENDING_INSPECTION);
            listing.setCertificationStatus(CertificationStatus.PENDING_CERTIFICATION);
        } else {
            listing.setState(ListingState.PUBLISHED);
            listing.setCertificationStatus(CertificationStatus.UNVERIFIED);
            listing.setPublishedAt(LocalDateTime.now());
            listing.setListingExpiresAt(LocalDateTime.now().plusDays(30));
        }
        listingRepository.save(listing);
        return ApiResponse.ok(MapperUtil.listingDto(listing));
    }

    @PutMapping("/listings/{id}/mark-shipped-to-warehouse")
    public ResponseEntity<?> markShippedToWarehouse(@PathVariable Long id) {
        User seller = currentUserService.requireUser();
        Listing listing = listingRepository.findById(id).orElse(null);
        if (listing == null || !listing.getSeller().getId().equals(seller.getId())) return ApiResponse.error(HttpStatus.NOT_FOUND, "Listing not found");
        listing.setState(ListingState.AT_WAREHOUSE_PENDING_VERIFY);
        listing.setCertificationStatus(CertificationStatus.PENDING_WAREHOUSE);
        listing.setSellerShippedToWarehouseAt(LocalDateTime.now());
        listingRepository.save(listing);
        orderRepository.findAll().stream()
                .filter(o -> o.getListing() != null && o.getListing().getId().equals(listing.getId()))
                .filter(o -> o.getStatus() == OrderStatus.PENDING_SELLER_SHIP)
                .forEach(o -> {
                    o.setStatus(OrderStatus.SELLER_SHIPPED);
                    o.setShippedAt(LocalDateTime.now());
                    orderRepository.save(o);
                });
        return ApiResponse.ok(MapperUtil.listingDto(listing));
    }

    @GetMapping("/orders")
    public ResponseEntity<?> getOrders() {
        User seller = currentUserService.requireUser();
        List<?> items = orderRepository.findAll().stream()
                .filter(o -> o.getListing() != null && o.getListing().getSeller() != null && o.getListing().getSeller().getId().equals(seller.getId()))
                .sorted(Comparator.comparing(Order::getCreatedAt).reversed())
                .map(MapperUtil::orderDto)
                .collect(Collectors.toList());
        return ApiResponse.ok(items);
    }

    @PutMapping("/orders/{orderId}/ship-to-buyer")
    public ResponseEntity<?> shipToBuyer(@PathVariable Long orderId) {
        User seller = currentUserService.requireUser();
        Order order = orderRepository.findById(orderId).orElse(null);
        if (order == null || !order.getListing().getSeller().getId().equals(seller.getId())) return ApiResponse.error(HttpStatus.NOT_FOUND, "Order not found");
        order.setStatus(OrderStatus.SHIPPING);
        order.setShippedAt(LocalDateTime.now());
        orderRepository.save(order);
        return ApiResponse.ok(MapperUtil.orderDto(order));
    }
}
