package com.example.backend.repository;

import com.example.backend.entity.Connector;
import com.example.backend.entity.Station;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface ConnectorRepository extends JpaRepository<Connector, UUID> {
    List<Connector> findByStation(Station station);
    List<Connector> findByStationIdAndStatus(UUID stationId, String status);
}
