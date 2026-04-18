package com.example.backend.config;

import com.example.backend.entity.*;
import com.example.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import java.time.LocalDateTime;

@Configuration
@Profile("dev")
@RequiredArgsConstructor
public class DatabaseSeeder {

    @Bean
    CommandLineRunner initDatabase(DriverRepository driverRepo, VehicleRepository vehicleRepo, DriverVehicleRepository dvRepo) {
        return args -> {
            if (driverRepo.count() == 0) {
                // Ahmed
                seedUser(driverRepo, vehicleRepo, dvRepo, "Ahmed", "Teslari", "ahmed@teslacharge.tn", "+21698000002", "5YJ3E1EA0LF000002");
                // Emna
                seedUser(driverRepo, vehicleRepo, dvRepo, "Emna", "Teslari", "emna@teslacharge.tn", "+21698000005", "5YJXCAE20LF000001");
                // Lina
                seedUser(driverRepo, vehicleRepo, dvRepo, "Lina", "Teslari", "lina@teslacharge.tn", "+21698000003", "7SAYGDEF0NF000001");
                // Sami
                seedUser(driverRepo, vehicleRepo, dvRepo, "Sami", "Ben", "sami@teslacharge.tn", "+21698000001", "5YJ3E1EA0LF000001");
                // Youssef
                seedUser(driverRepo, vehicleRepo, dvRepo, "Youssef", "Teslari", "youssef@teslacharge.tn", "+21698000004", "7SAYGDEF0NF000002");
                System.out.println("✅ Mock Database Seeded from Supabase Snapshot!");
            }
        };
    }

    private void seedUser(DriverRepository dRepo, VehicleRepository vRepo, DriverVehicleRepository dvRepo, 
                          String fName, String lName, String email, String phone, String vin) {
        Driver driver = new Driver();
        driver.setFirstName(fName);
        driver.setLastName(lName);
        driver.setEmail(email);
        driver.setPhone(phone);
        driver.setCreatedAt(LocalDateTime.now());
        driver = dRepo.save(driver);

        Vehicle vehicle = new Vehicle();
        vehicle.setVin(vin);
        vehicle.setModel("Tesla Model 3/Y");
        vehicle.setYear(2023);
        vehicle = vRepo.save(vehicle);

        DriverVehicle dv = new DriverVehicle();
        dv.setDriver(driver);
        dv.setVehicle(vehicle);
        dv.setSelected(true);
        dvRepo.save(dv);
    }
}
