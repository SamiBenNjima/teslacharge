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
public class WhatsAppOtpSender {

    @Value("${app.twilio.sid}")
    private String twilioSid;

    @Value("${app.twilio.auth-token}")
    private String twilioAuthToken;

    @Value("${app.whatsapp.from-number}")
    private String fromNumber;

    @PostConstruct
    public void init() {
        Twilio.init(twilioSid, twilioAuthToken);
    }

    public void sendOtp(String phoneNumber, String otp) {
        System.out.println("=================================================");
        System.out.println("📱 [WHATSAPP] Sending OTP Code: " + otp + " to " + phoneNumber);
        System.out.println("📱 [WHATSAPP] Twilio SID: " + twilioSid);
        System.out.println("📱 [WHATSAPP] From Number: " + fromNumber);
        System.out.println("=================================================");

        try {
            Message message = Message.creator(
                new PhoneNumber("whatsapp:" + phoneNumber),
                new PhoneNumber("whatsapp:" + fromNumber),
                "Votre code de vérification TeslaCharge est : " + otp + ". Valide pour 10 minutes."
            ).create();
            System.out.println("✅ WhatsApp sent successfully! SID: " + message.getSid());
        } catch (Exception e) {
            System.err.println("❌ Failed to send WhatsApp via Twilio: " + e.getMessage());
        }
    }
}
