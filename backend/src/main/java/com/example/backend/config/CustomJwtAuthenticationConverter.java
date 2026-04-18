package com.example.backend.config;

import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;

import java.util.Collections;

@Component
public class CustomJwtAuthenticationConverter implements Converter<Jwt, AbstractAuthenticationToken> {

    @Override
    public AbstractAuthenticationToken convert(Jwt jwt) {
        // Extract subject (driver ID) from JWT
        String subject = jwt.getSubject();

        // For now, give a default role. In a real app, you'd extract roles from JWT claims
        return new JwtAuthenticationToken(jwt, Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER")));
    }
}
