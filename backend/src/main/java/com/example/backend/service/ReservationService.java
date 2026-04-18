package com.example.backend.service;

import com.example.backend.dto.CreateReservationRequest;
import com.example.backend.dto.ReservationResponse;
import com.example.backend.entity.*;
import com.example.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final DriverRepository driverRepository;
    private final StationRepository stationRepository;
    private final ConnectorRepository connectorRepository;
    private final DriverVehicleRepository driverVehicleRepository;

    public ReservationResponse create(CreateReservationRequest request, UUID driverId) {
        // Validate time window
        if (request.getScheduledStart().isAfter(request.getScheduledEnd()) ||
            Duration.between(request.getScheduledStart(), request.getScheduledEnd()).toMinutes() < 15) {
            throw new IllegalArgumentException("Invalid time slot: minimum 15 minutes required");
        }

        // Get entities
        Driver driver = driverRepository.findById(driverId)
            .orElseThrow(() -> new IllegalArgumentException("Driver not found"));
        Station station = stationRepository.findById(request.getStationId())
            .orElseThrow(() -> new IllegalArgumentException("Station not found"));
        Connector connector = connectorRepository.findById(request.getConnectorId())
            .orElseThrow(() -> new IllegalArgumentException("Connector not found"));

        // Check connector belongs to station
        if (!connector.getStation().getId().equals(station.getId())) {
            throw new IllegalArgumentException("Connector does not belong to the specified station");
        }

        // Check for conflicts
        if (reservationRepository.hasConflict(connector, request.getScheduledStart(), request.getScheduledEnd())) {
            throw new IllegalArgumentException("Time slot is not available");
        }

        // Get driver's selected vehicle
        Vehicle vehicle = driverVehicleRepository.findByDriverAndIsSelectedTrue(driver)
            .map(DriverVehicle::getVehicle)
            .orElseThrow(() -> new IllegalArgumentException("No selected vehicle found"));

        // Create reservation
        Reservation reservation = new Reservation();
        reservation.setDriver(driver);
        reservation.setStation(station);
        reservation.setConnector(connector);
        reservation.setVehicle(vehicle);
        reservation.setScheduledStart(request.getScheduledStart());
        reservation.setScheduledEnd(request.getScheduledEnd());
        reservation.setStatus("CONFIRMED");

        Reservation saved = reservationRepository.save(reservation);
        return mapToResponse(saved);
    }

    public List<ReservationResponse> getMyReservations(UUID driverId) {
        Driver driver = driverRepository.findById(driverId)
            .orElseThrow(() -> new IllegalArgumentException("Driver not found"));

        return reservationRepository.findByDriverOrderByScheduledStartDesc(driver)
            .stream()
            .map(this::mapToResponse)
            .collect(Collectors.toList());
    }

    public void cancel(UUID reservationId, UUID driverId) {
        Reservation reservation = reservationRepository.findById(reservationId)
            .orElseThrow(() -> new IllegalArgumentException("Reservation not found"));

        if (!reservation.getDriver().getId().equals(driverId)) {
            throw new IllegalArgumentException("Access denied");
        }

        if ("ACTIVE".equals(reservation.getStatus())) {
            throw new IllegalArgumentException("Cannot cancel active session");
        }

        reservation.setStatus("CANCELLED");
        reservationRepository.save(reservation);
    }

    public void reportIssue(UUID reservationId, UUID driverId, String note) {
        Reservation reservation = reservationRepository.findById(reservationId)
            .orElseThrow(() -> new IllegalArgumentException("Reservation not found"));

        if (!reservation.getDriver().getId().equals(driverId)) {
            throw new IllegalArgumentException("Access denied");
        }

        // For now, just log the issue. In a real app, you'd save it to a database
        System.out.println("Issue reported for reservation " + reservationId + ": " + note);
    }

    private ReservationResponse mapToResponse(Reservation reservation) {
        ReservationResponse response = new ReservationResponse();
        response.setId(reservation.getId());
        response.setStationId(reservation.getStation().getId());
        response.setStationName(reservation.getStation().getName());
        response.setConnectorId(reservation.getConnector().getId());
        response.setConnectorType(reservation.getConnector().getType());
        if (reservation.getVehicle() != null) {
            response.setVehicleId(reservation.getVehicle().getId());
            response.setVehicleModel(reservation.getVehicle().getModel());
        }
        response.setScheduledStart(reservation.getScheduledStart());
        response.setScheduledEnd(reservation.getScheduledEnd());
        response.setStatus(reservation.getStatus());
        return response;
    }
}
