package com.minhyun.quydu_be.service.impl;

import com.minhyun.quydu_be.dto.request.PublishListingRequest;
import com.minhyun.quydu_be.dto.request.SubscriptionCheckoutRequest;
import com.minhyun.quydu_be.dto.request.UpsertListingRequest;
import com.minhyun.quydu_be.entity.Listing;
import com.minhyun.quydu_be.entity.ListingState;
import com.minhyun.quydu_be.entity.Order;
import com.minhyun.quydu_be.entity.OrderFulfillmentType;
import com.minhyun.quydu_be.entity.OrderStatus;
import com.minhyun.quydu_be.entity.PackageOrder;
import com.minhyun.quydu_be.entity.PackageOrderStatus;
import com.minhyun.quydu_be.entity.Review;
import com.minhyun.quydu_be.entity.ReviewStatus;
import com.minhyun.quydu_be.entity.SubscriptionPlan;
import com.minhyun.quydu_be.entity.User;
import com.minhyun.quydu_be.exception.BadRequestException;
import com.minhyun.quydu_be.exception.ForbiddenException;
import com.minhyun.quydu_be.exception.ResourceNotFoundException;
import com.minhyun.quydu_be.repository.ListingRepository;
import com.minhyun.quydu_be.repository.OrderRepository;
import com.minhyun.quydu_be.repository.PackageOrderRepository;
import com.minhyun.quydu_be.repository.ReviewRepository;
import com.minhyun.quydu_be.repository.UserRepository;
import com.minhyun.quydu_be.service.SellerService;
import com.minhyun.quydu_be.service.VnpayUrlService;
import com.minhyun.quydu_be.subscription.SubscriptionPostingQuota;
import com.minhyun.quydu_be.util.ListingFieldSerializer;
import com.minhyun.quydu_be.util.SecurityUtils;
import java.io.InputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class SellerServiceImpl implements SellerService {

    private final ListingRepository listingRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ReviewRepository reviewRepository;
    private final PackageOrderRepository packageOrderRepository;
    private final ListingFieldSerializer listingFieldSerializer;
    private final VnpayUrlService vnpayUrlService;
    @Value("${app.upload-dir:uploads}")
    private String appUploadDir;
    @Value("${app.public-base-url:http://localhost:8081}")
    private String appPublicBaseUrl;

    public SellerServiceImpl(
        ListingRepository listingRepository,
        OrderRepository orderRepository,
        UserRepository userRepository,
        ReviewRepository reviewRepository,
        PackageOrderRepository packageOrderRepository,
        ListingFieldSerializer listingFieldSerializer,
        VnpayUrlService vnpayUrlService
    ) {
        this.listingRepository = listingRepository;
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.reviewRepository = reviewRepository;
        this.packageOrderRepository = packageOrderRepository;
        this.listingFieldSerializer = listingFieldSerializer;
        this.vnpayUrlService = vnpayUrlService;
    }

    @Override
    public Map<String, Object> dashboard() {
        Long sellerId = SecurityUtils.currentUserId();
        List<Listing> listings = listingRepository.findBySellerIdOrderByUpdatedAtDesc(sellerId);
        Map<String, Object> stats = new LinkedHashMap<>();
        long slotRows = listings.stream().filter(l -> l.getState() != ListingState.REJECTED).count();
        stats.put("total", slotRows);
        stats.put("published", listings.stream().filter(l -> l.getState() == ListingState.PUBLISHED).count());
        stats.put("inReview", listings.stream().filter(l -> l.getState() == ListingState.PENDING_INSPECTION).count());
        stats.put("awaitingWarehouse", listings.stream().filter(l -> l.getState() == ListingState.AWAITING_WAREHOUSE).count());
        stats.put("atWarehousePendingVerify", listings.stream().filter(l -> l.getState() == ListingState.AT_WAREHOUSE_PENDING_VERIFY).count());
        stats.put("needUpdate", listings.stream().filter(l -> l.getState() == ListingState.NEED_UPDATE).count());
        return Map.of("stats", stats, "listings", listings.stream().map(this::toListingMap).collect(Collectors.toList()));
    }

    @Override
    public Map<String, Object> getRatings() {
        Long sellerId = SecurityUtils.currentUserId();
        User seller = mustUser(sellerId);
        List<Review> docs = reviewRepository.findAll().stream()
            .filter(r -> r.getSeller().getId().equals(seller.getId()) && r.getStatus() != ReviewStatus.HIDDEN)
            .collect(Collectors.toList());
        int total = docs.size();
        if (total == 0) return Map.of("averageRating", 0, "totalReviews", 0, "positivePercent", 0, "breakdown", Map.of());
        int sum = docs.stream().mapToInt(r -> r.getRating() == null ? 0 : r.getRating()).sum();
        double avg = Math.round((sum * 10.0 / total)) / 10.0;
        return Map.of("averageRating", avg, "totalReviews", total, "positivePercent", 0, "breakdown", Map.of());
    }

    @Override
    public List<Map<String, Object>> listOrders() {
        Long sellerId = SecurityUtils.currentUserId();
        return orderRepository.findSellerOrders(sellerId).stream().map(this::toOrderMap).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public Map<String, Object> shipToBuyer(Long orderId) {
        Order order = sellerOwnedOrder(orderId);
        if (order.getFulfillmentType() != OrderFulfillmentType.DIRECT) {
            throw new BadRequestException("Chi ap dung cho don giao truc tiep.");
        }
        if (order.getStatus() != OrderStatus.PENDING_SELLER_SHIP) {
            throw new BadRequestException("Khong the xac nhan giao hang (trang thai: " + order.getStatus() + ")");
        }
        order.setStatus(OrderStatus.SHIPPING);
        order.setShippedAt(LocalDateTime.now());
        order.setExpiresAt(LocalDateTime.now().plusDays(1));
        orderRepository.save(order);
        return toOrderMap(order);
    }

    @Override
    @Transactional
    public Map<String, Object> shipToWarehouse(Long orderId) {
        Order order = sellerOwnedOrder(orderId);
        if (order.getFulfillmentType() != OrderFulfillmentType.WAREHOUSE) {
            throw new BadRequestException("Chi ap dung cho don qua kho.");
        }
        if (order.getStatus() != OrderStatus.RESERVED && order.getStatus() != OrderStatus.PENDING_SELLER_SHIP) {
            throw new BadRequestException("Khong the xac nhan gui kho (trang thai: " + order.getStatus() + ")");
        }
        order.setStatus(OrderStatus.SELLER_SHIPPED);
        order.setShippedAt(LocalDateTime.now());
        orderRepository.save(order);
        return toOrderMap(order);
    }

    @Override
    @Transactional
    public Map<String, Object> markListingShippedToWarehouse(Long listingId) {
        Listing listing = sellerOwnedListing(listingId);
        if (listing.getState() != ListingState.AWAITING_WAREHOUSE) {
            throw new BadRequestException("Chi ap dung khi tin dang cho gui kho.");
        }
        listing.setState(ListingState.AT_WAREHOUSE_PENDING_VERIFY);
        listing.setSellerShippedToWarehouseAt(LocalDateTime.now());
        listingRepository.save(listing);
        return toListingMap(listing);
    }

    @Override
    public List<Map<String, Object>> listMyListings() {
        Long sellerId = SecurityUtils.currentUserId();
        return listingRepository.findBySellerIdOrderByUpdatedAtDesc(sellerId).stream().map(this::toListingMap).collect(Collectors.toList());
    }

    @Override
    public Map<String, Object> uploadImages(MultipartFile[] images) {
        if (images == null || images.length == 0) {
            throw new BadRequestException("No images uploaded");
        }
        if (images.length > 10) {
            throw new BadRequestException("Toi da 10 anh moi lan upload");
        }
        Path listingsDir;
        try {
            listingsDir = Paths.get(appUploadDir).toAbsolutePath().normalize().resolve("listings");
            Files.createDirectories(listingsDir);
        } catch (Exception e) {
            throw new BadRequestException("Khong tao duoc thu muc upload");
        }
        String base = appPublicBaseUrl.replaceAll("/+$", "");
        List<String> urls = new ArrayList<>();
        for (MultipartFile f : images) {
            if (f == null || f.isEmpty()) {
                continue;
            }
            String original = f.getOriginalFilename();
            String safe = sanitizeUploadFilename(original);
            String stored = UUID.randomUUID() + "-" + safe;
            Path target = listingsDir.resolve(stored);
            try (InputStream in = f.getInputStream()) {
                Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
            } catch (Exception e) {
                throw new BadRequestException("Luu file that bai");
            }
            urls.add(base + "/uploads/listings/" + stored);
        }
        if (urls.isEmpty()) {
            throw new BadRequestException("No images uploaded");
        }
        return Map.of("urls", urls);
    }

    private static String sanitizeUploadFilename(String original) {
        if (original == null || original.isBlank()) {
            return "image";
        }
        String name = original.replace('\\', '_').replace('/', '_').trim();
        int slash = Math.max(name.lastIndexOf('/'), name.lastIndexOf('\\'));
        if (slash >= 0 && slash < name.length() - 1) {
            name = name.substring(slash + 1);
        }
        if (name.length() > 120) {
            name = name.substring(name.length() - 120);
        }
        return name.isEmpty() ? "image" : name;
    }

    @Override
    public Map<String, Object> getMyListing(Long id) {
        return toListingMap(sellerOwnedListing(id));
    }

    @Override
    @Transactional
    public Map<String, Object> createListing(UpsertListingRequest request) {
        User seller = mustUser(SecurityUtils.currentUserId());
        ensureActiveSubscription(seller);
        ensurePostingQuotaAvailable(seller);
        Listing listing = new Listing();
        applyListingData(listing, request);
        listing.setSeller(seller);
        listing.setState(ListingState.DRAFT);
        listing.setCertificationStatus("UNVERIFIED");
        listingRepository.save(listing);
        return toListingMap(listing);
    }

    @Override
    @Transactional
    public Map<String, Object> updateListing(Long id, UpsertListingRequest request) {
        Listing listing = sellerOwnedListing(id);
        applyListingData(listing, request);
        listingRepository.save(listing);
        return toListingMap(listing);
    }

    @Override
    @Transactional
    public Map<String, Object> publishListing(Long id, PublishListingRequest request) {
        Listing listing = sellerOwnedListing(id);
        User seller = mustUser(SecurityUtils.currentUserId());
        ensureActiveSubscription(seller);

        boolean askInspection = request != null && Boolean.TRUE.equals(request.getRequestInspection());
        if (askInspection) {
            if (seller.getSubscriptionPlan() != SubscriptionPlan.VIP) {
                throw new ForbiddenException("VIP_REQUIRED_FOR_INSPECTION");
            }
            listing.setState(ListingState.PENDING_INSPECTION);
            listing.setCertificationStatus("PENDING_CERTIFICATION");
            listing.setPublishedAt(null);
            listing.setListingExpiresAt(null);
        } else {
            listing.setState(ListingState.PUBLISHED);
            listing.setCertificationStatus("UNVERIFIED");
            listing.setPublishedAt(LocalDateTime.now());
            listing.setListingExpiresAt(LocalDateTime.now().plusDays(30));
        }
        listingRepository.save(listing);
        return toListingMap(listing);
    }

    @Override
    @Transactional
    public Map<String, Object> submitForInspection(Long id) {
        Listing listing = sellerOwnedListing(id);
        User seller = mustUser(SecurityUtils.currentUserId());
        ensureActiveSubscription(seller);
        listing.setState(ListingState.PENDING_INSPECTION);
        listing.setCertificationStatus("PENDING_CERTIFICATION");
        listing.setPublishedAt(null);
        listing.setListingExpiresAt(null);
        listingRepository.save(listing);
        return toListingMap(listing);
    }

    @Override
    @Transactional
    public Map<String, Object> checkoutSubscription(SubscriptionCheckoutRequest request) {
        if (!"VNPAY".equalsIgnoreCase(request.getProvider())) {
            throw new BadRequestException("Only VNPAY provider is supported");
        }
        User seller = mustUser(SecurityUtils.currentUserId());
        BigDecimal amount = request.getPlan() == SubscriptionPlan.VIP ? new BigDecimal("199000") : new BigDecimal("99000");
        PackageOrder order = new PackageOrder();
        order.setSeller(seller);
        order.setPlan(request.getPlan());
        order.setProvider(request.getProvider());
        order.setAmountVnd(amount);
        order.setStatus(PackageOrderStatus.PENDING);
        packageOrderRepository.save(order);
        String txnRef = "PACKAGE_" + order.getId();
        String paymentUrl;
        try {
            paymentUrl = vnpayUrlService.buildPaymentUrl(
                txnRef,
                "Thanh toan goi dang tin " + txnRef,
                amount.setScale(0, RoundingMode.UNNECESSARY).longValue()
            );
        } catch (IllegalStateException e) {
            throw new BadRequestException(
                "VNPAY config missing: set vnpay.tmnCode and vnpay.hashSecret in application-local.properties "
                    + "and run with Spring profile \"local\" (see README / application-local.properties.example). "
                    + e.getMessage()
            );
        }
        order.setPaymentUrl(paymentUrl);
        // Sandbox fallback: activate package immediately so seller can continue testing
        // even if VNPAY page does not return to localhost callback.
        seller.setSubscriptionPlan(request.getPlan());
        seller.setSubscriptionExpiresAt(LocalDateTime.now().plusDays(30));
        userRepository.save(seller);
        order.setStatus(PackageOrderStatus.COMPLETED);
        packageOrderRepository.save(order);
        return Map.of(
            "orderId", order.getId(),
            "plan", order.getPlan().name(),
            "provider", order.getProvider(),
            "amountVnd", amount,
            "paymentUrl", order.getPaymentUrl(),
            "paymentKind", "VNPAY_SANDBOX"
        );
    }

    @Override
    @Transactional
    public Map<String, Object> mockCompleteSubscriptionOrder(Long orderId) {
        Long sellerId = SecurityUtils.currentUserId();
        PackageOrder order = packageOrderRepository.findById(orderId).orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        if (!order.getSeller().getId().equals(sellerId)) {
            throw new ForbiddenException("Not your order");
        }
        order.setStatus(PackageOrderStatus.COMPLETED);
        packageOrderRepository.save(order);

        User seller = order.getSeller();
        seller.setSubscriptionPlan(order.getPlan());
        seller.setSubscriptionExpiresAt(LocalDateTime.now().plusDays(30));
        userRepository.save(seller);
        return Map.of("orderId", order.getId(), "subscription", subscriptionSummary(seller));
    }

    @Override
    @Transactional
    public Map<String, Object> revokeSelfSubscription() {
        User seller = mustUser(SecurityUtils.currentUserId());
        boolean hadPlan = seller.getSubscriptionPlan() != null || seller.getSubscriptionExpiresAt() != null;
        seller.setSubscriptionPlan(null);
        seller.setSubscriptionExpiresAt(null);
        userRepository.save(seller);
        return Map.of("subscription", subscriptionSummary(seller), "revoked", hadPlan);
    }

    private void applyListingData(Listing listing, UpsertListingRequest request) {
        listing.setTitle(request.getTitle());
        listing.setBrand(request.getBrand());
        listing.setModel(request.getModel());
        listing.setYear(request.getYear());
        listing.setPrice(request.getPrice() == null ? BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP) : request.getPrice());
        listing.setCurrency(request.getCurrency() == null ? "VND" : request.getCurrency());
        listing.setFrameSize(request.getFrameSize());
        listing.setLocation(request.getLocation());
        listing.setCondition(request.getCondition());
        listing.setDescription(request.getDescription());
        if (request.getImageUrls() != null) {
            listing.setImageUrls(request.getImageUrls());
            if (!request.getImageUrls().isEmpty()) {
                listing.setThumbnailUrl(request.getImageUrls().get(0));
            }
        }
    }

    private Listing sellerOwnedListing(Long listingId) {
        Long sellerId = SecurityUtils.currentUserId();
        return listingRepository.findByIdAndSellerId(listingId, sellerId)
            .orElseThrow(() -> new ResourceNotFoundException("Listing not found"));
    }

    private Order sellerOwnedOrder(Long orderId) {
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        if (!order.getListing().getSeller().getId().equals(SecurityUtils.currentUserId())) {
            throw new ForbiddenException("Not your order");
        }
        return order;
    }

    private User mustUser(Long userId) {
        return userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private void ensureActiveSubscription(User seller) {
        if (seller.getSubscriptionPlan() == null || seller.getSubscriptionExpiresAt() == null ||
            !seller.getSubscriptionExpiresAt().isAfter(LocalDateTime.now())) {
            throw new ForbiddenException("PACKAGE_REQUIRED");
        }
    }

    private Map<String, Object> subscriptionSummary(User user) {
        Map<String, Object> out = new LinkedHashMap<>();
        SubscriptionPlan plan = user.getSubscriptionPlan();
        boolean active = user.getSubscriptionExpiresAt() != null && user.getSubscriptionExpiresAt().isAfter(LocalDateTime.now());
        int limit = SubscriptionPostingQuota.limitForPlan(plan);
        long used = plan == null ? 0 : listingRepository.countOccupyingPostingSlots(user.getId(), ListingState.REJECTED);
        out.put("plan", plan == null ? null : plan.name());
        out.put("expiresAt", user.getSubscriptionExpiresAt());
        out.put("active", active);
        out.put("publishedSlotsUsed", used);
        out.put("publishedSlotsLimit", limit);
        out.put("listingDurationDays", 30);
        return out;
    }

    /** Mỗi tin mới (không ẩn) = 1 lượt; kiểm tra trước khi tạo bản ghi. */
    private void ensurePostingQuotaAvailable(User seller) {
        SubscriptionPlan plan = seller.getSubscriptionPlan();
        int limit = SubscriptionPostingQuota.limitForPlan(plan);
        long used = listingRepository.countOccupyingPostingSlots(seller.getId(), ListingState.REJECTED);
        if (used >= limit) {
            throw new ForbiddenException("LISTING_SLOT_LIMIT");
        }
    }

    private Map<String, Object> toListingMap(Listing l) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", l.getId());
        m.put("title", l.getTitle());
        m.put("brand", l.getBrand());
        m.put("model", l.getModel());
        m.put("year", l.getYear());
        m.put("frameSize", l.getFrameSize());
        m.put("price", l.getPrice());
        m.put("currency", l.getCurrency());
        m.put("location", l.getLocation());
        m.put("description", l.getDescription());
        m.put("imageUrls", l.getImageUrls() == null ? List.of() : l.getImageUrls());
        m.put("thumbnailUrl", l.getThumbnailUrl());
        m.put("state", l.getState() == null ? null : l.getState().name());
        m.put("certificationStatus", l.getCertificationStatus());
        m.put("publishedAt", l.getPublishedAt());
        m.put("listingExpiresAt", l.getListingExpiresAt());
        listingFieldSerializer.addExtendedFields(l, m);
        return m;
    }

    private Map<String, Object> toOrderMap(Order o) {
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("id", o.getId());
        out.put("listingId", o.getListing().getId());
        out.put("buyerId", o.getBuyer().getId());
        out.put("status", o.getStatus().name());
        out.put("fulfillmentType", o.getFulfillmentType() == null ? "WAREHOUSE" : o.getFulfillmentType().name());
        out.put("plan", o.getPlan().name());
        out.put("totalPrice", o.getTotalPrice());
        out.put("depositAmount", o.getDepositAmount());
        out.put("depositPaid", o.isDepositPaid());
        out.put("balancePaid", o.isBalancePaid());
        out.put("expiresAt", o.getExpiresAt());
        out.put("shippedAt", o.getShippedAt());
        return out;
    }
}
