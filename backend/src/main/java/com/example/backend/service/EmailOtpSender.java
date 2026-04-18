package com.example.backend.service;

import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailOtpSender {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.enabled:true}")
    private boolean mailEnabled;

    public void sendOtp(String email, String otp) throws MessagingException {
        // For development/testing: log OTP to console and file
        String logMessage = String.format("=================================================\n📧 [EMAIL] OTP sent to: %s\n📧 [EMAIL] OTP Code: %s\n📧 [EMAIL] Valid for 10 minutes\n=================================================\n", email, otp);
        System.out.println(logMessage);

        // Also write to a file for easy access
        try {
            java.nio.file.Files.write(java.nio.file.Paths.get("otp_log.txt"), logMessage.getBytes(), java.nio.file.StandardOpenOption.CREATE, java.nio.file.StandardOpenOption.APPEND);
        } catch (Exception e) {
            System.err.println("Failed to write OTP to file: " + e.getMessage());
        }

        // Send actual email only if enabled
        if (mailEnabled) {
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setFrom("chtiwijoo@gmail.com");
                message.setTo(email);
                message.setSubject("Your TeslaCharge OTP Code");
                message.setText("Your verification code is: " + otp + "\n\nValid for 10 minutes");
                mailSender.send(message);
            } catch (Exception e) {
                System.err.println("❌ SMTP Error: Authentication failed. Please check your 'spring.mail.username' and 'spring.mail.password' (use an App Password for Gmail) in application-dev.yml.");
                // Re-throw or handle as needed, here we just log it as OtpService will catch it
                throw e;
            }
        } else {
            System.out.println("ℹ️ Actual email sending is DISABLED (spring.mail.enabled=false). Skip SMTP delivery.");
        }

    }
}
