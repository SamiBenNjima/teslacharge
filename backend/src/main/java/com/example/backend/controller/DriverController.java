package com.example.backend.controller;

import com.example.backend.entity.Driver;
import com.example.backend.service.DriverService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/drivers")
@RequiredArgsConstructor
public class DriverController {
    private final DriverService driverService;

    @GetMapping
    public List<Driver> getAllDrivers() {
        return driverService.getAllDrivers();
    }

    @GetMapping("/{id}")
    public Driver getDriverById(@PathVariable UUID id) {
        return driverService.getDriverById(id);
    }

    @GetMapping("/email/{email}")
    public Driver getDriverByEmail(@PathVariable String email) {
        return driverService.getDriverByEmail(email);
    }
}
