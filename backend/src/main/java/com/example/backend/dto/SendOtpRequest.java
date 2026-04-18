package com.example.backend.dto;

import lombok.Data;

@Data
public class SendOtpRequest {
    private String email;
    private String phone;
    private String vin;
    private String channel;
}
