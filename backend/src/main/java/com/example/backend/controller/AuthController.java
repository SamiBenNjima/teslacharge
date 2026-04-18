package com.example.backend.controller;

import com.example.backend.dto.*;
import com.example.backend.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // Permit Vite frontend requests
public class AuthController {

    private final AuthService authService;

    @PostMapping("/signup/send-otp")
    public ResponseEntity<?> sendSignUpOtp(@RequestBody SendOtpRequest request) {
        try {
            authService.sendSignUpOtp(request);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/signup/verify")
    public ResponseEntity<?> verifySignUpOtp(@RequestBody VerifySignUpRequest request) {
        try {
            return ResponseEntity.ok(authService.verifySignUpOtp(request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/signin/send-otp")
    public ResponseEntity<?> sendSignInOtp(@RequestBody SendOtpRequest request) {
        try {
            authService.sendSignInOtp(request);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/signin/verify")
    public ResponseEntity<?> verifySignInOtp(@RequestBody VerifySignInRequest request) {
        try {
            return ResponseEntity.ok(authService.verifySignInOtp(request));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
