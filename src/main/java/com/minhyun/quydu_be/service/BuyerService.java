package com.minhyun.quydu_be.service;

import com.minhyun.quydu_be.dto.request.CreateOrderRequest;
import com.minhyun.quydu_be.dto.request.CreateReviewRequest;
import java.util.List;
import java.util.Map;

public interface BuyerService {

    Map<String, Object> createOrder(CreateOrderRequest request);
    Map<String, Object> createOrderVnpayCheckout(CreateOrderRequest request);
    Map<String, Object> resumeOrderVnpay(Long orderId);
    Map<String, Object> payBalanceVnpay(Long orderId);
    List<Map<String, Object>> getMyOrders();
    Map<String, Object> getOrderById(Long orderId);

    /**
     * Chi tiết giao dịch / đơn theo listing (khớp FE: /transaction/{listingId}?orderId=…).
     * Nếu có orderId: trả đơn đó khi thuộc buyer và khớp listingId; không: đơn mới nhất của buyer cho listing.
     */
    Map<String, Object> getOrderForListingTransaction(Long listingId, Long orderId);
    Map<String, Object> completeOrder(Long orderId);
    Map<String, Object> cancelOrder(Long orderId);
    Map<String, Object> createReviewForOrder(Long orderId, CreateReviewRequest request);
    List<Map<String, Object>> listMyReviews();
    Map<String, Object> initiateCashPayment();
}
