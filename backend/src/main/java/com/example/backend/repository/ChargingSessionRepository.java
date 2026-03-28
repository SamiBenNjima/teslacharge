package com.example.backend.repository;

import com.example.backend.entity.ChargingSession;
import com.example.backend.entity.Driver;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface ChargingSessionRepository extends JpaRepository<ChargingSession, UUID> {
    List<ChargingSession> findByDriver(Driver driver);
}
