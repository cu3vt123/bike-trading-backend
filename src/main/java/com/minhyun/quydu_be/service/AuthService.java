package com.minhyun.quydu_be.service;

import com.minhyun.quydu_be.dto.request.ForgotPasswordRequest;
import com.minhyun.quydu_be.dto.request.LoginRequest;
import com.minhyun.quydu_be.dto.request.RefreshTokenRequest;
import com.minhyun.quydu_be.dto.request.ResetPasswordRequest;
import com.minhyun.quydu_be.dto.request.SignupRequest;
import com.minhyun.quydu_be.dto.response.AuthResponse;
import com.minhyun.quydu_be.dto.response.MeResponse;
import java.util.Map;

public interface AuthService {

    AuthResponse signup(SignupRequest request);

    AuthResponse login(LoginRequest request);

    AuthResponse refresh(RefreshTokenRequest request);

    MeResponse me();

    Map<String, Object> forgotPassword(ForgotPasswordRequest request);

    Map<String, Object> resetPassword(ResetPasswordRequest request);
}
