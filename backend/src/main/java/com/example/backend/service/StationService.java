package com.example.backend.service;

import com.example.backend.dto.ConnectorResponse;
import com.example.backend.dto.StationResponse;
import com.example.backend.entity.Station;
import com.example.backend.repository.ConnectorRepository;
import com.example.backend.repository.StationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StationService {

    private final StationRepository stationRepository;
    private final ConnectorRepository connectorRepository;

    public List<StationResponse> getNearby(double lat, double lng, double radiusKm, int limit) {
        List<Station> stations = stationRepository.findNearby(lat, lng, radiusKm, limit != 0 ? limit : 50);
        return stations.stream()
            .map(station -> {
                StationResponse response = mapToResponse(station);
                // Calculate distance (simplified, since we already filtered by distance in query)
                response.setDistanceKm(calculateDistance(lat, lng, station.getLatitude(), station.getLongitude()));
                return response;
            })
            .collect(Collectors.toList());
    }

    public StationResponse getStationDetails(UUID stationId) {
        Station station = stationRepository.findById(stationId)
            .orElseThrow(() -> new IllegalArgumentException("Station not found"));
        return mapToResponse(station);
    }

    public List<ConnectorResponse> getAvailableConnectors(UUID stationId) {
        return connectorRepository.findByStationIdAndStatus(stationId, "AVAILABLE")
            .stream()
            .map(this::mapConnectorToResponse)
            .collect(Collectors.toList());
    }

    private StationResponse mapToResponse(Station station) {
        StationResponse response = new StationResponse();
        response.setId(station.getId());
        response.setName(station.getName());
        response.setAddress(station.getAddress());
        response.setCity(station.getCity());
        response.setOperator(station.getOperator());
        response.setTotalConnectors(station.getTotalConnectors());
        response.setAvailableConnectors(station.getAvailableConnectors());
        response.setLatitude(station.getLatitude());
        response.setLongitude(station.getLongitude());
        response.setConnectors(getAvailableConnectors(station.getId()));
        return response;
    }

    private ConnectorResponse mapConnectorToResponse(com.example.backend.entity.Connector connector) {
        ConnectorResponse response = new ConnectorResponse();
        response.setId(connector.getId());
        response.setType(connector.getType());
        response.setStatus(connector.getStatus());
        response.setPowerKw(connector.getPowerKw());
        return response;
    }

    private double calculateDistance(double lat1, double lng1, double lat2, double lng2) {
        final int R = 6371; // Radius of the earth in km

        double latDistance = Math.toRadians(lat2 - lat1);
        double lngDistance = Math.toRadians(lng2 - lng1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
            + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
            * Math.sin(lngDistance / 2) * Math.sin(lngDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        double distance = R * c;

        return Math.round(distance * 100.0) / 100.0; // Round to 2 decimal places
    }
}
