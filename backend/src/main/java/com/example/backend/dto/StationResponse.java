package com.example.backend.dto;

import lombok.Data;
import java.util.List;
import java.util.UUID;

@Data
public class StationResponse {
    private UUID id;
    private String name;
    private String address;
    private String city;
    private String operator;
    private Integer totalConnectors;
    private Integer availableConnectors;
    private Double latitude;
    private Double longitude;
    private List<ConnectorResponse> connectors;
    private Double distanceKm;
}
