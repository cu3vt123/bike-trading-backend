package com.minhyun.quydu_be.web;

import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

/**
 * Chuẩn body JSON thống nhất cho REST (khớp client ShopBike / quydu12: {@code data}, {@code content}, 201 tạo mới).
 */
public final class RestResponses {

    private RestResponses() {
    }

    public static ResponseEntity<Map<String, Object>> okData(Object body) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("data", body);
        return ResponseEntity.ok(m);
    }

    public static ResponseEntity<Map<String, Object>> createdData(Object body) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("data", body);
        return ResponseEntity.status(HttpStatus.CREATED).body(m);
    }

    public static ResponseEntity<Map<String, Object>> okContent(Object content) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("content", content);
        return ResponseEntity.ok(m);
    }
}
