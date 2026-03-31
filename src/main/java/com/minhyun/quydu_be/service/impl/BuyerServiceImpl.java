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

    private final OrderRepository orderRepository;
    private final ListingRepository listingRepository;
    private final UserRepository userRepository;
    private final ReviewRepository reviewRepository;

    public BuyerServiceImpl(
        OrderRepository orderRepository,
        ListingRepository listingRepository,
        UserRepository userRepository,
        ReviewRepository reviewRepository
    ) {
        this.orderRepository = orderRepository;
        this.listingRepository = listingRepository;
        this.userRepository = userRepository;
        this.reviewRepository = reviewRepository;
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
                Order existing = mine.get();
                // Buyer bấm lại thanh toán cho cùng đơn: trả lại paymentUrl cũ để resume.
                Map<String, Object> out = toOrderMap(existing);
                out.put("paymentUrl", "http://localhost:8081/payment/create?orderId=" + existing.getId());
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
        BigDecimal depositAmount = totalPrice.multiply(new BigDecimal("0.08")).setScale(2, RoundingMode.HALF_UP);
        BigDecimal vnpayAmount = request.getPlan().name().equals("DEPOSIT") ? depositAmount : totalPrice;

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

        Map<String, Object> out = toOrderMap(order);
        out.put("paymentUrl", "http://localhost:8081/payment/create?orderId=" + order.getId());
        out.put("txnRef", "ORDER_" + order.getId());
        return out;
    }

    @Override
    public Map<String, Object> resumeOrderVnpay(Long orderId) {
        Order order = getOwnedOrder(orderId);
        return Map.of(
            "paymentUrl", "http://localhost:8081/payment/create?orderId=" + order.getId(),
            "txnRef", "ORDER_" + order.getId(),
            "orderId", order.getId(),
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
        return Map.of(
            "paymentUrl", "http://localhost:8081/payment/create?orderId=" + order.getId() + "&kind=BALANCE",
            "orderId", order.getId(),
            "balanceAmount", balance,
            "txnRef", "BALANCE_" + order.getId()
        );
    }

    @Override
    public List<Map<String, Object>> getMyOrders() {
        User buyer = currentBuyer();
        return orderRepository.findByBuyerOrderByCreatedAtDesc(buyer)
            .stream()
            .map(this::toOrderMap)
            .collect(Collectors.toList());
    }

    @Override
    public Map<String, Object> getOrderById(Long orderId) {
        return toOrderMap(getOwnedOrder(orderId));
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
        order.setStatus(OrderStatus.CANCELLED);
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
        Order order = orderRepository.findById(orderId).orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        if (!order.getBuyer().getId().equals(userId)) {
            throw new ForbiddenException("Not your order");
        }
        return order;
    }

    private Map<String, Object> toOrderMap(Order o) {
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("id", o.getId());
        out.put("listingId", o.getListing().getId());
        out.put("buyerId", o.getBuyer().getId());
        out.put("sellerId", o.getListing().getSeller() == null ? null : o.getListing().getSeller().getId());
        out.put("status", o.getStatus().name());
        out.put("plan", o.getPlan().name());
        out.put("fulfillmentType", o.getFulfillmentType() == null ? "WAREHOUSE" : o.getFulfillmentType().name());
        out.put("totalPrice", o.getTotalPrice());
        out.put("depositAmount", o.getDepositAmount());
        out.put("depositPaid", o.isDepositPaid());
        out.put("balancePaid", o.isBalancePaid());
        out.put("vnpayAmountVnd", o.getVnpayAmountVnd());
        out.put("shippingAddress", Map.of(
            "street", o.getShippingAddress() == null ? "" : safe(o.getShippingAddress().getStreet()),
            "city", o.getShippingAddress() == null ? "" : safe(o.getShippingAddress().getCity()),
            "postalCode", o.getShippingAddress() == null ? "" : safe(o.getShippingAddress().getPostalCode())
        ));
        out.put("expiresAt", o.getExpiresAt());
        Map<String, Object> listingMap = new LinkedHashMap<>();
        listingMap.put("id", o.getListing().getId());
        listingMap.put("title", safe(o.getListing().getTitle()));
        listingMap.put("brand", safe(o.getListing().getBrand()));
        listingMap.put("model", safe(o.getListing().getModel()));
        listingMap.put("price", o.getListing().getPrice());
        listingMap.put("currency", safe(o.getListing().getCurrency()));
        listingMap.put("imageUrls", o.getListing().getImageUrls() == null ? List.of() : o.getListing().getImageUrls());
        listingMap.put("thumbnailUrl", safe(o.getListing().getThumbnailUrl()));
        Map<String, Object> seller = new LinkedHashMap<>();
        seller.put("id", o.getListing().getSeller() == null ? null : o.getListing().getSeller().getId());
        seller.put("name", o.getListing().getSeller() == null ? "" : safe(o.getListing().getSeller().getDisplayName()));
        seller.put("email", o.getListing().getSeller() == null ? "" : safe(o.getListing().getSeller().getEmail()));
        listingMap.put("seller", seller);
        out.put("listing", listingMap);
        return out;
    }

    private Map<String, Object> toReviewMap(Review r) {
        return Map.of(
            "id", r.getId(),
            "orderId", r.getOrder().getId(),
            "listingId", r.getListing().getId(),
            "sellerId", r.getSeller().getId(),
            "buyerId", r.getBuyer().getId(),
            "rating", r.getRating(),
            "comment", safe(r.getComment()),
            "status", r.getStatus().name()
        );
    }

    private String safe(String value) {
        return value == null ? "" : value;
    }
}
