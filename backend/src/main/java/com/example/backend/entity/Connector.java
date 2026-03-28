package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.UUID;

@Entity
@Table(name = "charging_connectors")
@Data
@NoArgsConstructor
public class Connector {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "station_id", nullable = false)
    private Station station;

    @Column(name = "connector_type")
    private String type;

    @Column(nullable = false)
    private String status;

    @Column(name = "power_kw")
    private Double powerKw;
}
