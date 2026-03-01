package com.biketrading.backend.exception;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.HashMap;
import java.util.Map;

@ControllerAdvice // Đây là cái "lưới" để hứng mọi lỗi từ Controller đổ ra
public class GlobalExceptionHandler {

    // Bắt lỗi trùng lặp dữ liệu trong Database (Duplicate Key)
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, String>> handleConflictException(DataIntegrityViolationException ex) {
        Map<String, String> errors = new HashMap<>();
        errors.put("status", "409");
        errors.put("error", "Conflict");
        errors.put("message", "Tên đăng nhập hoặc dữ liệu này đã tồn tại rồi anh Bảo ơi!");

        return new ResponseEntity<>(errors, HttpStatus.CONFLICT);
    }

    // Bắt các lỗi chung chung khác để tránh lỗi 500 trắng trang
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGeneralException(Exception ex) {
        Map<String, String> errors = new HashMap<>();
        errors.put("status", "500");
        errors.put("message", "Lỗi hệ thống rồi: " + ex.getMessage());

        return new ResponseEntity<>(errors, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}