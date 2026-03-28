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

    // Skipping PostGIS geometry for now (requires spatial extensions)
    // Map amenities as JSONB if using pg-dialect-jsonb or similar, 
    // but for now we'll just omit or map to String.
}
