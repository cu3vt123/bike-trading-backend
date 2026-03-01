package com.biketrading.backend.exception;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.HashMap;
import java.util.Map;

@ControllerAdvice // Gom tất cả các lỗi từ Controller về đây xử lý
public class GlobalExceptionHandler {

    // 1. Bắt lỗi Validation (Ví dụ: Thiếu @NotBlank, @NotNull hoặc sai định dạng dữ liệu)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, Object> body = new HashMap<>();
        Map<String, String> errors = new HashMap<>();

        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        body.put("status", 400);
        body.put("error", "Bad Request");
        body.put("message", "Dữ liệu nhập vào không hợp lệ đâu anh Bảo ơi!");
        body.put("details", errors); // Trả về danh sách chi tiết từng trường bị lỗi

        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }

    // 2. Bắt lỗi trùng lặp dữ liệu (Ví dụ: Trùng Username, Email đã có trong DB)
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, String>> handleConflictException(DataIntegrityViolationException ex) {
        Map<String, String> errors = new HashMap<>();
        errors.put("status", "409");
        errors.put("error", "Conflict");
        errors.put("message", "Tên đăng nhập hoặc dữ liệu này đã tồn tại rồi! (Duplicate Key)");

        return new ResponseEntity<>(errors, HttpStatus.CONFLICT);
    }

    // 3. Chốt chặn cuối cùng: Bắt mọi lỗi chưa xác định (Tránh văng lỗi 500 kèm log đỏ loằng ngoằng)
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGeneralException(Exception ex) {
        Map<String, String> errors = new HashMap<>();
        errors.put("status", "500");
        errors.put("error", "Internal Server Error");
        errors.put("message", "Lỗi hệ thống rồi: " + ex.getMessage());

        return new ResponseEntity<>(errors, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}