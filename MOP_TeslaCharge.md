# METHOD OF PROCEDURE (MOP)
## TeslaCharge — Mobile App for EV Charging Station Reservation Management
**Version:** 1.0.0  
**Date:** 2026-03-23  
**Stack:** Angular (Ionic/Capacitor) · Spring Boot · Supabase (PostgreSQL + Auth)  
**Classification:** Internal Development Reference

---

## TABLE OF CONTENTS

1. [Project Overview](#1-project-overview)
2. [Architecture Overview](#2-architecture-overview)
3. [Technology Stack](#3-technology-stack)
4. [Environment Setup](#4-environment-setup)
5. [Database Design (Supabase / PostgreSQL)](#5-database-design)
6. [Backend — Spring Boot](#6-backend--spring-boot)
7. [Frontend — Angular (Ionic)](#7-frontend--angular-ionic)
8. [Authentication & OTP Flow](#8-authentication--otp-flow)
9. [Sequence Diagrams (Textual)](#9-sequence-diagrams)
10. [API Contract (REST)](#10-api-contract-rest)
11. [Business Rules & Validation](#11-business-rules--validation)
12. [Security Strategy](#12-security-strategy)
13. [Testing Strategy](#13-testing-strategy)
14. [Deployment Procedure](#14-deployment-procedure)
15. [Error Handling & Logging](#15-error-handling--logging)
16. [Rollback Plan](#16-rollback-plan)

---

## 1. PROJECT OVERVIEW

### 1.1 Purpose
TeslaCharge is a cross-platform mobile application enabling Tesla vehicle owners (or authorized drivers) to:
- Authenticate securely via OTP (email / WhatsApp)
- Locate nearby Tesla Supercharger / compatible charging stations on an interactive map
- Schedule, manage, and cancel charging reservations
- Manage one or multiple vehicles under a single driver profile
- Support car ownership transfer (sale scenario)

### 1.2 Actors
| Actor | Description |
|---|---|
| **Driver** | Any person driving a Tesla vehicle (may or may not be the legal owner) |
| **Owner** | Legal owner of a vehicle (VIN-linked) |
| **System** | Backend services handling logic, OTP, and booking |
| **Station** | Physical charging station entity in the DB |

### 1.3 Scope
This MOP covers the full lifecycle: setup → development → testing → deployment.

---

## 2. ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────────────┐
│                       MOBILE CLIENT                             │
│          Angular + Ionic + Capacitor (iOS / Android / PWA)      │
│  ┌──────────┐ ┌──────────┐ ┌──────────────┐ ┌──────────────┐   │
│  │  Home    │ │   Map    │ │ Reservations │ │   Profile    │   │
│  │Dashboard │ │ + Search │ │  + Schedule  │ │ + Cars Mgmt  │   │
│  └──────────┘ └──────────┘ └──────────────┘ └──────────────┘   │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTPS / JWT
┌────────────────────────▼────────────────────────────────────────┐
│                    SPRING BOOT API GATEWAY                      │
│              (REST · JWT Filter · CORS · Rate Limiting)         │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────────┐ │
│  │  Auth Module │ │ Booking Mod. │ │    Station Module         │ │
│  │  OTP Service │ │ Sched. Logic │ │    Map / Search           │ │
│  └──────┬───────┘ └──────┬───────┘ └────────────┬─────────────┘ │
│         │                │                       │               │
│  ┌──────▼────────────────▼───────────────────────▼─────────────┐ │
│  │               Vehicle & Profile Module                       │ │
│  │    VIN Validation · Ownership Transfer · Driver Link         │ │
│  └──────────────────────────────────────────────────────────────┘ │
└────────────────────────┬────────────────────────────────────────┘
                         │ JDBC / Supabase Client
┌────────────────────────▼────────────────────────────────────────┐
│                  SUPABASE (PostgreSQL + Auth)                    │
│   drivers · vehicles · ownership · stations · reservations      │
│   otp_tokens · audit_logs · charging_sessions                   │
└─────────────────────────────────────────────────────────────────┘
          │                              │
   ┌──────▼──────┐               ┌───────▼──────┐
   │  WhatsApp   │               │  Email SMTP  │
   │  Business   │               │  (OTP Send)  │
   │  API (OTP)  │               └──────────────┘
   └─────────────┘
```

### 2.1 Design Principles
- **Separation of Concerns**: Angular handles UI state; Spring Boot handles all business logic.
- **Stateless Backend**: JWT tokens; no server-side session.
- **Supabase as BaaS**: PostgreSQL for relational data, Supabase Auth optionally for row-level security.
- **Custom OTP**: Spring Boot generates and delivers OTP independently (not relying on Supabase Auth OTP).
- **Offline-first**: Ionic caches last known reservation state locally.

---

## 3. TECHNOLOGY STACK

| Layer | Technology | Version | Role |
|---|---|---|---|
| Mobile Frontend | Angular | 17+ | SPA Framework |
| Mobile Shell | Ionic Framework | 7+ | UI Components + Native APIs |
| Native Bridge | Capacitor | 5+ | iOS / Android packaging |
| Maps | Google Maps JS SDK / Mapbox | Latest | Station map + geolocation |
| Backend | Spring Boot | 3.2+ | REST API |
| ORM | Spring Data JPA + Hibernate | 3.x | DB access |
| Security | Spring Security + JJWT | Latest | JWT auth |
| Database | Supabase (PostgreSQL 15) | — | Relational DB |
| Auth Service | Supabase Auth (base) + custom OTP | — | Identity management |
| OTP Delivery | Twilio / WhatsApp Business API | — | WhatsApp OTP |
| OTP Email | JavaMailSender (Spring) + SMTP | — | Email OTP |
| Cache | Redis (optional) | 7+ | OTP token cache / rate limit |
| Containerization | Docker + Docker Compose | — | Local dev & prod |
| CI/CD | GitHub Actions | — | Automated pipeline |
| VIN Validation | NHTSA API (free) or custom DB | — | Vehicle identity check |

---

## 4. ENVIRONMENT SETUP

### 4.1 Prerequisites
```bash
# Required tools
node >= 20.x
npm >= 10.x
java >= 21 (LTS)
maven >= 3.9
docker >= 24.x
docker-compose >= 2.x
ionic cli >= 7.x        # npm install -g @ionic/cli
angular cli >= 17.x     # npm install -g @angular/cli
```

### 4.2 Project Structure
```
teslacharge/
├── frontend/                        # Angular + Ionic app
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/               # Guards, interceptors, services
│   │   │   │   ├── guards/
│   │   │   │   │   ├── auth.guard.ts
│   │   │   │   │   └── onboarding.guard.ts
│   │   │   │   ├── interceptors/
│   │   │   │   │   ├── jwt.interceptor.ts
│   │   │   │   │   └── error.interceptor.ts
│   │   │   │   └── services/
│   │   │   │       ├── auth.service.ts
│   │   │   │       ├── otp.service.ts
│   │   │   │       └── storage.service.ts
│   │   │   ├── shared/             # Reusable components, pipes, models
│   │   │   │   ├── components/
│   │   │   │   ├── models/
│   │   │   │   │   ├── driver.model.ts
│   │   │   │   │   ├── vehicle.model.ts
│   │   │   │   │   ├── station.model.ts
│   │   │   │   │   └── reservation.model.ts
│   │   │   │   └── pipes/
│   │   │   ├── features/
│   │   │   │   ├── auth/
│   │   │   │   │   ├── sign-in/
│   │   │   │   │   ├── sign-up/
│   │   │   │   │   └── otp-verify/
│   │   │   │   ├── home/           # Tab 1 — Dashboard
│   │   │   │   ├── map/            # Tab 2 — Map + Station search
│   │   │   │   ├── reservations/   # Tab 3 — Booking management
│   │   │   │   └── profile/        # Tab 4 — Profile + Cars
│   │   │   └── app-routing.module.ts
│   │   ├── assets/
│   │   └── environments/
│   │       ├── environment.ts
│   │       └── environment.prod.ts
│   ├── capacitor.config.ts
│   └── angular.json
│
├── backend/                         # Spring Boot
│   ├── src/main/java/com/teslacharge/
│   │   ├── TeslaChargeApplication.java
│   │   ├── config/
│   │   │   ├── SecurityConfig.java
│   │   │   ├── JwtConfig.java
│   │   │   ├── CorsConfig.java
│   │   │   └── SupabaseConfig.java
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   │   ├── controller/AuthController.java
│   │   │   │   ├── service/AuthService.java
│   │   │   │   ├── service/OtpService.java
│   │   │   │   ├── service/JwtService.java
│   │   │   │   └── dto/
│   │   │   ├── driver/
│   │   │   │   ├── controller/DriverController.java
│   │   │   │   ├── service/DriverService.java
│   │   │   │   ├── repository/DriverRepository.java
│   │   │   │   ├── entity/Driver.java
│   │   │   │   └── dto/
│   │   │   ├── vehicle/
│   │   │   │   ├── controller/VehicleController.java
│   │   │   │   ├── service/VehicleService.java
│   │   │   │   ├── service/VinValidationService.java
│   │   │   │   ├── repository/VehicleRepository.java
│   │   │   │   ├── entity/Vehicle.java
│   │   │   │   ├── entity/VehicleOwnership.java
│   │   │   │   └── dto/
│   │   │   ├── station/
│   │   │   │   ├── controller/StationController.java
│   │   │   │   ├── service/StationService.java
│   │   │   │   ├── repository/StationRepository.java
│   │   │   │   ├── entity/Station.java
│   │   │   │   └── dto/
│   │   │   └── reservation/
│   │   │       ├── controller/ReservationController.java
│   │   │       ├── service/ReservationService.java
│   │   │       ├── repository/ReservationRepository.java
│   │   │       ├── entity/Reservation.java
│   │   │       └── dto/
│   │   └── shared/
│   │       ├── exception/
│   │       │   ├── GlobalExceptionHandler.java
│   │       │   └── CustomExceptions.java
│   │       └── util/
│   ├── src/main/resources/
│   │   ├── application.yml
│   │   ├── application-dev.yml
│   │   └── application-prod.yml
│   └── pom.xml
│
├── infra/
│   ├── docker-compose.yml
│   ├── docker-compose.prod.yml
│   └── supabase/
│       ├── migrations/
│       │   ├── 001_initial_schema.sql
│       │   ├── 002_rls_policies.sql
│       │   └── 003_seed_stations.sql
│       └── schema.sql
│
├── .github/
│   └── workflows/
│       ├── backend-ci.yml
│       └── frontend-ci.yml
│
└── README.md
```

### 4.3 Local Dev Bootstrap
```bash
# 1. Clone the repo
git clone https://github.com/your-org/teslacharge.git
cd teslacharge

# 2. Start infrastructure (Supabase local emulator + Redis)
cd infra
docker-compose up -d

# 3. Run backend
cd ../backend
cp src/main/resources/application-dev.yml.example src/main/resources/application-dev.yml
# Fill in secrets (see Section 4.4)
mvn spring-boot:run -Dspring-boot.run.profiles=dev

# 4. Run frontend
cd ../frontend
npm install
ionic serve            # Browser dev
ionic cap run android  # Android device/emulator
ionic cap run ios      # iOS device/simulator
```

### 4.4 Required Environment Variables

**Backend (`application-dev.yml`)**
```yaml
spring:
  datasource:
    url: ${SUPABASE_DB_URL}           # jdbc:postgresql://...
    username: ${SUPABASE_DB_USER}
    password: ${SUPABASE_DB_PASSWORD}
  mail:
    host: ${SMTP_HOST}
    port: ${SMTP_PORT}
    username: ${SMTP_USER}
    password: ${SMTP_PASS}

app:
  jwt:
    secret: ${JWT_SECRET}            # Min 256-bit random string
    expiry-ms: 3600000               # 1h access token
    refresh-expiry-ms: 604800000     # 7d refresh token
  otp:
    length: 6
    expiry-minutes: 10
    max-attempts: 3
  whatsapp:
    api-url: ${WHATSAPP_API_URL}
    token: ${WHATSAPP_TOKEN}
    from-number: ${WHATSAPP_FROM}
  vin:
    validation-api: https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin
```

**Frontend (`environment.ts`)**
```typescript
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:8080/api/v1',
  supabaseUrl: 'YOUR_SUPABASE_URL',
  supabaseAnonKey: 'YOUR_SUPABASE_ANON_KEY',
  googleMapsApiKey: 'YOUR_GOOGLE_MAPS_KEY',
  otpResendCooldownSeconds: 60,
};
```

---

## 5. DATABASE DESIGN

### 5.1 ERD Summary
```
drivers ──< driver_vehicles >── vehicles
              (active_vehicle flag)

vehicles ──< vehicle_ownerships >── drivers
              (ownership history: sold_at nullable)

drivers ──< reservations >── stations
              (via active vehicle)

stations ──< charging_connectors
stations ──< charging_sessions

otp_tokens (linked to drivers.id OR pre-registration email/phone)
audit_logs
```

### 5.2 Migration 001 — Core Schema

```sql
-- ============================================================
-- EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";  -- for geo queries

-- ============================================================
-- DRIVERS (physical persons / users of the app)
-- ============================================================
CREATE TABLE drivers (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email           VARCHAR(255) UNIQUE NOT NULL,
    phone           VARCHAR(20)  UNIQUE NOT NULL,   -- international format +CCXXXXXXXXX
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100) NOT NULL,
    birth_date      DATE,
    gender          VARCHAR(10) CHECK (gender IN ('MALE','FEMALE','OTHER','PREFER_NOT')),
    avatar_url      TEXT,
    is_active       BOOLEAN DEFAULT TRUE,
    email_verified  BOOLEAN DEFAULT FALSE,
    phone_verified  BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- VEHICLES
-- ============================================================
CREATE TABLE vehicles (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vin             VARCHAR(17) UNIQUE NOT NULL,        -- VIN / Num Châssis
    make            VARCHAR(50)  DEFAULT 'Tesla',
    model           VARCHAR(100) NOT NULL,              -- Model S, 3, X, Y, Cybertruck
    year            SMALLINT     NOT NULL,
    color           VARCHAR(50),
    license_plate   VARCHAR(30),
    battery_capacity_kwh DECIMAL(6,2),
    connector_type  VARCHAR(30) CHECK (connector_type IN ('CCS','NACS','CHAdeMO','Type2')),
    is_active       BOOLEAN DEFAULT TRUE,               -- soft delete
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- VEHICLE OWNERSHIPS  (history of owners)
-- ============================================================
CREATE TABLE vehicle_ownerships (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id      UUID NOT NULL REFERENCES vehicles(id),
    owner_id        UUID NOT NULL REFERENCES drivers(id),
    acquired_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    sold_at         TIMESTAMPTZ,                        -- NULL = current owner
    transfer_note   TEXT,
    CONSTRAINT unique_current_owner EXCLUDE USING btree (
        vehicle_id WITH =
    ) WHERE (sold_at IS NULL)                           -- only one active owner per vehicle
);

-- ============================================================
-- DRIVER <-> VEHICLE ACTIVE LINK  (authorized drivers)
-- ============================================================
CREATE TABLE driver_vehicles (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    driver_id       UUID NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
    vehicle_id      UUID NOT NULL REFERENCES vehicles(id),
    is_selected     BOOLEAN DEFAULT FALSE,              -- active vehicle for this driver session
    linked_at       TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(driver_id, vehicle_id)
);

-- Only one selected vehicle per driver at a time
CREATE UNIQUE INDEX idx_one_selected_vehicle
    ON driver_vehicles(driver_id)
    WHERE is_selected = TRUE;

-- ============================================================
-- STATIONS
-- ============================================================
CREATE TABLE stations (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(200) NOT NULL,
    address         TEXT NOT NULL,
    city            VARCHAR(100),
    country         VARCHAR(100),
    location        GEOGRAPHY(POINT, 4326) NOT NULL,   -- PostGIS geospatial
    operator        VARCHAR(100) DEFAULT 'Tesla',
    is_operational  BOOLEAN DEFAULT TRUE,
    total_connectors SMALLINT DEFAULT 0,
    available_connectors SMALLINT DEFAULT 0,
    amenities       JSONB,                             -- {"wifi": true, "cafe": true, ...}
    photos          TEXT[],
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_station_location ON stations USING gist(location);

-- ============================================================
-- CHARGING CONNECTORS (per station)
-- ============================================================
CREATE TABLE charging_connectors (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    station_id      UUID NOT NULL REFERENCES stations(id),
    connector_code  VARCHAR(20) NOT NULL,              -- e.g. "CONN-01"
    connector_type  VARCHAR(30) NOT NULL,
    power_kw        DECIMAL(6,2),
    status          VARCHAR(20) DEFAULT 'AVAILABLE'
                    CHECK (status IN ('AVAILABLE','OCCUPIED','FAULTED','RESERVED','OFFLINE')),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- RESERVATIONS
-- ============================================================
CREATE TABLE reservations (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    driver_id       UUID NOT NULL REFERENCES drivers(id),
    vehicle_id      UUID NOT NULL REFERENCES vehicles(id),
    station_id      UUID NOT NULL REFERENCES stations(id),
    connector_id    UUID REFERENCES charging_connectors(id),
    scheduled_start TIMESTAMPTZ NOT NULL,
    scheduled_end   TIMESTAMPTZ NOT NULL,
    status          VARCHAR(20) DEFAULT 'PENDING'
                    CHECK (status IN ('PENDING','CONFIRMED','ACTIVE','COMPLETED','CANCELLED','NO_SHOW')),
    cancel_reason   TEXT,
    report_note     TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT no_overlap EXCLUDE USING gist (
        connector_id WITH =,
        tstzrange(scheduled_start, scheduled_end) WITH &&
    ) WHERE (status NOT IN ('CANCELLED','NO_SHOW'))
);

-- ============================================================
-- CHARGING SESSIONS (actual usage, linked post-reservation)
-- ============================================================
CREATE TABLE charging_sessions (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reservation_id  UUID REFERENCES reservations(id),
    driver_id       UUID NOT NULL REFERENCES drivers(id),
    vehicle_id      UUID NOT NULL REFERENCES vehicles(id),
    connector_id    UUID NOT NULL REFERENCES charging_connectors(id),
    started_at      TIMESTAMPTZ,
    ended_at        TIMESTAMPTZ,
    energy_kwh      DECIMAL(8,3),
    cost_eur        DECIMAL(8,2),
    soc_start_pct   SMALLINT,
    soc_end_pct     SMALLINT
);

-- ============================================================
-- OTP TOKENS
-- ============================================================
CREATE TABLE otp_tokens (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    identifier      VARCHAR(255) NOT NULL,             -- email or phone
    otp_hash        VARCHAR(255) NOT NULL,             -- bcrypt hash of OTP
    otp_type        VARCHAR(20) NOT NULL CHECK (otp_type IN ('EMAIL','WHATSAPP')),
    purpose         VARCHAR(30) NOT NULL CHECK (purpose IN ('SIGNIN','SIGNUP','RESET')),
    attempts        SMALLINT DEFAULT 0,
    is_used         BOOLEAN DEFAULT FALSE,
    expires_at      TIMESTAMPTZ NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_otp_identifier ON otp_tokens(identifier, is_used);

-- ============================================================
-- AUDIT LOG
-- ============================================================
CREATE TABLE audit_logs (
    id              BIGSERIAL PRIMARY KEY,
    actor_id        UUID REFERENCES drivers(id),
    action          VARCHAR(100) NOT NULL,
    entity_type     VARCHAR(50),
    entity_id       UUID,
    old_data        JSONB,
    new_data        JSONB,
    ip_address      INET,
    user_agent      TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### 5.3 Row Level Security (Supabase RLS)
```sql
-- Enable RLS
ALTER TABLE drivers           ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_vehicles   ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations      ENABLE ROW LEVEL SECURITY;
ALTER TABLE charging_sessions ENABLE ROW LEVEL SECURITY;

-- Drivers see only themselves
CREATE POLICY drivers_self ON drivers
    FOR ALL USING (id = auth.uid());

-- Reservations: driver sees only their own
CREATE POLICY reservations_own ON reservations
    FOR ALL USING (driver_id = auth.uid());
```

---

## 6. BACKEND — SPRING BOOT

### 6.1 pom.xml Key Dependencies
```xml
<dependencies>
  <!-- Web & REST -->
  <dependency><groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId></dependency>
  <dependency><groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId></dependency>

  <!-- Security & JWT -->
  <dependency><groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId></dependency>
  <dependency><groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId><version>0.12.5</version></dependency>
  <dependency><groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-impl</artifactId><version>0.12.5</version></dependency>

  <!-- JPA + PostgreSQL -->
  <dependency><groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId></dependency>
  <dependency><groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId></dependency>

  <!-- Email -->
  <dependency><groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-mail</artifactId></dependency>

  <!-- Cache (OTP) -->
  <dependency><groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId></dependency>

  <!-- HTTP client (WhatsApp API) -->
  <dependency><groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-webflux</artifactId></dependency>

  <!-- Lombok -->
  <dependency><groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId><optional>true</optional></dependency>

  <!-- MapStruct (DTO mapping) -->
  <dependency><groupId>org.mapstruct</groupId>
    <artifactId>mapstruct</artifactId><version>1.5.5.Final</version></dependency>

  <!-- OpenAPI docs -->
  <dependency><groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
    <version>2.4.0</version></dependency>
</dependencies>
```

### 6.2 Core Entities (abbreviated)

```java
// Driver.java
@Entity @Table(name = "drivers")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class Driver {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @Column(unique = true, nullable = false) private String email;
    @Column(unique = true, nullable = false) private String phone;
    private String firstName, lastName;
    private LocalDate birthDate;
    @Enumerated(EnumType.STRING) private Gender gender;
    private boolean emailVerified, phoneVerified, isActive;
    private Instant createdAt, updatedAt;

    @OneToMany(mappedBy = "driver", cascade = CascadeType.ALL)
    private List<DriverVehicle> driverVehicles;
}

// Vehicle.java
@Entity @Table(name = "vehicles")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class Vehicle {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    @Column(unique = true, nullable = false, length = 17)
    private String vin;
    private String make, model, color, licensePlate;
    private Short year;
    private BigDecimal batteryCapacityKwh;
    @Enumerated(EnumType.STRING) private ConnectorType connectorType;
    private boolean isActive;
    private Instant createdAt, updatedAt;
}

// VehicleOwnership.java
@Entity @Table(name = "vehicle_ownerships")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class VehicleOwnership {
    @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id;
    @ManyToOne @JoinColumn(name = "vehicle_id") private Vehicle vehicle;
    @ManyToOne @JoinColumn(name = "owner_id")   private Driver  owner;
    private Instant acquiredAt;
    private Instant soldAt;         // null = current owner
    private String transferNote;
}
```

### 6.3 Auth Flow — Service Layer

```java
// AuthService.java  (key methods)
@Service @RequiredArgsConstructor
public class AuthService {

    // ── STEP 1: Initiate Sign-In ──────────────────────────────────
    public OtpInitResponse initiateSignIn(SignInRequest req) {
        // Find driver by email OR phone + VIN
        Driver driver = driverRepository
            .findByEmailOrPhone(req.getEmailOrPhone())
            .orElseThrow(() -> new DriverNotFoundException("Driver not found"));

        // Verify the VIN belongs to a vehicle linked to this driver
        boolean vinLinked = driverVehicleRepository
            .existsByDriverIdAndVehicleVin(driver.getId(), req.getVin());
        if (!vinLinked) throw new VinMismatchException("VIN not linked to this driver");

        // Generate and send OTP
        otpService.generateAndSend(driver.getEmail(), driver.getPhone(),
                                    req.getOtpChannel(), OtpPurpose.SIGNIN);
        return OtpInitResponse.of(driver.getId(), req.getOtpChannel());
    }

    // ── STEP 2: Verify OTP → Issue JWT ───────────────────────────
    public AuthTokenResponse verifyOtpAndLogin(OtpVerifyRequest req) {
        otpService.verify(req.getIdentifier(), req.getOtp(), OtpPurpose.SIGNIN);
        Driver driver = driverRepository.findByEmailOrPhone(req.getIdentifier())
            .orElseThrow();
        String accessToken  = jwtService.generateAccessToken(driver);
        String refreshToken = jwtService.generateRefreshToken(driver);
        return AuthTokenResponse.builder()
            .accessToken(accessToken)
            .refreshToken(refreshToken)
            .driverId(driver.getId())
            .build();
    }

    // ── SIGN-UP ──────────────────────────────────────────────────
    public OtpInitResponse initiateSignUp(SignUpRequest req) {
        // 1. Check email + phone not already registered
        if (driverRepository.existsByEmail(req.getEmail()))
            throw new DuplicateEmailException();
        if (driverRepository.existsByPhone(req.getPhone()))
            throw new DuplicatePhoneException();

        // 2. Validate VIN via NHTSA API
        VinValidationResult vin = vinValidationService.validate(req.getVin());
        if (!vin.isValid()) throw new InvalidVinException(vin.getReason());

        // 3. Check VIN not already owned by someone else
        boolean alreadyOwned = vehicleOwnershipRepository
            .existsActiveOwnerForVin(req.getVin());
        if (alreadyOwned) throw new VehicleAlreadyAssignedException();

        // 4. Store pending registration in Redis (TTL = 30 min)
        registrationCacheService.storePending(req);

        // 5. Send OTP to email
        otpService.generateAndSend(req.getEmail(), null,
                                    OtpChannel.EMAIL, OtpPurpose.SIGNUP);
        return OtpInitResponse.pending(req.getEmail());
    }

    public AuthTokenResponse completeSignUp(OtpVerifyRequest req) {
        otpService.verify(req.getIdentifier(), req.getOtp(), OtpPurpose.SIGNUP);
        SignUpRequest pending = registrationCacheService.retrieve(req.getIdentifier());

        // Persist driver
        Driver driver = driverMapper.toEntity(pending);
        driver = driverRepository.save(driver);

        // Persist vehicle (if new) + ownership + driver_vehicles link
        vehicleService.registerAndAssign(pending.getVin(), driver);

        String accessToken  = jwtService.generateAccessToken(driver);
        String refreshToken = jwtService.generateRefreshToken(driver);
        return AuthTokenResponse.builder()
            .accessToken(accessToken).refreshToken(refreshToken)
            .driverId(driver.getId()).build();
    }
}
```

### 6.4 OTP Service

```java
@Service @RequiredArgsConstructor
public class OtpService {

    private final OtpTokenRepository otpTokenRepository;
    private final EmailOtpSender emailSender;
    private final WhatsAppOtpSender whatsAppSender;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.otp.length}") private int otpLength;
    @Value("${app.otp.expiry-minutes}") private int expiryMinutes;
    @Value("${app.otp.max-attempts}") private int maxAttempts;

    public void generateAndSend(String email, String phone,
                                 OtpChannel channel, OtpPurpose purpose) {
        String otp = generateSecureOtp(otpLength);
        String hash = passwordEncoder.encode(otp);
        String identifier = channel == OtpChannel.EMAIL ? email : phone;

        OtpToken token = OtpToken.builder()
            .identifier(identifier)
            .otpHash(hash)
            .otpType(channel.name())
            .purpose(purpose.name())
            .expiresAt(Instant.now().plusSeconds(expiryMinutes * 60L))
            .build();
        otpTokenRepository.save(token);

        if (channel == OtpChannel.EMAIL) emailSender.send(email, otp);
        else whatsAppSender.send(phone, otp);
    }

    public void verify(String identifier, String otp, OtpPurpose purpose) {
        OtpToken token = otpTokenRepository
            .findLatestValid(identifier, purpose.name())
            .orElseThrow(() -> new OtpExpiredException("No valid OTP found"));

        if (token.getAttempts() >= maxAttempts)
            throw new OtpMaxAttemptsException();
        if (Instant.now().isAfter(token.getExpiresAt()))
            throw new OtpExpiredException("OTP has expired");

        token.setAttempts(token.getAttempts() + 1);
        if (!passwordEncoder.matches(otp, token.getOtpHash())) {
            otpTokenRepository.save(token);
            throw new OtpInvalidException("Invalid OTP. Attempts: " + token.getAttempts());
        }
        token.setUsed(true);
        otpTokenRepository.save(token);
    }

    private String generateSecureOtp(int length) {
        SecureRandom rnd = new SecureRandom();
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < length; i++) sb.append(rnd.nextInt(10));
        return sb.toString();
    }
}
```

### 6.5 Reservation Service (conflict prevention)

```java
@Service @RequiredArgsConstructor @Transactional
public class ReservationService {

    public Reservation create(CreateReservationRequest req, UUID driverId) {
        // 1. Validate time window
        if (req.getStart().isAfter(req.getEnd()) ||
            Duration.between(req.getStart(), req.getEnd()).toMinutes() < 15)
            throw new InvalidSlotException("Minimum slot is 15 minutes");

        // 2. Check connector availability (uses DB EXCLUDE constraint + query)
        boolean conflict = reservationRepository.hasConflict(
            req.getConnectorId(), req.getStart(), req.getEnd());
        if (conflict) throw new ConnectorNotAvailableException();

        // 3. Get driver's selected vehicle
        Vehicle vehicle = driverVehicleRepository
            .findSelectedByDriverId(driverId)
            .map(DriverVehicle::getVehicle)
            .orElseThrow(() -> new NoSelectedVehicleException());

        // 4. Save reservation
        Reservation res = Reservation.builder()
            .driverId(driverId).vehicleId(vehicle.getId())
            .stationId(req.getStationId()).connectorId(req.getConnectorId())
            .scheduledStart(req.getStart()).scheduledEnd(req.getEnd())
            .status(ReservationStatus.CONFIRMED).build();
        return reservationRepository.save(res);
    }

    public void cancel(UUID reservationId, UUID driverId, String reason) {
        Reservation res = reservationRepository.findByIdAndDriverId(reservationId, driverId)
            .orElseThrow(ReservationNotFoundException::new);
        if (res.getStatus() == ReservationStatus.ACTIVE)
            throw new CannotCancelActiveSessionException();
        res.setStatus(ReservationStatus.CANCELLED);
        res.setCancelReason(reason);
        reservationRepository.save(res);
    }
}
```

### 6.6 Vehicle Ownership Transfer

```java
public void transferOwnership(UUID vehicleId, UUID newOwnerId, String note) {
    // Close current ownership
    VehicleOwnership current = ownershipRepository
        .findActiveByVehicleId(vehicleId)
        .orElseThrow(() -> new OwnershipNotFoundException());
    current.setSoldAt(Instant.now());
    current.setTransferNote(note);
    ownershipRepository.save(current);

    // Remove vehicle from previous owner's driver_vehicles
    driverVehicleRepository.deleteByDriverIdAndVehicleId(
        current.getOwner().getId(), vehicleId);

    // Create new ownership record
    VehicleOwnership newOwnership = VehicleOwnership.builder()
        .vehicle(current.getVehicle())
        .owner(driverRepository.getReferenceById(newOwnerId))
        .acquiredAt(Instant.now())
        .build();
    ownershipRepository.save(newOwnership);

    // Link vehicle to new owner as driver
    DriverVehicle link = DriverVehicle.builder()
        .driverId(newOwnerId).vehicleId(vehicleId).isSelected(false).build();
    driverVehicleRepository.save(link);
}
```

---

## 7. FRONTEND — ANGULAR (IONIC)

### 7.1 App Routing Structure
```typescript
// app-routing.module.ts
const routes: Routes = [
  { path: '', redirectTo: 'auth', pathMatch: 'full' },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule),
    canActivate: [GuestGuard]  // redirect if already logged in
  },
  {
    path: 'app',
    component: TabsPage,
    canActivate: [AuthGuard],  // redirect to auth if not logged in
    children: [
      { path: 'home',         loadChildren: () => import('./features/home/home.module') },
      { path: 'map',          loadChildren: () => import('./features/map/map.module') },
      { path: 'reservations', loadChildren: () => import('./features/reservations/reservations.module') },
      { path: 'profile',      loadChildren: () => import('./features/profile/profile.module') },
      { path: '', redirectTo: 'home', pathMatch: 'full' }
    ]
  }
];
```

### 7.2 Auth Guard
```typescript
@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): boolean {
    if (this.auth.isAuthenticated()) return true;
    this.router.navigate(['/auth/sign-in']);
    return false;
  }
}
```

### 7.3 JWT Interceptor
```typescript
@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(private auth: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.auth.getAccessToken();
    if (token) {
      req = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      });
    }
    return next.handle(req).pipe(
      catchError(err => {
        if (err.status === 401) this.auth.refreshToken();
        return throwError(() => err);
      })
    );
  }
}
```

### 7.4 Auth State Flow (Sign-In)
```typescript
// sign-in.page.ts
async onSubmitStep1() {
  const req = { emailOrPhone: this.form.emailOrPhone, vin: this.form.vin };
  await this.authService.initiateSignIn(req).toPromise();
  this.step = 'OTP';  // show OTP input screen
}

async onVerifyOtp() {
  const tokens = await this.authService.verifyOtp({
    identifier: this.form.emailOrPhone,
    otp: this.otpCode
  }).toPromise();
  await this.storageService.setTokens(tokens);
  this.router.navigate(['/app/home']);
}
```

### 7.5 Map Page — Nearby Stations
```typescript
// map.page.ts
ngOnInit() {
  this.geolocation.getCurrentPosition().then(pos => {
    this.center = { lat: pos.coords.latitude, lng: pos.coords.longitude };
    this.loadNearbyStations(this.center);
  });
}

loadNearbyStations(coords: LatLng) {
  this.stationService
    .getNearby(coords.lat, coords.lng, this.radiusKm)
    .subscribe(stations => {
      this.stations = stations;
      // Place markers on Google Map
      stations.forEach(s => this.placeMarker(s));
    });
}

openReservationModal(station: Station) {
  this.modalCtrl.create({
    component: ReservationModalComponent,
    componentProps: { station }
  }).then(m => m.present());
}
```

### 7.6 Profile — Car Management
```typescript
// profile.page.ts
selectVehicle(vehicleId: string) {
  this.vehicleService.setSelected(vehicleId).subscribe(() => {
    this.selectedVehicleId = vehicleId;
    this.toastCtrl.create({ message: 'Active vehicle updated', duration: 2000 });
  });
}

sellVehicle(vehicleId: string) {
  this.alertCtrl.create({
    header: 'Transfer Ownership',
    inputs: [{ name: 'newOwnerEmail', placeholder: 'New owner email' }],
    buttons: [
      { text: 'Cancel', role: 'cancel' },
      { text: 'Transfer', handler: data => {
          this.vehicleService.transfer(vehicleId, data.newOwnerEmail)
            .subscribe(() => this.loadVehicles());
        }
      }
    ]
  }).then(a => a.present());
}
```

---

## 8. AUTHENTICATION & OTP FLOW

### 8.1 Sign-Up Flow (Step by Step)
```
1. User opens app → routed to /auth/sign-in (no token)
2. User taps "Create Account"

3. STEP A — Single unified registration form (ALL fields at once):
   ├── [ Identity ]
   │   ├── Email              (required, unique)
   │   ├── Phone / Tél        (required, unique, E.164 format)
   │   └── VIN / Num Châssis  (required, 17 characters)
   ├── [ Personal Details ]
   │   ├── First name         (required)
   │   ├── Last name          (required)
   │   ├── Birth date         (required)
   │   └── Gender             (optional: Male / Female / Other / Prefer not to say)
   └── [ Preferences ]
       └── OTP Channel        (Email / WhatsApp)

4. User submits → POST /api/v1/auth/signup/initiate
   Backend (atomic validation block):
     a. Check email not already registered
     b. Check phone not already registered
     c. Validate VIN format (17-char alphanumeric, no I/O/Q)
     d. Call NHTSA vPIC API → confirm VIN is a real Tesla vehicle
     e. Check VIN has no active owner in vehicle_ownerships
     f. Cache full registration payload in Redis (TTL = 30 min, keyed by email)
     g. Generate 6-digit OTP → bcrypt hash → store in otp_tokens
     h. Send OTP via chosen channel (Email or WhatsApp)
     → Response: { otpSent: true, channel: "EMAIL"|"WHATSAPP", expiresIn: 600 }

5. STEP B — OTP Verification screen:
   ├── 6-digit input (auto-focus, one digit per cell)
   ├── Countdown timer (10:00 → 0:00)
   ├── Resend button (enabled after 60s cooldown)
   └── Submit

6. POST /api/v1/auth/signup/verify-otp  { identifier: email, otp: "XXXXXX" }
   Backend:
     a. Load otp_tokens record → check not expired, not used, attempts < 3
     b. bcrypt.matches(inputOtp, storedHash)
     c. If valid → mark OTP as used
     d. Load pending registration from Redis cache
     e. Persist in DB (single transaction):
        ├── INSERT drivers (all personal fields)
        ├── INSERT vehicles (VIN + Tesla metadata from NHTSA)
        ├── INSERT vehicle_ownerships (driver = owner, sold_at = NULL)
        └── INSERT driver_vehicles (is_selected = TRUE)
     f. Issue JWT access token (1h) + refresh token (7d)
     → Response: { accessToken, refreshToken, driverId }

7. Store tokens in Capacitor SecureStorage → navigate to /app/home
```

### 8.2 Sign-In Flow
```
1. User opens app → no valid token → /auth/sign-in
2. STEP A — Credentials:
   ├── Email OR Phone
   └── VIN
3. POST /api/v1/auth/signin/initiate
   Backend: find driver, check VIN linked, send OTP
4. STEP B — OTP verification
5. POST /api/v1/auth/signin/verify-otp
   Backend: verify OTP → issue JWT
6. Navigate to /app/home
```

### 8.3 Token Refresh Strategy
```
Access Token:  1 hour (JWT, stateless)
Refresh Token: 7 days (stored in Capacitor SecureStorage)
On 401: auto-call POST /api/v1/auth/refresh
         → if refresh valid: new access token issued
         → if refresh expired: redirect to sign-in
```

---

## 9. SEQUENCE DIAGRAMS

### 9.1 Sign-Up Sequence
```
App (Single Form)    Backend           NHTSA API     Redis       DB          OTP Sender
 │                       │                 │            │          │               │
 │── POST signup/initiate (email+phone+VIN+name+dob+gender+channel) ──────────────│
 │                       │─validateVin───>│            │          │               │
 │                       │<──vinOK────────│            │          │               │
 │                       │─checkEmail/Phone──────────────────────>│               │
 │                       │<──notExists───────────────────────────│               │
 │                       │─checkVinOwnership─────────────────────>│               │
 │                       │<──noActiveOwner───────────────────────│               │
 │                       │─cacheRegistration─────────>│          │               │
 │                       │─generateOTP────────────────────────────────────────── >│
 │<── { otpSent, channel, expiresIn } ────│            │          │               │
 │                       │                 │            │          │               │
 │── POST signup/verify-otp { identifier, otp } ───────────────────────────────  │
 │                       │─verifyOtpHash─────────────────────────>│               │
 │                       │<──valid───────────────────────────────│               │
 │                       │─loadPending───────────────>│          │               │
 │                       │<──registrationData─────────│          │               │
 │                       │─── BEGIN TRANSACTION ─────────────────>│               │
 │                       │    INSERT drivers          │           │               │
 │                       │    INSERT vehicles (VIN)   │           │               │
 │                       │    INSERT vehicle_ownerships│           │               │
 │                       │    INSERT driver_vehicles  │           │               │
 │                       │─── COMMIT ─────────────────────────────│               │
 │                       │─issueJWT (access+refresh)  │          │               │
 │<── { accessToken, refreshToken, driverId } ────────│          │               │
 │── navigate /app/home  │                 │            │          │               │
```

### 9.2 Reservation Flow
```
App           Backend           DB
 │                │               │
 │─GetNearby(loc)>│               │
 │                │─GeoQuery─────>│
 │<─StationList──│<─Results──────│
 │─SelectStation >│               │
 │─SelectSlot────>│               │
 │─PostReservation>│              │
 │                │─CheckConflict>│
 │                │<─Available───│
 │                │─SaveReserv───>│
 │<─Confirmed────│<─Saved────────│
```

---

## 10. API CONTRACT (REST)

**Base URL:** `/api/v1`  
**Auth:** `Bearer <JWT>` on all protected routes

### Auth Endpoints
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/signup/initiate` | Public | Start registration, send OTP |
| POST | `/auth/signup/verify-otp` | Public | Verify OTP step |
| POST | `/auth/signup/complete` | Public (OTP verified token) | Save profile + issue JWT |
| POST | `/auth/signin/initiate` | Public | Start login, send OTP |
| POST | `/auth/signin/verify-otp` | Public | Verify OTP → JWT |
| POST | `/auth/refresh` | Refresh token | Renew access token |
| POST | `/auth/otp/resend` | Public | Resend OTP (rate limited) |
| POST | `/auth/logout` | JWT | Invalidate refresh token |

### Driver/Profile Endpoints
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/drivers/me` | JWT | Get own profile |
| PUT | `/drivers/me` | JWT | Update profile |
| GET | `/drivers/me/stats` | JWT | Recent sessions summary |

### Vehicle Endpoints
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/vehicles/mine` | JWT | List my linked vehicles |
| POST | `/vehicles` | JWT | Add a vehicle (VIN required) |
| DELETE | `/vehicles/{id}` | JWT | Remove vehicle link |
| PUT | `/vehicles/{id}/select` | JWT | Set as active vehicle |
| POST | `/vehicles/{id}/transfer` | JWT | Ownership transfer (sell) |

### Station Endpoints
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/stations/nearby?lat=&lng=&radius=` | JWT | Geo search |
| GET | `/stations/{id}` | JWT | Station details + connectors |
| GET | `/stations/{id}/availability?date=` | JWT | Available slots |

### Reservation Endpoints
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/reservations` | JWT | My reservations (paginated) |
| POST | `/reservations` | JWT | Create reservation |
| GET | `/reservations/{id}` | JWT | Reservation detail |
| DELETE | `/reservations/{id}` | JWT | Cancel reservation |
| PUT | `/reservations/{id}/report` | JWT | Report an issue |

---

## 11. BUSINESS RULES & VALIDATION

| Rule | Detail |
|---|---|
| **VIN Uniqueness** | A VIN can only have ONE active owner at a time |
| **Driver / Car Split** | A driver may be linked to multiple cars; a car has one owner, N authorized drivers |
| **Active Vehicle** | Exactly one selected vehicle per driver at any session |
| **Ownership Transfer** | The previous active ownership `sold_at` is set; history is preserved |
| **OTP Max Attempts** | 3 failed attempts → OTP invalidated → must resend |
| **OTP Expiry** | 10 minutes; resend enforces 60s cooldown |
| **Reservation Overlap** | DB-level EXCLUDE constraint prevents double-booking same connector |
| **Min Slot** | 15 minutes minimum reservation window |
| **Cancel Policy** | Cannot cancel an ACTIVE charging session |
| **Sign-In VIN Check** | Email/phone + VIN must be linked in `driver_vehicles` |
| **Phone Format** | Stored in E.164 international format (`+CCXXXXXXXXX`) |

---

## 12. SECURITY STRATEGY

| Area | Measure |
|---|---|
| **JWT** | RS256 signing (asymmetric), short-lived access token (1h) |
| **OTP** | bcrypt-hashed in DB; never stored in plain text |
| **HTTPS** | TLS 1.3 enforced in production; HSTS header |
| **CORS** | Whitelist specific mobile app origins |
| **Rate Limiting** | OTP resend: 60s cooldown; Login: 5 attempts/15min (Redis) |
| **Input Validation** | Bean Validation (@NotBlank, @Email, @Pattern for VIN) + custom |
| **SQL Injection** | JPA Parameterized queries only; no native SQL raw concat |
| **Secrets** | Environment variables only; never in source code |
| **RLS** | Supabase Row Level Security on all sensitive tables |
| **Audit Logs** | All auth and ownership transfer events logged |
| **Token Storage** | Capacitor SecureStorage (Keychain/Keystore), never localStorage |

---

## 13. TESTING STRATEGY

### 13.1 Backend Testing
```
Unit Tests (JUnit 5 + Mockito):
  ├── AuthServiceTest          — sign-in, sign-up, OTP edge cases
  ├── OtpServiceTest           — generate, verify, expiry, max attempts
  ├── ReservationServiceTest   — conflicts, cancellation rules
  ├── VehicleServiceTest       — VIN validation, ownership transfer
  └── VinValidationServiceTest — NHTSA API mock

Integration Tests (Spring Boot Test + Testcontainers):
  ├── AuthControllerIT         — full sign-up + sign-in HTTP flow
  ├── ReservationControllerIT  — booking lifecycle
  └── VehicleControllerIT      — ownership transfer end-to-end

Coverage Target: ≥ 80%
```

### 13.2 Frontend Testing
```
Unit Tests (Jasmine + Karma):
  ├── AuthService
  ├── JwtInterceptor
  └── VehicleService

E2E Tests (Cypress or Playwright):
  ├── signup_flow.spec.ts
  ├── signin_flow.spec.ts
  ├── map_search.spec.ts
  ├── reservation_create.spec.ts
  └── profile_vehicle_management.spec.ts
```

---

## 14. DEPLOYMENT PROCEDURE

### 14.1 Docker Compose (Production)
```yaml
# docker-compose.prod.yml
services:
  backend:
    image: teslacharge/backend:${VERSION}
    environment:
      - SPRING_PROFILES_ACTIVE=prod
      - SUPABASE_DB_URL=${SUPABASE_DB_URL}
      - JWT_SECRET=${JWT_SECRET}
      - WHATSAPP_TOKEN=${WHATSAPP_TOKEN}
    ports: ["8080:8080"]
    depends_on: [redis]

  redis:
    image: redis:7-alpine
    volumes: ["redis_data:/data"]

volumes:
  redis_data:
```

### 14.2 CI/CD Pipeline (GitHub Actions)
```yaml
# .github/workflows/backend-ci.yml
on: [push]
jobs:
  build-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with: { java-version: '21' }
      - run: mvn test
      - run: mvn package -DskipTests
      - uses: docker/build-push-action@v5
```

### 14.3 DB Migration Procedure
```bash
# Apply migrations via Supabase CLI
supabase db push                      # dev
supabase db push --linked             # production (linked project)
# Always run migrations BEFORE deploying new backend version
```

### 14.4 Mobile Build & Release
```bash
# Android
ionic build --prod
ionic cap sync android
cd android && ./gradlew bundleRelease
# → upload to Google Play Console

# iOS
ionic build --prod
ionic cap sync ios
# → archive via Xcode → upload to App Store Connect
```

---

## 15. ERROR HANDLING & LOGGING

### 15.1 Global Exception Handler
```java
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(DriverNotFoundException.class)
    ResponseEntity<ErrorResponse> handleNotFound(DriverNotFoundException ex) {
        return ResponseEntity.status(404).body(new ErrorResponse("DRIVER_NOT_FOUND", ex.getMessage()));
    }

    @ExceptionHandler(OtpInvalidException.class)
    ResponseEntity<ErrorResponse> handleOtp(OtpInvalidException ex) {
        return ResponseEntity.status(400).body(new ErrorResponse("OTP_INVALID", ex.getMessage()));
    }

    @ExceptionHandler(VehicleAlreadyAssignedException.class)
    ResponseEntity<ErrorResponse> handleVin(VehicleAlreadyAssignedException ex) {
        return ResponseEntity.status(409).body(new ErrorResponse("VIN_ALREADY_OWNED", ex.getMessage()));
    }
    // ... all custom exceptions
}
```

### 15.2 Standard Error Response Format
```json
{
  "code": "OTP_INVALID",
  "message": "The OTP you entered is incorrect. Attempts remaining: 2",
  "timestamp": "2026-03-23T10:45:00Z",
  "path": "/api/v1/auth/signin/verify-otp"
}
```

---

## 16. ROLLBACK PLAN

| Scenario | Action |
|---|---|
| Bad backend deploy | `docker rollback` to previous image tag; no DB change needed if migration was non-destructive |
| Bad DB migration | Apply reverse migration SQL (`down` scripts in `/infra/supabase/migrations/rollbacks/`) |
| OTP service down | Fallback to email-only OTP; WhatsApp marked unavailable |
| Token secret rotated | Existing tokens invalidated → all users re-authenticate (planned maintenance) |
| VIN service unavailable | Allow registration with manual review flag; admin approval queue |

---

*End of MOP — TeslaCharge v1.0.0*
