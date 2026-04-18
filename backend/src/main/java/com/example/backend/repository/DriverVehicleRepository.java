package com.example.backend.repository;

import com.example.backend.entity.Driver;
import com.example.backend.entity.DriverVehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface DriverVehicleRepository extends JpaRepository<DriverVehicle, UUID> {
    Optional<DriverVehicle> findByDriverAndIsSelectedTrue(Driver driver);
}
