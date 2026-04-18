package com.example.backend.service;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;

@Service
@RequiredArgsConstructor
public class SmsOtpSender {

    @Value("${app.twilio.sid}")
    private String twilioSid;

    @Value("${app.twilio.auth-token}")
    private String twilioAuthToken;

    @Value("${app.sms.from-number}")
    private String fromNumber;

    @PostConstruct
    public void init() {
        // Twilio.init is called in WhatsAppOtpSender too, but redundancy is fine as it's static
        Twilio.init(twilioSid, twilioAuthToken);
    }

    public void sendOtp(String phoneNumber, String otp) {
        System.out.println("=================================================");
        System.out.println("📱 [SMS] Sending OTP Code: " + otp + " to " + phoneNumber);
        System.out.println("📱 [SMS] From Number: " + fromNumber);
        System.out.println("=================================================");

        try {
            Message message = Message.creator(
                new PhoneNumber(phoneNumber),
                new PhoneNumber(fromNumber),
                "Votre code de vérification TeslaCharge est : " + otp + ". Valide pour 10 minutes."
            ).create();
            System.out.println("✅ SMS sent successfully! SID: " + message.getSid());
        } catch (Exception e) {
            System.err.println("❌ Failed to send SMS via Twilio: " + e.getMessage());
        }
    }
}
