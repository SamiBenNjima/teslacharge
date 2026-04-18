package com.example.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class CreateReservationRequest {
    private UUID stationId;
    private UUID connectorId;
    private LocalDateTime scheduledStart;
    private LocalDateTime scheduledEnd;
}
