package com.example.backend.controller;

import com.example.backend.dto.ConnectorResponse;
import com.example.backend.dto.StationResponse;
import com.example.backend.service.StationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/stations")
@RequiredArgsConstructor
public class StationController {

    private final StationService stationService;

    @GetMapping("/nearby")
    public ResponseEntity<List<StationResponse>> getNearbyStations(
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam(defaultValue = "10") double radius,
            @RequestParam(defaultValue = "50") int limit) {
        List<StationResponse> stations = stationService.getNearby(lat, lng, radius, limit);
        return ResponseEntity.ok(stations);
    }

    @GetMapping("/{id}")
    public ResponseEntity<StationResponse> getStation(@PathVariable UUID id) {
        StationResponse station = stationService.getStationDetails(id);
        return ResponseEntity.ok(station);
    }

    @GetMapping("/{id}/connectors")
    public ResponseEntity<List<ConnectorResponse>> getAvailableConnectors(@PathVariable UUID id) {
        List<ConnectorResponse> connectors = stationService.getAvailableConnectors(id);
        return ResponseEntity.ok(connectors);
    }

    // Placeholder for availability calendar - would need more implementation
    @GetMapping("/{id}/availability")
    public ResponseEntity<String> getAvailabilityCalendar(
            @PathVariable UUID id,
            @RequestParam LocalDate date) {
        // For now, return a placeholder
        return ResponseEntity.ok("Availability calendar for station " + id + " on " + date);
    }
}
