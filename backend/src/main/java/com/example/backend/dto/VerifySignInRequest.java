package com.example.backend.dto;

import lombok.Data;

@Data
public class VerifySignInRequest {
    private String email;
    private String otp;
}
