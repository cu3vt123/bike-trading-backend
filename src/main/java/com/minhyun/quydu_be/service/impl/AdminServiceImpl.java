package com.minhyun.quydu_be.service.impl;

import com.minhyun.quydu_be.entity.Listing;
import com.minhyun.quydu_be.entity.ListingState;
import com.minhyun.quydu_be.entity.Order;
import com.minhyun.quydu_be.entity.OrderFulfillmentType;
import com.minhyun.quydu_be.entity.OrderStatus;
import com.minhyun.quydu_be.entity.PackageOrder;
import com.minhyun.quydu_be.entity.Review;
import com.minhyun.quydu_be.entity.ReviewStatus;
import com.minhyun.quydu_be.entity.SubscriptionPlan;
import com.minhyun.quydu_be.entity.User;
import com.minhyun.quydu_be.entity.UserRole;
import com.minhyun.quydu_be.entity.VnpayPaymentStatus;
import com.minhyun.quydu_be.exception.BadRequestException;
import com.minhyun.quydu_be.exception.ResourceNotFoundException;
import com.minhyun.quydu_be.repository.ListingRepository;
import com.minhyun.quydu_be.repository.OrderRepository;
import com.minhyun.quydu_be.repository.PackageOrderRepository;
import com.minhyun.quydu_be.repository.ReviewRepository;
import com.minhyun.quydu_be.repository.UserRepository;
import com.minhyun.quydu_be.service.AdminService;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminServiceImpl implements AdminService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ListingRepository listingRepository;
    private final ReviewRepository reviewRepository;
    private final PackageOrderRepository packageOrderRepository;

    public AdminServiceImpl(
        OrderRepository orderRepository,
        UserRepository userRepository,
        ListingRepository listingRepository,
        ReviewRepository reviewRepository,
        PackageOrderRepository packageOrderRepository
    ) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.listingRepository = listingRepository;
        this.reviewRepository = reviewRepository;
        this.packageOrderRepository = packageOrderRepository;
    }

    @Override
    public List<Map<String, Object>> listWarehousePending() {
        List<OrderStatus> statuses = List.of(OrderStatus.SELLER_SHIPPED, OrderStatus.AT_WAREHOUSE_PENDING_ADMIN);
        return orderRepository.findByStatusInOrderByCreatedAtDesc(statuses).stream()
            .filter(o -> o.getFulfillmentType() != OrderFulfillmentType.DIRECT)
            .filter(o -> "CERTIFIED".equals(o.getListing().getCertificationStatus()))
            .map(this::toOrderMap)
            .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public Map<String, Object> confirmWarehouse(Long orderId) {
        Order order = mustOrder(orderId);
        if (order.getFulfillmentType() == OrderFulfillmentType.DIRECT) {
            throw new BadRequestException("Đơn giao trực tiếp không qua kho");
        }
        if (!"CERTIFIED".equals(order.getListing().getCertificationStatus())) {
            throw new BadRequestException("Chỉ xe đã kiểm định CERTIFIED mới xác nhận tại kho");
        }
        if (
            order.getStatus() == OrderStatus.AT_WAREHOUSE_PENDING_ADMIN
            && !order.isDepositPaid()
            && order.getVnpayPaymentStatus() != VnpayPaymentStatus.PAID
        ) {
            throw new BadRequestException("Buyer chưa thanh toán VNPAY, không thể xác nhận giao");
        }
        if (order.getStatus() == OrderStatus.AT_WAREHOUSE_PENDING_ADMIN) {
            order.setStatus(OrderStatus.SHIPPING);
            order.setWarehouseConfirmedAt(LocalDateTime.now());
            order.setShippedAt(LocalDateTime.now());
            order.setExpiresAt(LocalDateTime.now().plusDays(1));
        } else if (order.getStatus() == OrderStatus.SELLER_SHIPPED) {
            order.setStatus(OrderStatus.RE_INSPECTION);
            order.setWarehouseConfirmedAt(LocalDateTime.now());
        } else {
            throw new BadRequestException("Order không ở trạng thái chờ xác nhận kho");
        }
        orderRepository.save(order);
        return toOrderMap(order);
    }

    @Override
    public List<Map<String, Object>> listReInspectionOrders() {
        return orderRepository.findByStatusOrderByCreatedAtDesc(OrderStatus.RE_INSPECTION)
            .stream().map(this::toOrderMap).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public Map<String, Object> markReInspectionDone(Long orderId) {
        Order order = mustOrder(orderId);
        if (order.getStatus() != OrderStatus.RE_INSPECTION) {
            throw new BadRequestException("Order not in re-inspection");
        }
        order.setStatus(OrderStatus.SHIPPING);
        order.setReInspectionDoneAt(LocalDateTime.now());
        order.setExpiresAt(LocalDateTime.now().plusDays(1));
        orderRepository.save(order);
        return toOrderMap(order);
    }

    @Override
    public Map<String, Object> getStats() {
        long totalUsers = userRepository.count();
        long totalBuyers = userRepository.findByRoleInOrderByCreatedAtDesc(List.of(UserRole.BUYER)).size();
        long totalSellers = userRepository.findByRoleInOrderByCreatedAtDesc(List.of(UserRole.SELLER)).size();
        long totalListings = listingRepository.count();
        long totalOrders = orderRepository.count();
        long ordersReInspection = orderRepository.findByStatusOrderByCreatedAtDesc(OrderStatus.RE_INSPECTION).size();
        long pendingWarehouseListings = listingRepository.findByStateInAndHiddenFalseOrderByUpdatedAtDesc(
            List.of(ListingState.AT_WAREHOUSE_PENDING_VERIFY, ListingState.AT_WAREHOUSE_PENDING_RE_INSPECTION)
        ).size();
        return Map.of(
            "totalUsers", totalUsers,
            "totalBuyers", totalBuyers,
            "totalSellers", totalSellers,
            "totalListings", totalListings,
            "totalOrders", totalOrders,
            "ordersPendingWarehouse", 0,
            "ordersReInspection", ordersReInspection,
            "listingsPendingWarehouseIntake", pendingWarehouseListings
        );
    }

    @Override
    public List<Map<String, Object>> listUsers() {
        return userRepository.findByRoleInOrderByCreatedAtDesc(List.of(UserRole.BUYER, UserRole.SELLER))
            .stream().map(this::toUserMap).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public Map<String, Object> hideUser(Long id) {
        User user = mustUser(id);
        if (!(user.getRole() == UserRole.BUYER || user.getRole() == UserRole.SELLER)) {
            throw new BadRequestException("Only buyer/seller can be hidden");
        }
        user.setHidden(true);
        user.setHiddenAt(LocalDateTime.now());
        userRepository.save(user);
        return toUserMap(user);
    }

    @Override
    @Transactional
    public Map<String, Object> unhideUser(Long id) {
        User user = mustUser(id);
        user.setHidden(false);
        user.setHiddenAt(null);
        userRepository.save(user);
        return toUserMap(user);
    }

    @Override
    public List<Map<String, Object>> listListings() {
        return listingRepository.findAllByOrderByCreatedAtDesc().stream().map(this::toListingMap).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public Map<String, Object> hideListing(Long id) {
        Listing l = mustListing(id);
        l.setHidden(true);
        l.setHiddenAt(LocalDateTime.now());
        listingRepository.save(l);
        return toListingMap(l);
    }

    @Override
    @Transactional
    public Map<String, Object> unhideListing(Long id) {
        Listing l = mustListing(id);
        l.setHidden(false);
        l.setHiddenAt(null);
        listingRepository.save(l);
        return toListingMap(l);
    }

    @Override
    public List<Map<String, Object>> listWarehouseIntakePending() {
        return listingRepository.findByStateInAndHiddenFalseOrderByUpdatedAtDesc(
            List.of(ListingState.AT_WAREHOUSE_PENDING_VERIFY, ListingState.AT_WAREHOUSE_PENDING_RE_INSPECTION)
        ).stream().map(this::toListingMap).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public Map<String, Object> confirmWarehouseIntake(Long listingId) {
        Listing listing = mustListing(listingId);
        if (listing.getState() != ListingState.AT_WAREHOUSE_PENDING_VERIFY) {
            throw new BadRequestException("Tin không ở trạng thái chờ xác nhận xe tại kho.");
        }
        listing.setState(ListingState.AT_WAREHOUSE_PENDING_RE_INSPECTION);
        listingRepository.save(listing);
        return toListingMap(listing);
    }

    @Override
    @Transactional
    public Map<String, Object> confirmWarehouseReInspection(Long listingId, String action, String reason) {
        Listing listing = mustListing(listingId);
        if (listing.getState() != ListingState.AT_WAREHOUSE_PENDING_RE_INSPECTION) {
            throw new BadRequestException("Tin không ở trạng thái chờ inspector xác nhận tại kho.");
        }
        if ("need_update".equalsIgnoreCase(action)) {
            listing.setState(ListingState.NEED_UPDATE);
            listing.setInspectionResult("NEED_UPDATE");
            listing.setInspectionNeedUpdateReason(reason == null ? "Yeu cau cap nhat sau kiem tra tai kho." : reason);
        } else {
            LocalDateTime now = LocalDateTime.now();
            listing.setState(ListingState.PUBLISHED);
            listing.setCertificationStatus("CERTIFIED");
            listing.setInspectionResult("APPROVE");
            listing.setWarehouseIntakeVerifiedAt(now);
            listing.setPublishedAt(now);
            listing.setListingExpiresAt(now.plusDays(30));
        }
        listingRepository.save(listing);
        return toListingMap(listing);
    }

    @Override
    public List<Map<String, Object>> listSellerSubscriptions() {
        List<User> sellers = userRepository.findByRoleOrderByUpdatedAtDesc(UserRole.SELLER);
        return sellers.stream().map(s -> {
            List<PackageOrder> recent = packageOrderRepository.findAll().stream()
                .filter(o -> o.getSeller().getId().equals(s.getId()))
                .limit(8).collect(Collectors.toList());
            return Map.of(
                "user", toUserMap(s),
                "subscription", subscriptionSummary(s),
                "recentPackageOrders", recent.stream().map(this::toPackageOrderMap).collect(Collectors.toList())
            );
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public Map<String, Object> revokeSellerSubscription(Long userId) {
        User user = mustUser(userId);
        if (user.getRole() != UserRole.SELLER) {
            throw new BadRequestException("Chỉ có thể gỡ gói cho tài khoản seller");
        }
        boolean hadPlan = user.getSubscriptionPlan() != null || user.getSubscriptionExpiresAt() != null;
        user.setSubscriptionPlan(null);
        user.setSubscriptionExpiresAt(null);
        userRepository.save(user);
        return Map.of("user", toUserMap(user), "subscription", subscriptionSummary(user), "revoked", hadPlan);
    }

    @Override
    public List<Map<String, Object>> listReviews() {
        return reviewRepository.findAllByOrderByCreatedAtDesc().stream().map(this::toReviewMap).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public Map<String, Object> updateReview(Long id, Integer rating, String comment, String status) {
        Review review = reviewRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Review not found"));
        if (rating != null) review.setRating(rating);
        if (comment != null) review.setComment(comment);
        if (status != null) review.setStatus(ReviewStatus.valueOf(status));
        reviewRepository.save(review);
        return toReviewMap(review);
    }

    private User mustUser(Long id) {
        return userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
    private Order mustOrder(Long id) {
        return orderRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Order not found"));
    }
    private Listing mustListing(Long id) {
        return listingRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Listing not found"));
    }

    private Map<String, Object> toOrderMap(Order o) {
        return Map.of(
            "id", o.getId(),
            "listingId", o.getListing().getId(),
            "buyerId", o.getBuyer().getId(),
            "status", o.getStatus().name(),
            "fulfillmentType", (o.getFulfillmentType() == null ? "WAREHOUSE" : o.getFulfillmentType().name()),
            "expiresAt", o.getExpiresAt(),
            "shippedAt", o.getShippedAt(),
            "warehouseConfirmedAt", o.getWarehouseConfirmedAt(),
            "reInspectionDoneAt", o.getReInspectionDoneAt()
        );
    }
    private Map<String, Object> toUserMap(User u) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", u.getId());
        m.put("email", u.getEmail());
        m.put("displayName", u.getDisplayName());
        m.put("role", u.getRole().name());
        m.put("isHidden", u.isHidden());
        m.put("hiddenAt", u.getHiddenAt());
        m.put("subscriptionPlan", u.getSubscriptionPlan() == null ? null : u.getSubscriptionPlan().name());
        m.put("subscriptionExpiresAt", u.getSubscriptionExpiresAt());
        return m;
    }
    private Map<String, Object> toListingMap(Listing l) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", l.getId());
        m.put("title", l.getTitle());
        m.put("brand", l.getBrand());
        m.put("model", l.getModel());
        m.put("state", l.getState().name());
        m.put("isHidden", l.isHidden());
        m.put("hiddenAt", l.getHiddenAt());
        m.put("certificationStatus", l.getCertificationStatus());
        return m;
    }
    private Map<String, Object> toPackageOrderMap(PackageOrder o) {
        return Map.of(
            "id", o.getId(),
            "sellerId", o.getSeller().getId(),
            "plan", o.getPlan().name(),
            "provider", o.getProvider(),
            "amountVnd", o.getAmountVnd(),
            "status", o.getStatus().name(),
            "createdAt", o.getCreatedAt()
        );
    }
    private Map<String, Object> toReviewMap(Review r) {
        return Map.of(
            "id", r.getId(),
            "orderId", r.getOrder().getId(),
            "listingId", r.getListing().getId(),
            "sellerId", r.getSeller().getId(),
            "buyerId", r.getBuyer().getId(),
            "rating", r.getRating(),
            "comment", r.getComment() == null ? "" : r.getComment(),
            "status", r.getStatus().name()
        );
    }
    private Map<String, Object> subscriptionSummary(User u) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("plan", u.getSubscriptionPlan() == null ? null : u.getSubscriptionPlan().name());
        m.put("expiresAt", u.getSubscriptionExpiresAt());
        m.put("active", u.getSubscriptionExpiresAt() != null && u.getSubscriptionExpiresAt().isAfter(LocalDateTime.now()));
        m.put("slotsLimit", u.getSubscriptionPlan() == SubscriptionPlan.VIP ? 20 : 3);
        return m;
    }
}
