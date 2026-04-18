package com.example.backend.service;

import com.example.backend.dto.*;
import com.example.backend.entity.*;
import com.example.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final DriverRepository driverRepository;
    private final VehicleRepository vehicleRepository;
    private final DriverVehicleRepository driverVehicleRepository;
    private final OtpService otpService;
    private final NhtsaService nhtsaService;
    private final JwtService jwtService;

    public void sendSignUpOtp(SendOtpRequest request) {
        if (driverRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already registered");
        }
        if (!nhtsaService.validateVin(request.getVin())) {
            throw new RuntimeException("Invalid VIN");
        }
        String channel = (request.getChannel() != null && !request.getChannel().isEmpty()) ? request.getChannel().toUpperCase() : "EMAIL";
        String targetAddress = ("WHATSAPP".equals(channel) || "SMS".equals(channel)) ? request.getPhone() : request.getEmail();
        otpService.generateAndSendOtp(request.getEmail(), targetAddress, channel, "SIGN_UP");
    }

    @Transactional
    public AuthResponse verifySignUpOtp(VerifySignUpRequest request) {
        if (!otpService.verifyOtp(request.getEmail(), "SIGN_UP", request.getOtp())) {
            throw new RuntimeException("Invalid or expired OTP");
        }

        Driver driver = new Driver();
        driver.setEmail(request.getEmail());
        driver.setPhone(request.getPhone());
        driver.setFirstName(request.getFirstName());
        driver.setLastName(request.getLastName());
        driver = driverRepository.save(driver);

        Vehicle vehicle = vehicleRepository.findByVin(request.getVin())
                .orElseGet(() -> {
                    Vehicle v = new Vehicle();
                    v.setVin(request.getVin());
                    v.setModel("Tesla Model 3"); // Default / Mock model
                    return vehicleRepository.save(v);
                });

        DriverVehicle dv = new DriverVehicle();
        dv.setDriver(driver);
        dv.setVehicle(vehicle);
        driverVehicleRepository.save(dv);

        String token = jwtService.generateToken(driver.getId(), driver.getEmail());
        return new AuthResponse(token);
    }

    public void sendSignInOtp(SendOtpRequest request) {
        Driver driver = driverRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Driver not found"));
        
        // Ensure VIN is checked as requested in MOP requirements if provided
        if (request.getVin() != null && !request.getVin().isEmpty()) {
            vehicleRepository.findByVin(request.getVin())
                 .orElseThrow(() -> new RuntimeException("VIN not found in database"));
        }
        
        String channel = (request.getChannel() != null && !request.getChannel().isEmpty()) ? request.getChannel().toUpperCase() : "EMAIL";
        String targetAddress = ("WHATSAPP".equals(channel) || "SMS".equals(channel)) ? driver.getPhone() : driver.getEmail();
        otpService.generateAndSendOtp(request.getEmail(), targetAddress, channel, "SIGN_IN");
    }

    public AuthResponse verifySignInOtp(VerifySignInRequest request) {
        if (!otpService.verifyOtp(request.getEmail(), "SIGN_IN", request.getOtp())) {
            throw new RuntimeException("Invalid or expired OTP");
        }
        Driver driver = driverRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Driver not found"));
        
        String token = jwtService.generateToken(driver.getId(), driver.getEmail());
        return new AuthResponse(token);
    }
}
