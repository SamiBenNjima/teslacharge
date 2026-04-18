package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

@Entity
@Table(name = "stations")
@Data
@NoArgsConstructor
public class Station {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String address;

    @Column(nullable = false)
    private String city;

    private String operator;

    @Column(name = "total_connectors")
    private Integer totalConnectors;

    @Column(name = "available_connectors")
    private Integer availableConnectors;

    @Column(name = "latitude", nullable = false)
    private Double latitude;

    @Column(name = "longitude", nullable = false)
    private Double longitude;

    @Column(name = "is_operational", nullable = false)
    private Boolean isOperational = true;
}
