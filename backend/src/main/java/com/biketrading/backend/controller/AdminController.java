package com.biketrading.backend.controller;

import com.biketrading.backend.entity.*;
import com.biketrading.backend.enums.*;
import com.biketrading.backend.repository.*;
import com.biketrading.backend.util.ApiResponse;
import com.biketrading.backend.util.MapperUtil;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    private final UserRepository userRepository;
    private final ListingRepository listingRepository;
    private final OrderRepository orderRepository;
    private final PackageOrderRepository packageOrderRepository;

    public AdminController(UserRepository userRepository, ListingRepository listingRepository, OrderRepository orderRepository, PackageOrderRepository packageOrderRepository) {
        this.userRepository = userRepository;
        this.listingRepository = listingRepository;
        this.orderRepository = orderRepository;
        this.packageOrderRepository = packageOrderRepository;
    }

    @GetMapping("/orders/warehouse-pending")
    public ResponseEntity<?> warehouseOrders() {
        List<?> items = orderRepository.findAll().stream()
                .filter(o -> o.getFulfillmentType() == OrderFulfillmentType.WAREHOUSE)
                .filter(o -> o.getStatus() == OrderStatus.SELLER_SHIPPED || o.getStatus() == OrderStatus.AT_WAREHOUSE_PENDING_ADMIN)
                .sorted(Comparator.comparing(Order::getCreatedAt).reversed())
                .map(MapperUtil::orderDto)
                .collect(Collectors.toList());
        return ApiResponse.ok(items);
    }

    @PutMapping("/orders/{id}/confirm-warehouse")
    public ResponseEntity<?> confirmWarehouse(@PathVariable Long id) {
        Order order = orderRepository.findById(id).orElse(null);
        if (order == null) return ApiResponse.error(HttpStatus.NOT_FOUND, "Order not found");
        order.setStatus(OrderStatus.RE_INSPECTION);
        order.setWarehouseConfirmedAt(LocalDateTime.now());
        orderRepository.save(order);
        return ApiResponse.ok(MapperUtil.orderDto(order));
    }

    @GetMapping("/orders/re-inspection")
    public ResponseEntity<?> reInspectionOrders() {
        List<?> items = orderRepository.findAll().stream()
                .filter(o -> o.getStatus() == OrderStatus.RE_INSPECTION)
                .map(MapperUtil::orderDto)
                .collect(Collectors.toList());
        return ApiResponse.ok(items);
    }

    @PutMapping("/orders/{id}/re-inspection-done")
    public ResponseEntity<?> reInspectionDone(@PathVariable Long id) {
        Order order = orderRepository.findById(id).orElse(null);
        if (order == null) return ApiResponse.error(HttpStatus.NOT_FOUND, "Order not found");
        order.setStatus(OrderStatus.SHIPPING);
        order.setReInspectionDoneAt(LocalDateTime.now());
        orderRepository.save(order);
        return ApiResponse.ok(MapperUtil.orderDto(order));
    }

    @GetMapping("/dashboard/stats")
    public ResponseEntity<?> stats() {
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("totalUsers", userRepository.count());
        out.put("totalBuyers", userRepository.findByRole(UserRole.BUYER).size());
        out.put("totalSellers", userRepository.findByRole(UserRole.SELLER).size());
        out.put("totalListings", listingRepository.count());
        out.put("totalOrders", orderRepository.count());
        out.put("ordersPendingWarehouse", orderRepository.findAll().stream().filter(o -> o.getStatus() == OrderStatus.SELLER_SHIPPED || o.getStatus() == OrderStatus.AT_WAREHOUSE_PENDING_ADMIN).count());
        out.put("ordersReInspection", orderRepository.findAll().stream().filter(o -> o.getStatus() == OrderStatus.RE_INSPECTION).count());
        out.put("listingsPendingWarehouseIntake", listingRepository.findAll().stream().filter(l -> l.getState() == ListingState.AT_WAREHOUSE_PENDING_VERIFY).count());
        return ApiResponse.ok(out);
    }

    @GetMapping("/users")
    public ResponseEntity<?> users() {
        List<?> items = userRepository.findAll().stream().map(u -> {
            long published = u.getRole() == UserRole.SELLER ? listingRepository.countBySellerAndState(u, ListingState.PUBLISHED) : 0;
            return MapperUtil.userDto(u, published);
        }).collect(Collectors.toList());
        return ApiResponse.ok(items);
    }

    @GetMapping("/seller-subscriptions")
    public ResponseEntity<?> sellerSubscriptions() {
        List<User> sellers = userRepository.findByRole(UserRole.SELLER);
        List<?> rows = sellers.stream().map(s -> {
            long published = listingRepository.countBySellerAndState(s, ListingState.PUBLISHED);
            return Map.of(
                    "user", MapperUtil.userDto(s, published),
                    "subscription", MapperUtil.sellerSubscription(s, published),
                    "recentPackageOrders", packageOrderRepository.findTop5BySellerOrderByCreatedAtDesc(s).stream().map(MapperUtil::packageOrderDto).collect(Collectors.toList())
            );
        }).collect(Collectors.toList());
        return ApiResponse.ok(rows);
    }

    @PutMapping("/users/{id}/revoke-subscription")
    public ResponseEntity<?> revokeSubscription(@PathVariable Long id) {
        User u = userRepository.findById(id).orElse(null);
        if (u == null) return ApiResponse.error(HttpStatus.NOT_FOUND, "User not found");
        u.setSubscriptionPlan(SubscriptionPlan.FREE);
        u.setSubscriptionExpiresAt(null);
        u.setPublishedSlotsLimit(0);
        userRepository.save(u);
        long published = u.getRole() == UserRole.SELLER ? listingRepository.countBySellerAndState(u, ListingState.PUBLISHED) : 0;
        return ApiResponse.ok(Map.of(
                "user", MapperUtil.userDto(u, published),
                "subscription", MapperUtil.sellerSubscription(u, published),
                "revoked", true
        ));
    }

    @PutMapping("/users/{id}/hide")
    public ResponseEntity<?> hideUser(@PathVariable Long id) {
        User u = userRepository.findById(id).orElse(null);
        if (u == null) return ApiResponse.error(HttpStatus.NOT_FOUND, "User not found");
        u.setIsHidden(true);
        u.setHiddenAt(LocalDateTime.now());
        userRepository.save(u);
        long published = u.getRole() == UserRole.SELLER ? listingRepository.countBySellerAndState(u, ListingState.PUBLISHED) : 0;
        return ApiResponse.ok(MapperUtil.userDto(u, published));
    }

    @PutMapping("/users/{id}/unhide")
    public ResponseEntity<?> unhideUser(@PathVariable Long id) {
        User u = userRepository.findById(id).orElse(null);
        if (u == null) return ApiResponse.error(HttpStatus.NOT_FOUND, "User not found");
        u.setIsHidden(false);
        u.setHiddenAt(null);
        userRepository.save(u);
        long published = u.getRole() == UserRole.SELLER ? listingRepository.countBySellerAndState(u, ListingState.PUBLISHED) : 0;
        return ApiResponse.ok(MapperUtil.userDto(u, published));
    }

    @GetMapping("/listings/pending-warehouse-intake")
    public ResponseEntity<?> pendingWarehouseIntake() {
        List<?> items = listingRepository.findAll().stream()
                .filter(l -> l.getState() == ListingState.AT_WAREHOUSE_PENDING_VERIFY)
                .map(MapperUtil::listingDto)
                .collect(Collectors.toList());
        return ApiResponse.ok(items);
    }

    @PutMapping("/listings/{id}/confirm-warehouse-intake")
    public ResponseEntity<?> confirmWarehouseIntake(@PathVariable Long id) {
        Listing l = listingRepository.findById(id).orElse(null);
        if (l == null) return ApiResponse.error(HttpStatus.NOT_FOUND, "Listing not found");
        l.setState(ListingState.AT_WAREHOUSE_PENDING_RE_INSPECTION);
        l.setWarehouseIntakeVerifiedAt(LocalDateTime.now());
        listingRepository.save(l);
        orderRepository.findAll().stream()
                .filter(o -> o.getListing() != null && o.getListing().getId().equals(l.getId()))
                .filter(o -> o.getStatus() == OrderStatus.SELLER_SHIPPED)
                .forEach(o -> {
                    o.setStatus(OrderStatus.AT_WAREHOUSE_PENDING_ADMIN);
                    o.setWarehouseConfirmedAt(LocalDateTime.now());
                    orderRepository.save(o);
                });
        return ApiResponse.ok(MapperUtil.listingDto(l));
    }

    @PutMapping("/listings/{id}/confirm-warehouse-re-inspection")
    public ResponseEntity<?> confirmWarehouseReInspection(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Listing l = listingRepository.findById(id).orElse(null);
        if (l == null) return ApiResponse.error(HttpStatus.NOT_FOUND, "Listing not found");
        String action = body.getOrDefault("action", "approve");
        if ("need_update".equalsIgnoreCase(action)) {
            l.setState(ListingState.NEED_UPDATE);
            l.setInspectionNeedUpdateReason(body.getOrDefault("reason", "Need update"));
        } else {
            l.setState(ListingState.PUBLISHED);
            l.setCertificationStatus(CertificationStatus.CERTIFIED);
            if (l.getPublishedAt() == null) l.setPublishedAt(LocalDateTime.now());
            if (l.getListingExpiresAt() == null) l.setListingExpiresAt(LocalDateTime.now().plusDays(30));
        }
        listingRepository.save(l);
        return ApiResponse.ok(MapperUtil.listingDto(l));
    }

    @GetMapping("/listings")
    public ResponseEntity<?> listings() {
        return ApiResponse.ok(listingRepository.findAll().stream().map(MapperUtil::listingDto).collect(Collectors.toList()));
    }

    @PutMapping("/listings/{id}/hide")
    public ResponseEntity<?> hideListing(@PathVariable Long id) {
        Listing l = listingRepository.findById(id).orElse(null);
        if (l == null) return ApiResponse.error(HttpStatus.NOT_FOUND, "Listing not found");
        l.setIsHidden(true);
        l.setHiddenAt(LocalDateTime.now());
        listingRepository.save(l);
        return ApiResponse.ok(MapperUtil.listingDto(l));
    }

    @PutMapping("/listings/{id}/unhide")
    public ResponseEntity<?> unhideListing(@PathVariable Long id) {
        Listing l = listingRepository.findById(id).orElse(null);
        if (l == null) return ApiResponse.error(HttpStatus.NOT_FOUND, "Listing not found");
        l.setIsHidden(false);
        l.setHiddenAt(null);
        listingRepository.save(l);
        return ApiResponse.ok(MapperUtil.listingDto(l));
    }
}
