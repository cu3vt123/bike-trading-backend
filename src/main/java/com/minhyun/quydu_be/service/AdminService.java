package com.minhyun.quydu_be.service;

import java.util.List;
import java.util.Map;

public interface AdminService {
    List<Map<String, Object>> listWarehousePending();
    Map<String, Object> confirmWarehouse(Long orderId);
    List<Map<String, Object>> listReInspectionOrders();
    Map<String, Object> markReInspectionDone(Long orderId);
    Map<String, Object> getStats();
    List<Map<String, Object>> listUsers();
    Map<String, Object> hideUser(Long id);
    Map<String, Object> unhideUser(Long id);
    List<Map<String, Object>> listListings();
    Map<String, Object> hideListing(Long id);
    Map<String, Object> unhideListing(Long id);
    List<Map<String, Object>> listWarehouseIntakePending();
    Map<String, Object> confirmWarehouseIntake(Long listingId);
    Map<String, Object> confirmWarehouseReInspection(Long listingId, String action, String reason);
    List<Map<String, Object>> listSellerSubscriptions();
    Map<String, Object> revokeSellerSubscription(Long userId);
    List<Map<String, Object>> listReviews();
    Map<String, Object> updateReview(Long id, Integer rating, String comment, String status);
}
