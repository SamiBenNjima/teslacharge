package com.example.backend.repository;

import com.example.backend.entity.Station;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface StationRepository extends JpaRepository<Station, UUID> {
    List<Station> findByCity(String city);

    @Query(value = """
        SELECT * FROM stations s
        WHERE s.is_operational = true
        AND (6371 * acos(cos(radians(:lat)) * cos(radians(s.latitude)) *
            cos(radians(s.longitude) - radians(:lng)) +
            sin(radians(:lat)) * sin(radians(s.latitude)))) <= :radiusKm
        ORDER BY (6371 * acos(cos(radians(:lat)) * cos(radians(s.latitude)) *
            cos(radians(s.longitude) - radians(:lng)) +
            sin(radians(:lat)) * sin(radians(s.latitude)))) ASC
        LIMIT :limit
        """, nativeQuery = true)
    List<Station> findNearby(@Param("lat") double latitude,
                           @Param("lng") double longitude,
                           @Param("radiusKm") double radiusKm,
                           @Param("limit") int limit);
}
