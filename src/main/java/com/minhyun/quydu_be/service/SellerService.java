package com.minhyun.quydu_be.service;

import com.minhyun.quydu_be.dto.request.PublishListingRequest;
import com.minhyun.quydu_be.dto.request.SubscriptionCheckoutRequest;
import com.minhyun.quydu_be.dto.request.UpsertListingRequest;
import java.util.List;
import java.util.Map;
import org.springframework.web.multipart.MultipartFile;

public interface SellerService {
    Map<String, Object> dashboard();
    Map<String, Object> getRatings();
    List<Map<String, Object>> listOrders();
    Map<String, Object> shipToBuyer(Long orderId);
    Map<String, Object> shipToWarehouse(Long orderId);
    Map<String, Object> markListingShippedToWarehouse(Long listingId);
    List<Map<String, Object>> listMyListings();
    Map<String, Object> uploadImages(MultipartFile[] images);
    Map<String, Object> getMyListing(Long id);
    Map<String, Object> createListing(UpsertListingRequest request);
    Map<String, Object> updateListing(Long id, UpsertListingRequest request);
    Map<String, Object> publishListing(Long id, PublishListingRequest request);
    Map<String, Object> submitForInspection(Long id);
    Map<String, Object> checkoutSubscription(SubscriptionCheckoutRequest request);
    Map<String, Object> mockCompleteSubscriptionOrder(Long orderId);
    Map<String, Object> revokeSelfSubscription();
}
