package com.example.backend.repository;

import com.example.backend.entity.OtpToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface OtpTokenRepository extends JpaRepository<OtpToken, UUID> {
    
    @Query("SELECT o FROM OtpToken o WHERE o.identifier = :identifier AND o.purpose = :purpose AND o.isUsed = false AND o.expiresAt > CURRENT_TIMESTAMP ORDER BY o.createdAt DESC LIMIT 1")
    Optional<OtpToken> findLatestValidToken(@Param("identifier") String identifier, @Param("purpose") String purpose);
}
