package com.minhyun.quydu_be.service;

import com.minhyun.quydu_be.dto.request.InspectorApproveRequest;
import java.util.List;
import java.util.Map;

public interface InspectorService {
    List<Map<String, Object>> pendingListings();
    Map<String, Object> getListing(Long id);
    Map<String, Object> approve(Long id, InspectorApproveRequest request);
    Map<String, Object> reject(Long id);
    Map<String, Object> needUpdate(Long id, String reason);
}
