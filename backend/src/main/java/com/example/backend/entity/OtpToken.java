package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "otp_tokens")
@Data
@NoArgsConstructor
public class OtpToken {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false)
    private String identifier; // email or phone

    @Column(name = "hashed_code", nullable = false)
    private String hashedCode; // bcrypt hash of 6 digit code

    @Column(nullable = false)
    private String type; // 'EMAIL' or 'SMS'

    @Column(nullable = false)
    private String purpose; // 'SIGN_UP' or 'SIGN_IN'

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "is_used", nullable = false)
    private boolean isUsed = false;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}
