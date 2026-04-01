package com.bob.planb.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // 1. Bắt lỗi khi người dùng nhập thiếu dữ liệu (Các annotation @Valid, @NotBlank, @NotNull...)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();

        // Gom tất cả các lỗi của các field lại thành một danh sách
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                "message", "Dữ liệu đầu vào không hợp lệ",
                "errors", errors
        ));
    }

    // 2. Bắt các lỗi logic do chính chúng ta ném ra (Ví dụ: throw new RuntimeException("Không tìm thấy xe"))
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<?> handleRuntimeException(RuntimeException ex) {
        // Trả về đúng định dạng JSON { "message": "Nội dung lỗi" } giống hệt Node.js
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                "message", ex.getMessage()
        ));
    }

    // 3. Bắt toàn bộ các lỗi hệ thống "bất thình lình" khác (Tránh sập Server)
    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleGlobalException(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "message", "Lỗi Server Cục Bộ (Internal Server Error). Vui lòng thử lại sau.",
                "details", ex.getMessage()
        ));
    }
}