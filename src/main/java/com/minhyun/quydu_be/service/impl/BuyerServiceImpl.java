package com.minhyun.quydu_be.service.impl;

import com.minhyun.quydu_be.dto.request.CreateOrderRequest;
import com.minhyun.quydu_be.dto.request.CreateReviewRequest;
import com.minhyun.quydu_be.entity.Listing;
import com.minhyun.quydu_be.entity.ListingState;
import com.minhyun.quydu_be.entity.Order;
import com.minhyun.quydu_be.entity.OrderFulfillmentType;
import com.minhyun.quydu_be.entity.OrderStatus;
import com.minhyun.quydu_be.entity.VnpayPaymentStatus;
import com.minhyun.quydu_be.entity.Review;
import com.minhyun.quydu_be.entity.ReviewStatus;
import com.minhyun.quydu_be.entity.ShippingAddress;
import com.minhyun.quydu_be.entity.User;
import com.minhyun.quydu_be.exception.BadRequestException;
import com.minhyun.quydu_be.exception.ForbiddenException;
import com.minhyun.quydu_be.exception.ResourceNotFoundException;
import com.minhyun.quydu_be.repository.ListingRepository;
import com.minhyun.quydu_be.repository.OrderRepository;
import com.minhyun.quydu_be.repository.ReviewRepository;
import com.minhyun.quydu_be.repository.UserRepository;
import com.minhyun.quydu_be.service.BuyerService;
import com.minhyun.quydu_be.service.VnpayUrlService;
import com.minhyun.quydu_be.util.SecurityUtils;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BuyerServiceImpl implements BuyerService {

    /** Khớp copy FE: tối đa số lần hủy đặt chỗ trong cửa sổ ngày. */
    private static final int BUYER_CANCEL_WINDOW_DAYS = 7;
    private static final int BUYER_CANCEL_MAX_IN_WINDOW = 3;

    private final OrderRepository orderRepository;
    private final ListingRepository listingRepository;
    private final UserRepository userRepository;
    private final ReviewRepository reviewRepository;
    private final VnpayUrlService vnpayUrlService;

    public BuyerServiceImpl(
        OrderRepository orderRepository,
        ListingRepository listingRepository,
        UserRepository userRepository,
        ReviewRepository reviewRepository,
        VnpayUrlService vnpayUrlService
    ) {
        this.orderRepository = orderRepository;
        this.listingRepository = listingRepository;
        this.userRepository = userRepository;
        this.reviewRepository = reviewRepository;
        this.vnpayUrlService = vnpayUrlService;
    }

    @Override
    @Transactional
    public Map<String, Object> createOrder(CreateOrderRequest request) {
        throw new BadRequestException("USE_VNPAY_CHECKOUT: Mua xe qua POST /api/buyer/orders/vnpay-checkout.");
    }

    @Override
    @Transactional
    public Map<String, Object> createOrderVnpayCheckout(CreateOrderRequest request) {
        User buyer = currentBuyer();
        Listing listing = listingRepository.findById(request.getListingId())
            .orElseThrow(() -> new ResourceNotFoundException("Listing not found"));

        if (listing.isHidden()) {
            throw new BadRequestException("Listing not available for purchase");
        }
        if (listing.getState() == ListingState.RESERVED) {
            var mine = orderRepository.findTopByBuyerAndListingIdAndStatusInOrderByCreatedAtDesc(
                buyer,
                listing.getId(),
                List.of(OrderStatus.RESERVED, OrderStatus.IN_TRANSACTION)
            );
            if (mine.isPresent()) {
                Order existing = orderRepository.findByIdWithGraph(mine.get().getId()).orElse(mine.get());
                // Buyer bấm lại thanh toán cho cùng đơn: trả lại paymentUrl cũ để resume.
                Map<String, Object> out = toOrderMap(existing);
                long amountVnd = orderVnpayAmountVnd(existing);
                out.put("paymentUrl", vnpayUrlService.buildPaymentUrl(
                    "ORDER_" + existing.getId(),
                    "ShopBike order " + existing.getId(),
                    amountVnd
                ));
                out.put("txnRef", "ORDER_" + existing.getId());
                return out;
            }

            var reservedOrder = orderRepository.findTopByListingIdAndStatusInOrderByCreatedAtDesc(
                listing.getId(),
                List.of(OrderStatus.RESERVED, OrderStatus.IN_TRANSACTION)
            );
            if (reservedOrder.isPresent()) {
                Order existing = reservedOrder.get();
                LocalDateTime exp = existing.getExpiresAt();
                // Đơn giữ chỗ đã quá hạn: tự nhả listing để buyer khác có thể checkout.
                if (exp != null && !exp.isAfter(LocalDateTime.now())) {
                    existing.setStatus(OrderStatus.CANCELLED);
                    orderRepository.save(existing);
                    listing.setState(ListingState.PUBLISHED);
                    listingRepository.save(listing);
                } else {
                    throw new BadRequestException("Listing is currently reserved by another order");
                }
            } else {
                // Trạng thái listing bị lệch dữ liệu (RESERVED nhưng không còn order active).
                listing.setState(ListingState.PUBLISHED);
                listingRepository.save(listing);
            }
        }
        if (listing.getState() != ListingState.PUBLISHED) {
            throw new BadRequestException("Listing not available for purchase");
        }
        if (listing.getListingExpiresAt() != null && !listing.getListingExpiresAt().isAfter(LocalDateTime.now())) {
            throw new BadRequestException("Listing has expired");
        }

        BigDecimal totalPrice = listing.getPrice();
        // Khớp FE/Node: cọc = Math.round(giá * 0.08) VND nguyên; FULL = giá làm tròn VND.
        BigDecimal depositAmount = totalPrice.multiply(new BigDecimal("0.08")).setScale(0, RoundingMode.HALF_UP);
        BigDecimal vnpayAmount = request.getPlan().name().equals("DEPOSIT")
            ? depositAmount
            : totalPrice.setScale(0, RoundingMode.HALF_UP);

        ShippingAddress address = new ShippingAddress();
        address.setStreet(request.getShippingAddress().getStreet());
        address.setCity(request.getShippingAddress().getCity());
        address.setPostalCode(request.getShippingAddress().getPostalCode() == null ? "" : request.getShippingAddress().getPostalCode());

        Order order = new Order();
        order.setBuyer(buyer);
        order.setListing(listing);
        order.setStatus(OrderStatus.RESERVED);
        order.setFulfillmentType(
            "CERTIFIED".equalsIgnoreCase(listing.getCertificationStatus())
                ? OrderFulfillmentType.WAREHOUSE
                : OrderFulfillmentType.DIRECT
        );
        order.setPlan(request.getPlan());
        order.setTotalPrice(totalPrice);
        order.setDepositAmount(depositAmount);
        order.setDepositPaid(false);
        order.setShippingAddress(address);
        order.setExpiresAt(LocalDateTime.now().plusHours(24));
        order.setVnpayAmountVnd(vnpayAmount);
        order.setVnpayPaymentStatus(VnpayPaymentStatus.PENDING_PAYMENT);
        orderRepository.save(order);

        listing.setState(ListingState.RESERVED);
        listingRepository.save(listing);

        Order forJson = orderRepository.findByIdWithGraph(order.getId()).orElse(order);
        Map<String, Object> out = toOrderMap(forJson);
        long amountVnd = orderVnpayAmountVnd(forJson);
        out.put("paymentUrl", vnpayUrlService.buildPaymentUrl(
            "ORDER_" + order.getId(),
            "ShopBike order " + order.getId(),
            amountVnd
        ));
        out.put("txnRef", "ORDER_" + order.getId());
        return out;
    }

    @Override
    public Map<String, Object> resumeOrderVnpay(Long orderId) {
        Order order = getOwnedOrder(orderId);
        long amountVnd = orderVnpayAmountVnd(order);
        String paymentUrl = vnpayUrlService.buildPaymentUrl(
            "ORDER_" + order.getId(),
            "ShopBike order " + order.getId(),
            amountVnd
        );
        return Map.of(
            "paymentUrl", paymentUrl,
            "txnRef", "ORDER_" + order.getId(),
            "orderId", String.valueOf(order.getId()),
            "vnpayAmountVnd", order.getVnpayAmountVnd()
        );
    }

    @Override
    public Map<String, Object> payBalanceVnpay(Long orderId) {
        Order order = getOwnedOrder(orderId);
        if (order.getPlan().name().equals("FULL")) {
            throw new BadRequestException("Chỉ đơn đặt cọc mới thanh toán số dư.");
        }
        BigDecimal balance = order.getTotalPrice().subtract(order.getDepositAmount() == null ? BigDecimal.ZERO : order.getDepositAmount());
        long balanceVnd = balance.setScale(0, RoundingMode.HALF_UP).longValue();
        String paymentUrl = vnpayUrlService.buildPaymentUrl(
            "BALANCE_" + order.getId(),
            "ShopBike balance " + order.getId(),
            balanceVnd
        );
        return Map.of(
            "paymentUrl", paymentUrl,
            "orderId", String.valueOf(order.getId()),
            "balanceAmount", balance,
            "txnRef", "BALANCE_" + order.getId()
        );
    }

    private static long orderVnpayAmountVnd(Order order) {
        BigDecimal amountBd = order.getVnpayAmountVnd() != null ? order.getVnpayAmountVnd() : order.getTotalPrice();
        return amountBd.setScale(0, RoundingMode.HALF_UP).longValue();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getMyOrders() {
        User buyer = currentBuyer();
        return orderRepository.findByBuyerWithGraphOrderByCreatedAtDesc(buyer)
            .stream()
            .map(this::toOrderMap)
            .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getOrderById(Long orderId) {
        return toOrderMap(getOwnedOrder(orderId));
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getOrderForListingTransaction(Long listingId, Long orderId) {
        User buyer = currentBuyer();
        if (orderId != null) {
            Order order = getOwnedOrder(orderId);
            if (!order.getListing().getId().equals(listingId)) {
                throw new BadRequestException("orderId does not belong to this listing");
            }
            Order withGraph = orderRepository.findByIdWithGraph(order.getId()).orElse(order);
            return toOrderMap(withGraph);
        }
        Order latest = orderRepository
            .findTopByBuyerAndListingIdOrderByCreatedAtDesc(buyer, listingId)
            .orElseThrow(() -> new ResourceNotFoundException("No order for this listing"));
        Order withGraph = orderRepository.findByIdWithGraph(latest.getId()).orElse(latest);
        return toOrderMap(withGraph);
    }

    @Override
    @Transactional
    public Map<String, Object> completeOrder(Long orderId) {
        Order order = getOwnedOrder(orderId);
        if (order.getStatus() != OrderStatus.SHIPPING) {
            String hint = order.getFulfillmentType() == OrderFulfillmentType.DIRECT
                ? "Chỉ hoàn tất khi seller đã giao xe và đơn đang ở trạng thái đang giao (SHIPPING)."
                : "Chỉ hoàn tất khi xe đã qua kho, kiểm định lại và đang giao tới bạn (SHIPPING).";
            throw new BadRequestException(hint + " (hiện tại: " + order.getStatus() + ")");
        }
        order.setStatus(OrderStatus.COMPLETED);
        orderRepository.save(order);

        Listing listing = order.getListing();
        listing.setState(ListingState.SOLD);
        listingRepository.save(listing);
        return toOrderMap(order);
    }

    @Override
    @Transactional
    public Map<String, Object> cancelOrder(Long orderId) {
        Order order = getOwnedOrder(orderId);
        Set<OrderStatus> cancellable = Set.of(
            OrderStatus.RESERVED,
            OrderStatus.IN_TRANSACTION,
            OrderStatus.PENDING_SELLER_SHIP,
            OrderStatus.SELLER_SHIPPED,
            OrderStatus.AT_WAREHOUSE_PENDING_ADMIN,
            OrderStatus.RE_INSPECTION,
            OrderStatus.RE_INSPECTION_DONE,
            OrderStatus.SHIPPING
        );
        if (!cancellable.contains(order.getStatus())) {
            throw new BadRequestException("Không thể hủy đơn ở trạng thái " + order.getStatus());
        }
        User buyer = order.getBuyer();
        LocalDateTime since = LocalDateTime.now().minusDays(BUYER_CANCEL_WINDOW_DAYS);
        long recentBuyerCancels = orderRepository.countBuyerInitiatedCancellationsSince(buyer, since);
        if (recentBuyerCancels >= BUYER_CANCEL_MAX_IN_WINDOW) {
            throw new BadRequestException(
                "Đã đạt giới hạn hủy đặt chỗ: tối đa "
                    + BUYER_CANCEL_MAX_IN_WINDOW
                    + " lần trong "
                    + BUYER_CANCEL_WINDOW_DAYS
                    + " ngày gần nhất."
            );
        }
        order.setStatus(OrderStatus.CANCELLED);
        order.setBuyerCancelledAt(LocalDateTime.now());
        orderRepository.save(order);

        Listing listing = order.getListing();
        listing.setState(ListingState.PUBLISHED);
        listingRepository.save(listing);
        return toOrderMap(order);
    }

    @Override
    @Transactional
    public Map<String, Object> createReviewForOrder(Long orderId, CreateReviewRequest request) {
        User buyer = currentBuyer();
        Order order = getOwnedOrder(orderId);
        if (order.getStatus() != OrderStatus.COMPLETED) {
            throw new BadRequestException("Order must be completed before reviewing");
        }
        if (!order.getListing().getId().equals(request.getListingId())) {
            throw new BadRequestException("Listing does not match order");
        }

        User seller = userRepository.findById(request.getSellerId())
            .orElseThrow(() -> new ResourceNotFoundException("Seller not found"));

        Review review = new Review();
        review.setOrder(order);
        review.setListing(order.getListing());
        review.setSeller(seller);
        review.setBuyer(buyer);
        review.setRating(request.getRating());
        review.setComment(request.getComment() == null ? "" : request.getComment());
        review.setStatus(ReviewStatus.PENDING);
        reviewRepository.save(review);

        return toReviewMap(review);
    }

    @Override
    public List<Map<String, Object>> listMyReviews() {
        User buyer = currentBuyer();
        return reviewRepository.findByBuyerOrderByCreatedAtDesc(buyer)
            .stream()
            .map(this::toReviewMap)
            .collect(Collectors.toList());
    }

    @Override
    public Map<String, Object> initiateCashPayment() {
        return Map.of(
            "ok", true,
            "paymentMethod", Map.of("type", "CASH")
        );
    }

    private User currentBuyer() {
        Long userId = SecurityUtils.currentUserId();
        return userRepository.findById(userId).orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private Order getOwnedOrder(Long orderId) {
        Long userId = SecurityUtils.currentUserId();
        Order order = orderRepository.findByIdWithGraph(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        if (!order.getBuyer().getId().equals(userId)) {
            throw new ForbiddenException("Not your order");
        }
        return order;
    }

    private static String jsonId(Long id) {
        return id == null ? null : String.valueOf(id);
    }

    private Map<String, Object> toOrderMap(Order o) {
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("id", jsonId(o.getId()));
        out.put("listingId", jsonId(o.getListing().getId()));
        out.put("buyerId", jsonId(o.getBuyer().getId()));
        out.put("sellerId", o.getListing().getSeller() == null ? null : jsonId(o.getListing().getSeller().getId()));
        out.put("status", o.getStatus().name());
        out.put("plan", o.getPlan().name());
        out.put("fulfillmentType", o.getFulfillmentType() == null ? "WAREHOUSE" : o.getFulfillmentType().name());
        out.put("totalPrice", o.getTotalPrice());
        out.put("depositAmount", o.getDepositAmount());
        out.put("depositPaid", o.isDepositPaid());
        out.put("balancePaid", o.isBalancePaid());
        out.put("vnpayAmountVnd", o.getVnpayAmountVnd());
        out.put("vnpayPaymentStatus", o.getVnpayPaymentStatus() == null ? null : o.getVnpayPaymentStatus().name());
        out.put("createdAt", o.getCreatedAt());
        out.put("updatedAt", o.getUpdatedAt());
        out.put("shippedAt", o.getShippedAt());
        out.put("warehouseConfirmedAt", o.getWarehouseConfirmedAt());
        out.put("reInspectionDoneAt", o.getReInspectionDoneAt());
        out.put("shippingAddress", Map.of(
            "street", o.getShippingAddress() == null ? "" : safe(o.getShippingAddress().getStreet()),
            "city", o.getShippingAddress() == null ? "" : safe(o.getShippingAddress().getCity()),
            "postalCode", o.getShippingAddress() == null ? "" : safe(o.getShippingAddress().getPostalCode())
        ));
        out.put("expiresAt", o.getExpiresAt());
        Map<String, Object> listingMap = new LinkedHashMap<>();
        listingMap.put("id", jsonId(o.getListing().getId()));
        listingMap.put("title", safe(o.getListing().getTitle()));
        listingMap.put("brand", safe(o.getListing().getBrand()));
        listingMap.put("model", safe(o.getListing().getModel()));
        listingMap.put("price", o.getListing().getPrice());
        listingMap.put("currency", safe(o.getListing().getCurrency()));
        listingMap.put("imageUrls", o.getListing().getImageUrls() == null ? List.of() : o.getListing().getImageUrls());
        listingMap.put("thumbnailUrl", safe(o.getListing().getThumbnailUrl()));
        Map<String, Object> seller = new LinkedHashMap<>();
        seller.put("id", o.getListing().getSeller() == null ? null : jsonId(o.getListing().getSeller().getId()));
        seller.put("name", o.getListing().getSeller() == null ? "" : safe(o.getListing().getSeller().getDisplayName()));
        seller.put("email", o.getListing().getSeller() == null ? "" : safe(o.getListing().getSeller().getEmail()));
        listingMap.put("seller", seller);
        out.put("listing", listingMap);
        return out;
    }

    private Map<String, Object> toReviewMap(Review r) {
        return Map.of(
            "id", jsonId(r.getId()),
            "orderId", jsonId(r.getOrder().getId()),
            "listingId", jsonId(r.getListing().getId()),
            "sellerId", jsonId(r.getSeller().getId()),
            "buyerId", jsonId(r.getBuyer().getId()),
            "rating", r.getRating(),
            "comment", safe(r.getComment()),
            "status", r.getStatus().name()
        );
    }

    private String safe(String value) {
        return value == null ? "" : value;
    }
}
