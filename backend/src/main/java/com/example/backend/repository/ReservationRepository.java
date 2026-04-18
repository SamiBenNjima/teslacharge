package com.example.backend.repository;

import com.example.backend.entity.Reservation;
import com.example.backend.entity.Driver;
import com.example.backend.entity.Connector;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface ReservationRepository extends JpaRepository<Reservation, UUID> {
    List<Reservation> findByDriver(Driver driver);
    List<Reservation> findByStatus(String status);

    @Query("SELECT COUNT(r) > 0 FROM Reservation r WHERE r.connector = :connector " +
           "AND r.status NOT IN ('CANCELLED', 'NO_SHOW') " +
           "AND ((r.scheduledStart < :end AND r.scheduledEnd > :start))")
    boolean hasConflict(@Param("connector") Connector connector,
                       @Param("start") LocalDateTime start,
                       @Param("end") LocalDateTime end);

    List<Reservation> findByDriverOrderByScheduledStartDesc(Driver driver);
}
