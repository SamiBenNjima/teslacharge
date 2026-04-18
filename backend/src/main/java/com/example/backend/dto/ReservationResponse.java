package com.example.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class ReservationResponse {
    private UUID id;
    private UUID stationId;
    private String stationName;
    private UUID connectorId;
    private String connectorType;
    private UUID vehicleId;
    private String vehicleModel;
    private LocalDateTime scheduledStart;
    private LocalDateTime scheduledEnd;
    private String status;
}
