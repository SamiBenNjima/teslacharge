package com.example.backend.repository;

import com.example.backend.entity.Reservation;
import com.example.backend.entity.Driver;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface ReservationRepository extends JpaRepository<Reservation, UUID> {
    List<Reservation> findByDriver(Driver driver);
    List<Reservation> findByStatus(String status);
}
