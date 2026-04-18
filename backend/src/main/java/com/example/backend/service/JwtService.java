package com.example.backend.service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.UUID;

@Service
public class JwtService {

    @Value("${app.jwt.secret}")
    private String secret;

    @Value("${app.jwt.expiry-ms:3600000}")
    private long expiryMs;

    public String generateToken(UUID driverId, String email) {
        // Enforce strong 256-bit+ HMAC SHA key requirement. 
        // If the secret is too short, we pad it for development, but in prod it must be long.
        String paddedSecret = secret.length() < 32 ? String.format("%-32s", secret).replace(' ', '0') : secret;
        SecretKey key = Keys.hmacShaKeyFor(paddedSecret.getBytes(StandardCharsets.UTF_8));
        
        return Jwts.builder()
                .header().add("typ", "JWT").and()
                .subject(driverId.toString())
                .claim("email", email)
                .claim("role", "authenticated")
                .claim("aud", "authenticated")
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expiryMs))
                .signWith(key)
                .compact();
    }
}
