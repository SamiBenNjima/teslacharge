package com.example.backend.service;

import com.example.backend.entity.OtpToken;
import com.example.backend.repository.OtpTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class OtpService {

    private final OtpTokenRepository otpTokenRepository;
    private final EmailOtpSender emailOtpSender;
    private final WhatsAppOtpSender whatsAppOtpSender;
    private final SmsOtpSender smsOtpSender;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public void generateAndSendOtp(String identifier, String targetAddress, String type, String purpose) {
        String code = String.format("%06d", new Random().nextInt(999999));

        OtpToken token = new OtpToken();
        token.setIdentifier(identifier);
        token.setHashedCode(passwordEncoder.encode(code));
        token.setType(type);
        token.setPurpose(purpose);
        token.setExpiresAt(LocalDateTime.now().plusMinutes(10));
        otpTokenRepository.save(token);

        // Send OTP based on type
        try {
            if ("EMAIL".equals(type)) {
                emailOtpSender.sendOtp(targetAddress, code);
                System.out.println("=================================================");
                System.out.println("📧 [EMAIL] OTP sent to: " + targetAddress + " (Code: " + code + ") for identifier: " + identifier);
                System.out.println("=================================================");
            } else if ("WHATSAPP".equals(type)) {
                whatsAppOtpSender.sendOtp(targetAddress, code);
                System.out.println("=================================================");
                System.out.println("📱 [WHATSAPP] OTP sent to: " + targetAddress + " (Code: " + code + ") for identifier: " + identifier);
                System.out.println("=================================================");
            } else if ("SMS".equals(type)) {
                // Send via BOTH WhatsApp and SMS as requested
                whatsAppOtpSender.sendOtp(targetAddress, code);
                smsOtpSender.sendOtp(targetAddress, code);
                System.out.println("=================================================");
                System.out.println("📱 [DUAL SMS/WA] OTP sent to: " + targetAddress + " (Code: " + code + ") for identifier: " + identifier);
                System.out.println("=================================================");
            }
        } catch (Exception e) {
            System.err.println("❌ Failed to send OTP: " + e.getMessage());
            // In production, you might want to throw an exception or handle it differently
        }
    }

    public boolean verifyOtp(String identifier, String purpose, String rawCode) {
        Optional<OtpToken> optToken = otpTokenRepository.findLatestValidToken(identifier, purpose);
        if (optToken.isPresent()) {
            OtpToken token = optToken.get();
            if (passwordEncoder.matches(rawCode, token.getHashedCode())) {
                token.setUsed(true);
                otpTokenRepository.save(token);
                return true;
            }
        }
        return false;
    }
}
