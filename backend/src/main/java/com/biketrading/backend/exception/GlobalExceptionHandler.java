package com.biketrading.backend.exception;

import com.biketrading.backend.util.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidation(MethodArgumentNotValidException ex) {
        String msg = ex.getBindingResult().getFieldErrors().isEmpty()
                ? "Validation failed"
                : ex.getBindingResult().getFieldErrors().get(0).getDefaultMessage();
        return ApiResponse.error(HttpStatus.BAD_REQUEST, msg);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<?> handleRuntime(RuntimeException ex) {
        String msg = ex.getMessage() == null ? "Unexpected error" : ex.getMessage();
        HttpStatus status = "Forbidden".equalsIgnoreCase(msg) ? HttpStatus.FORBIDDEN : HttpStatus.BAD_REQUEST;
        return ApiResponse.error(status, msg);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleAny(Exception ex) {
        return ApiResponse.error(HttpStatus.INTERNAL_SERVER_ERROR, ex.getMessage() == null ? "Internal server error" : ex.getMessage());
    }
}
