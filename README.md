# ⚡ TeslaCharge — EV Charging Station Reservation App

> A cross-platform mobile application enabling Tesla drivers to locate, schedule, and manage charging station reservations — with secure OTP authentication, multi-vehicle support, and real-time station availability.

---

## 📋 Table of Contents

- [About the Project](#about-the-project)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Authentication Flow](#authentication-flow)
- [Navigation & Screens](#navigation--screens)
- [Database Schema](#database-schema)
- [API Documentation](#api-documentation)
- [Environment Variables](#environment-variables)
- [Running Tests](#running-tests)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## 🚗 About the Project

**TeslaCharge** solves the pain of unmanaged EV charging by providing a structured reservation system for Tesla charging stations. A driver — who may or may not be the legal car owner — can register using their personal identity (email + phone) and their vehicle's VIN number, then seamlessly book, reschedule, or cancel charging slots.

The system handles:
- **Multi-person, multi-vehicle ownership** (one car, one owner; one person, many cars)
- **Secure OTP authentication** via email or WhatsApp (no password needed)
- **Ownership transfer** when a car is sold
- **Real-time geospatial station search** with live slot availability

---

## ✨ Features

### 🔐 Authentication
- OTP-based passwordless login (email or WhatsApp delivery)
- identity verification: personal credentials + VIN (vehicle chassis number)
- Secure JWT access tokens (1h) + refresh tokens (7d)
- Token stored in device's native secure storage (Keychain / Keystore)

### 🏠 Home Dashboard
- Recent charging session summary (energy, cost, duration)
- Quick-access shortcuts to favorite charging stations
- Active vehicle info card
- Profile completeness indicator

### 🗺️ Map & Station Search
- Interactive Google Maps view centered on driver's location
- Search nearby stations within configurable radius
- Filter by connector type, available slots, operator
- Tap a station → view details, connectors, availability calendar
- Schedule a reservation directly from the map

### 📅 Reservations
- View all upcoming and past reservations
- Cancel a pending or confirmed reservation
- Report an issue on a reservation
- Receive push notifications for upcoming sessions

### 👤 Profile & Vehicle Management
- View and edit personal details
- Manage multiple linked vehicles:
  - Add new vehicle (VIN registration + validation)
  - Select/deselect active vehicle
  - Remove a vehicle link
  - Transfer ownership (sell) to another registered user
- Change OTP delivery preference (email / WhatsApp)

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Mobile Frontend** | Angular 17 + Ionic 7 + Capacitor 5 |
| **Maps** | Google Maps JavaScript SDK |
| **Backend API** | Spring Boot 3.2 (Java 21) |
| **ORM** | Spring Data JPA + Hibernate |
| **Security** | Spring Security + JJWT (RS256) |
| **Database** | Supabase — PostgreSQL 15 with PostGIS |
| **Auth Base** | Supabase Auth + Custom OTP layer |
| **OTP — Email** | Spring Boot Mail (SMTP) |
| **OTP — WhatsApp** | WhatsApp Business Cloud API |
| **Cache / Rate Limit** | Redis 7 |
| **VIN Validation** | NHTSA vPIC API |
| **Containerization** | Docker + Docker Compose |
| **CI/CD** | GitHub Actions |

---

## 🏛️ Architecture

```
┌──────────────────────────────────────────┐
│        Angular + Ionic Mobile App        │
│  Home  │  Map  │  Reservations  │ Profile │
└──────────────────┬───────────────────────┘
                   │ HTTPS + JWT
┌──────────────────▼───────────────────────┐
│          Spring Boot REST API            │
│   Auth · Driver · Vehicle · Station ·   │
│   Reservation · OTP · VIN Validation    │
└──────────────────┬───────────────────────┘
                   │
┌──────────────────▼───────────────────────┐
│     Supabase (PostgreSQL + Auth + RLS)   │
└──────────────────────────────────────────┘
        │                        │
 WhatsApp Business API       Email SMTP
       (OTP)                   (OTP)
```

---

## 🚀 Getting Started

### Prerequisites

```bash
# Runtime
node >= 20.x
java >= 21
maven >= 3.9
docker >= 24.x
docker-compose >= 2.x

# Global CLIs
npm install -g @ionic/cli @angular/cli
```

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/teslacharge.git
cd teslacharge
```

### 2. Configure Environment Variables

```bash
# Backend
cp backend/src/main/resources/application-dev.yml.example \
   backend/src/main/resources/application-dev.yml
# Edit application-dev.yml with your Supabase, SMTP, WhatsApp, JWT secrets

# Frontend
cp frontend/src/environments/environment.example.ts \
   frontend/src/environments/environment.ts
# Edit with your API URL, Google Maps key, Supabase config
```

### 3. Start Infrastructure

```bash
cd infra
docker-compose up -d    # Starts Supabase local + Redis
```

### 4. Apply Database Migrations

```bash
supabase db push        # Applies all SQL in /infra/supabase/migrations/
```

### 5. Run the Backend

```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=dev
# API available at http://localhost:8080
# Swagger UI at http://localhost:8080/swagger-ui.html
```

### 6. Run the Frontend

```bash
cd frontend
npm install
ionic serve                  # Browser dev server
# OR
ionic cap run android        # On Android emulator/device
ionic cap run ios            # On iOS simulator/device
```

---

## 📁 Project Structure

```
teslacharge/
├── frontend/                # Angular + Ionic app
│   └── src/app/
│       ├── core/            # Guards, interceptors, core services
│       ├── shared/          # Models, pipes, reusable components
│       └── features/
│           ├── auth/        # Sign-in, Sign-up, OTP screens
│           ├── home/        # Dashboard tab
│           ├── map/         # Map + station search tab
│           ├── reservations/# Booking management tab
│           └── profile/     # Profile + vehicle management tab
│
├── backend/                 # Spring Boot application
│   └── src/main/java/com/teslacharge/
│       ├── config/          # Security, JWT, CORS, DB config
│       └── modules/
│           ├── auth/        # Authentication + OTP service
│           ├── driver/      # Driver profile management
│           ├── vehicle/     # Vehicle + ownership logic
│           ├── station/     # Station search + availability
│           └── reservation/ # Booking lifecycle
│
├── infra/
│   ├── docker-compose.yml
│   └── supabase/migrations/ # Ordered SQL migration files
│
└── .github/workflows/       # CI/CD pipelines
```

---

## 🔐 Authentication Flow

### Sign-Up (New Driver)

```
1. Enter: email + phone + VIN  →  choose OTP channel
2. Backend validates:
   ✔ Email and phone not already registered
   ✔ VIN is valid (NHTSA API)
   ✔ VIN has no current owner
3. OTP sent via email or WhatsApp
4. User verifies OTP (6 digits, valid 10 minutes)
5. User fills personal details (name, birth date, gender)
6. Account created + vehicle assigned → JWT issued
```

### Sign-In (Returning Driver)

```
1. Enter: email OR phone + VIN
2. Backend verifies VIN is linked to this driver
3. OTP sent → user verifies → JWT issued
```

### Token Management

```
Access Token  → 1 hour  (RS256 JWT)
Refresh Token → 7 days  (stored in Capacitor SecureStorage)
On 401 error  → auto-refresh; if expired → redirect to Sign-In
```

---

## 📱 Navigation & Screens

| Tab | Screen | Description |
|---|---|---|
| **Home** | Dashboard | Session stats, favorite stations, active vehicle card |
| **Map** | Station Map | Geo-search, station markers, slot booking modal |
| **Reservations** | Booking List | Upcoming + past reservations, cancel/report actions |
| **Profile** | Profile | Edit details, manage cars, OTP preference |

---

## 🗄️ Database Schema

Key tables in Supabase (PostgreSQL):

| Table | Description |
|---|---|
| `drivers` | Registered users (drivers/owners) |
| `vehicles` | Tesla vehicles (indexed by VIN) |
| `vehicle_ownerships` | Full ownership history (supports transfer/sale) |
| `driver_vehicles` | Many-to-many: drivers ↔ vehicles, with `is_selected` flag |
| `stations` | Charging stations with PostGIS geolocation |
| `charging_connectors` | Individual connectors per station (status, power) |
| `reservations` | Booking records with conflict-prevention EXCLUDE constraint |
| `charging_sessions` | Actual charging usage data |
| `otp_tokens` | Hashed OTP records (bcrypt, with expiry and attempt tracking) |
| `audit_logs` | Full audit trail for auth and ownership events |

> Row Level Security (RLS) is enabled: drivers can only access their own data.

---

## 📡 API Documentation

Interactive Swagger UI available at:
```
http://localhost:8080/swagger-ui.html  (dev)
https://api.teslacharge.app/swagger-ui.html  (prod)
```

### Key Endpoints Summary

```
POST  /api/v1/auth/signup/initiate        → Start registration, send OTP
POST  /api/v1/auth/signup/verify-otp      → Verify OTP (signup)
POST  /api/v1/auth/signup/complete        → Save profile + issue JWT
POST  /api/v1/auth/signin/initiate        → Start login, send OTP
POST  /api/v1/auth/signin/verify-otp      → Verify OTP → JWT
POST  /api/v1/auth/refresh                → Refresh access token
POST  /api/v1/auth/otp/resend             → Resend OTP

GET   /api/v1/drivers/me                  → Get own profile
PUT   /api/v1/drivers/me                  → Update profile
GET   /api/v1/drivers/me/stats            → Session summary

GET   /api/v1/vehicles/mine               → My linked vehicles
POST  /api/v1/vehicles                    → Register new vehicle
PUT   /api/v1/vehicles/{id}/select        → Set active vehicle
POST  /api/v1/vehicles/{id}/transfer      → Transfer ownership (sell)
DELETE /api/v1/vehicles/{id}              → Remove link

GET   /api/v1/stations/nearby?lat=&lng=&radius=   → Geo search
GET   /api/v1/stations/{id}               → Station + connectors
GET   /api/v1/stations/{id}/availability?date=    → Slot availability

GET   /api/v1/reservations                → My reservations
POST  /api/v1/reservations                → Book a slot
DELETE /api/v1/reservations/{id}          → Cancel reservation
PUT   /api/v1/reservations/{id}/report    → Report issue
```

---

## ⚙️ Environment Variables

### Backend (`application-dev.yml`)

| Key | Description |
|---|---|
| `SUPABASE_DB_URL` | JDBC PostgreSQL connection string |
| `SUPABASE_DB_USER` | DB username |
| `SUPABASE_DB_PASSWORD` | DB password |
| `JWT_SECRET` | RS256 private key (min 2048-bit) |
| `SMTP_HOST / PORT / USER / PASS` | Email SMTP config |
| `WHATSAPP_API_URL` | WhatsApp Business API endpoint |
| `WHATSAPP_TOKEN` | WhatsApp API Bearer token |
| `WHATSAPP_FROM` | Registered WhatsApp sender number |
| `REDIS_HOST / PORT` | Redis connection |

### Frontend (`environment.ts`)

| Key | Description |
|---|---|
| `apiBaseUrl` | Spring Boot API base URL |
| `supabaseUrl` | Supabase project URL |
| `supabaseAnonKey` | Supabase anonymous public key |
| `googleMapsApiKey` | Google Maps JavaScript API key |

> ⚠️ **Never commit secrets to version control.** Use `.env` files or a secret manager.

---

## 🧪 Running Tests

### Backend

```bash
cd backend

# Unit tests
mvn test

# Integration tests (requires Docker for Testcontainers)
mvn verify -Pintegration-tests

# Test coverage report
mvn jacoco:report
open target/site/jacoco/index.html
```

### Frontend

```bash
cd frontend

# Unit tests
ng test

# E2E tests (Cypress)
npx cypress open
```

**Coverage targets:** Backend ≥ 80% · Frontend ≥ 70%

---

## 🚢 Deployment

### Docker (Production)

```bash
# Build images
docker build -t teslacharge/backend:latest ./backend
docker build -t teslacharge/frontend:latest ./frontend

# Run production stack
docker-compose -f infra/docker-compose.prod.yml up -d
```

### Mobile App Release

```bash
# Android (Google Play)
ionic build --prod && ionic cap sync android
cd frontend/android && ./gradlew bundleRelease

# iOS (App Store)
ionic build --prod && ionic cap sync ios
# Archive and upload via Xcode
```

### CI/CD

GitHub Actions automatically:
1. Runs all tests on every push to `main` or `develop`
2. Builds and pushes Docker image on merge to `main`
3. Applies DB migrations before backend deploy
4. Sends deployment status to Slack

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Follow the branching convention: `feat/`, `fix/`, `chore/`, `docs/`
4. Write tests for new logic
5. Open a Pull Request targeting `develop`
6. PR must pass all CI checks and have at least 1 review approval

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  Built with ⚡ by the TeslaCharge Team
</div>
