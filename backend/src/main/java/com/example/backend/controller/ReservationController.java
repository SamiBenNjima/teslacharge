package com.example.backend.controller;

import com.example.backend.dto.CreateReservationRequest;
import com.example.backend.dto.ReservationResponse;
import com.example.backend.service.ReservationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;

    @PostMapping
    public ResponseEntity<ReservationResponse> createReservation(
            @RequestBody CreateReservationRequest request,
            @AuthenticationPrincipal Jwt jwt) {
        UUID driverId = UUID.fromString(jwt.getSubject());
        ReservationResponse response = reservationService.create(request, driverId);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<ReservationResponse>> getMyReservations(@AuthenticationPrincipal Jwt jwt) {
        UUID driverId = UUID.fromString(jwt.getSubject());
        List<ReservationResponse> reservations = reservationService.getMyReservations(driverId);
        return ResponseEntity.ok(reservations);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReservationResponse> getReservation(
            @PathVariable UUID id,
            @AuthenticationPrincipal Jwt jwt) {
        UUID driverId = UUID.fromString(jwt.getSubject());
        // For now, just return from the list. In a real app, you'd have a separate method
        List<ReservationResponse> reservations = reservationService.getMyReservations(driverId);
        ReservationResponse reservation = reservations.stream()
            .filter(r -> r.getId().equals(id))
            .findFirst()
            .orElseThrow(() -> new IllegalArgumentException("Reservation not found"));
        return ResponseEntity.ok(reservation);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelReservation(
            @PathVariable UUID id,
            @AuthenticationPrincipal Jwt jwt) {
        UUID driverId = UUID.fromString(jwt.getSubject());
        reservationService.cancel(id, driverId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/report")
    public ResponseEntity<Void> reportIssue(
            @PathVariable UUID id,
            @RequestParam String note,
            @AuthenticationPrincipal Jwt jwt) {
        UUID driverId = UUID.fromString(jwt.getSubject());
        reservationService.reportIssue(id, driverId, note);
        return ResponseEntity.noContent().build();
    }
}
