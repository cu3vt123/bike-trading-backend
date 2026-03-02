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

    // 2. Bắt lỗi ràng buộc dữ liệu từ DB (UNIQUE/FK/NOT NULL/...)
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>> handleDataIntegrityViolation(DataIntegrityViolationException ex) {
        Map<String, Object> body = new HashMap<>();

        String rootMsg = ex.getMostSpecificCause() != null
                ? ex.getMostSpecificCause().getMessage()
                : ex.getMessage();

        String msgLower = rootMsg != null ? rootMsg.toLowerCase() : "";

        boolean isDuplicate = msgLower.contains("duplicate") || msgLower.contains("unique");
        boolean isFkFail = msgLower.contains("foreign key constraint fails")
                || msgLower.contains("cannot add or update a child row");
        boolean isNotNull = msgLower.contains("cannot be null") || msgLower.contains("doesn't have a default value");

        if (isDuplicate) {
            body.put("status", 409);
            body.put("error", "Conflict");
            body.put("message", "Dữ liệu đã tồn tại (trùng khóa/unique).");
            body.put("debug", rootMsg); // DEV: xem key nào bị trùng
            return new ResponseEntity<>(body, HttpStatus.CONFLICT);
        }

        // Các lỗi còn lại thường là dữ liệu request không đúng -> 400
        body.put("status", 400);
        body.put("error", "Bad Request");

        if (isFkFail) {
            body.put("message", "Sai khóa ngoại: buyerId hoặc bikeId không tồn tại.");
        } else if (isNotNull) {
            body.put("message", "Thiếu dữ liệu bắt buộc theo ràng buộc CSDL (NOT NULL).");
        } else {
            body.put("message", "Dữ liệu vi phạm ràng buộc CSDL.");
        }

        body.put("debug", rootMsg); // DEV: cực hữu ích để test SHOP-33
        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
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