package com.example.backend.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class ConnectorResponse {
    private UUID id;
    private String type;
    private String status;
    private Double powerKw;
}
