# TeslaCharge — UML Diagrams
**Application:** Mobile EV Charging Station Reservation  
**Stack:** Angular + Ionic · Spring Boot · Supabase (PostgreSQL)

---

## 1. Diagramme de Cas d'Utilisation (Use Case Diagram)

```mermaid
flowchart LR
    %% ── Actors ────────────────────────────────────────────────────
    D(["👤\nDriver"])
    S(["⚙️\nSystem"])
    OTP(["📨\nOTP Service"])
    VIN(["🔍\nVIN Validator\n(NHTSA API)"])

    %% ── System boundary ───────────────────────────────────────────
    subgraph SYS ["    🔋 TeslaCharge System    "]

        subgraph AUTH ["🔐 Authentification"]
            UC1(["Créer un compte"])
            UC2(["Se connecter"])
            UC3(["Vérifier OTP"])
            UC4(["Rafraîchir le token"])
            UC5(["Se déconnecter"])
        end

        subgraph MAP ["🗺️ Carte & Stations"]
            UC6(["Rechercher stations\nà proximité"])
            UC7(["Voir détails station"])
            UC8(["Voir disponibilités"])
        end

        subgraph RES ["📅 Réservations"]
            UC9(["Planifier une\nréservation"])
            UC10(["Annuler une\nréservation"])
            UC11(["Signaler un problème"])
            UC12(["Voir mes réservations"])
        end

        subgraph VEH ["🚗 Véhicules"]
            UC13(["Ajouter un véhicule"])
            UC14(["Sélectionner véhicule\nactif"])
            UC15(["Transférer propriété\n(vente)"])
            UC16(["Supprimer lien\nvéhicule"])
        end

        subgraph PROF ["👤 Profil"]
            UC17(["Voir tableau de bord"])
            UC18(["Modifier profil"])
            UC19(["Changer canal OTP\n(Email / WhatsApp)"])
        end
    end

    %% ── Driver associations ───────────────────────────────────────
    D --- UC1
    D --- UC2
    D --- UC4
    D --- UC5
    D --- UC6
    D --- UC7
    D --- UC8
    D --- UC9
    D --- UC10
    D --- UC11
    D --- UC12
    D --- UC13
    D --- UC14
    D --- UC15
    D --- UC16
    D --- UC17
    D --- UC18
    D --- UC19

    %% ── Include relationships ─────────────────────────────────────
    UC1 -. "«include»" .-> UC3
    UC2 -. "«include»" .-> UC3
    UC1 -. "«include»" .-> VIN
    UC13 -. "«include»" .-> VIN
    UC3 -.-> OTP
    UC9 -. "«include»" .-> UC8
    UC15 -. "«extend»" .-> UC16

    %% ── System responses ──────────────────────────────────────────
    S -. "valide & persiste" .-> UC1
    S -. "émet JWT" .-> UC2
    S -. "contrôle conflits" .-> UC9

    %% ── Styling ───────────────────────────────────────────────────
    style SYS fill:#0f1117,stroke:#e82127,color:#fff
    style AUTH fill:#1a1a2e,stroke:#e82127,color:#eee
    style MAP fill:#1a1a2e,stroke:#e82127,color:#eee
    style RES fill:#1a1a2e,stroke:#e82127,color:#eee
    style VEH fill:#1a1a2e,stroke:#e82127,color:#eee
    style PROF fill:#1a1a2e,stroke:#e82127,color:#eee

    classDef actor fill:#e82127,stroke:#fff,color:#fff,rx:50
    classDef usecase fill:#1e2a3a,stroke:#4a9eff,color:#eee,rx:20
    classDef external fill:#2d1f3d,stroke:#9b59b6,color:#eee,rx:10

    class D,S actor
    class OTP,VIN external
    class UC1,UC2,UC3,UC4,UC5,UC6,UC7,UC8,UC9,UC10,UC11,UC12,UC13,UC14,UC15,UC16,UC17,UC18,UC19 usecase
```

---

## 2. Diagramme d'Activité (Activity Diagram)

### 2.1 Flux Principal — Inscription (Sign-Up)

```mermaid
flowchart TD
    A([🚀 Lancement de l'app]) --> B{Token JWT\nvalide ?}
    B -- Oui --> HOME([🏠 Home Dashboard])
    B -- Non --> C[/Écran Sign-In/]

    C --> D[Appuyer sur\n'Créer un compte']
    D --> E[/Formulaire Unique\nd'Inscription/]

    subgraph FORM ["📋 Saisie Formulaire (1 seul écran)"]
        E --> F[Email\n+ Téléphone]
        F --> G[VIN / Num Châssis\n17 caractères]
        G --> H[Prénom + Nom\n+ Date de naissance\n+ Genre]
        H --> I[Choisir canal OTP\nEmail ou WhatsApp]
    end

    I --> J[Soumettre]

    J --> K{Validation\nBackend}

    K --> L{Email/Tél\ndéjà utilisés ?}
    L -- Oui --> E
    L -- Non --> M{VIN valide\nNHTSA ?}
    M -- Non --> N[/❌ Erreur VIN\ninvalide/]
    N --> E
    M -- Oui --> O{VIN déjà\nassigné ?}
    O -- Oui --> P[/❌ Véhicule déjà\npropriété d'un tiers/]
    P --> E
    O -- Non --> Q[Générer OTP 6 chiffres\nHash bcrypt → DB\nEnvoyer via canal choisi]

    Q --> R[/Écran Vérification OTP/]
    R --> S[Saisir le code reçu]
    S --> T{OTP correct\n& non expiré ?}
    T -- Non / Tentative < 3 --> U[/❌ Code incorrect\nX tentatives restantes/]
    U --> R
    T -- Expiré ou 3 échecs --> V[/⏱️ OTP Expiré/]
    V --> W{Renvoyer\nle code ?}
    W -- Oui → après 60s --> Q
    W -- Non --> C

    T -- Oui --> X["💾 Transaction DB\n① INSERT drivers\n② INSERT vehicles\n③ INSERT vehicle_ownerships\n④ INSERT driver_vehicles (is_selected=true)"]
    X --> Y[Émettre JWT\naccess token + refresh token]
    Y --> Z[Stocker tokens\nCapacitor SecureStorage]
    Z --> HOME

    style FORM fill:#1a1a2e,stroke:#4a9eff,color:#eee
    style HOME fill:#1e5c1e,stroke:#2ecc71,color:#fff
    style X fill:#1a3a1a,stroke:#2ecc71,color:#eee
```

### 2.2 Flux — Connexion (Sign-In)

```mermaid
flowchart TD
    A([🚀 Lancement]) --> B{Token valide ?}
    B -- Oui --> HOME([🏠 Home])
    B -- Non --> C[/Écran Sign-In/]

    C --> D["Saisir :\nEmail ou Téléphone\n+ VIN"]
    D --> E[POST /auth/signin/initiate]

    E --> F{Driver trouvé ?}
    F -- Non --> G[/❌ Compte introuvable/]
    G --> C
    F -- Oui --> H{VIN lié\nà ce driver ?}
    H -- Non --> I[/❌ VIN non associé\nà ce compte/]
    I --> C
    H -- Oui --> J[Générer & Envoyer OTP]

    J --> K[/Écran OTP/]
    K --> L[Saisir code]
    L --> M{Valide ?}
    M -- Non --> N[/Erreur + tentatives/]
    N --> K
    M -- Oui --> O[Émettre JWT]
    O --> P[Stocker tokens]
    P --> HOME

    style HOME fill:#1e5c1e,stroke:#2ecc71,color:#fff
```

### 2.3 Flux — Planification d'une Réservation

```mermaid
flowchart TD
    START([🏠 Home ou 🗺️ Map]) --> A[Ouvrir l'onglet Map]
    A --> B[Localisation GPS activée ?]
    B -- Non --> C[Saisir adresse\nmanuellement]
    B -- Oui --> D[Charger stations\nnearby]
    C --> D

    D --> E[/Carte avec marqueurs\nde stations/]
    E --> F[Sélectionner une station]
    F --> G[/Fiche station\nConnecteurs + Dispo/]

    G --> H[Choisir date/heure]
    H --> I[Choisir connecteur\ndisponible]
    I --> J[Confirmer le créneau]

    J --> K{Véhicule actif\nsélectionné ?}
    K -- Non --> L[/⚠️ Aucun véhicule actif\nAller dans Profil/]
    L --> PROF([👤 Profil — Sélectionner véhicule])
    PROF --> J

    K -- Oui --> M[POST /reservations]
    M --> N{Créneau encore\ndisponible ? DB EXCLUDE}
    N -- Conflit détecté --> O[/❌ Créneau pris\nChoisir un autre/]
    O --> H
    N -- OK --> P[/✅ Réservation CONFIRMED\nNotification push envoyée/]
    P --> Q([📅 Onglet Réservations])

    style P fill:#1e5c1e,stroke:#2ecc71,color:#fff
    style L fill:#3a1a1a,stroke:#e82127,color:#eee
    style O fill:#3a1a1a,stroke:#e82127,color:#eee
```

---

## 3. Diagramme de Classes (Class Diagram)

```mermaid
classDiagram
    direction TB

    %% ══════════════════════════════════════════════════════════════
    %% ENUMS
    %% ══════════════════════════════════════════════════════════════
    class Gender {
        <<enumeration>>
        MALE
        FEMALE
        OTHER
        PREFER_NOT
    }

    class ConnectorType {
        <<enumeration>>
        CCS
        NACS
        CHAdeMO
        TYPE2
    }

    class ReservationStatus {
        <<enumeration>>
        PENDING
        CONFIRMED
        ACTIVE
        COMPLETED
        CANCELLED
        NO_SHOW
    }

    class ConnectorStatus {
        <<enumeration>>
        AVAILABLE
        OCCUPIED
        RESERVED
        FAULTED
        OFFLINE
    }

    class OtpChannel {
        <<enumeration>>
        EMAIL
        WHATSAPP
    }

    class OtpPurpose {
        <<enumeration>>
        SIGNUP
        SIGNIN
        RESET
    }

    %% ══════════════════════════════════════════════════════════════
    %% CORE ENTITIES
    %% ══════════════════════════════════════════════════════════════

    class Driver {
        +UUID id
        +String email
        +String phone
        +String firstName
        +String lastName
        +LocalDate birthDate
        +Gender gender
        +String avatarUrl
        +boolean isActive
        +boolean emailVerified
        +boolean phoneVerified
        +Instant createdAt
        +Instant updatedAt
        ──────────────────()
        +updateProfile(dto) void
        +getActiveVehicle() Vehicle
        +getRecentSessions() List~ChargingSession~
    }

    class Vehicle {
        +UUID id
        +String vin
        +String make
        +String model
        +Short year
        +String color
        +String licensePlate
        +BigDecimal batteryCapacityKwh
        +ConnectorType connectorType
        +boolean isActive
        +Instant createdAt
        +Instant updatedAt
        ──────────────────()
        +isCompatibleWith(connector) boolean
    }

    class VehicleOwnership {
        +UUID id
        +Vehicle vehicle
        +Driver owner
        +Instant acquiredAt
        +Instant soldAt
        +String transferNote
        ──────────────────()
        +isCurrentOwner() boolean
        +transfer(newOwner, note) void
    }

    class DriverVehicle {
        +UUID id
        +Driver driver
        +Vehicle vehicle
        +boolean isSelected
        +Instant linkedAt
        ──────────────────()
        +select() void
        +deselect() void
    }

    %% ══════════════════════════════════════════════════════════════
    %% STATION & CONNECTORS
    %% ══════════════════════════════════════════════════════════════

    class Station {
        +UUID id
        +String name
        +String address
        +String city
        +String country
        +Point location
        +String operator
        +boolean isOperational
        +int totalConnectors
        +int availableConnectors
        +Map amenities
        +List~String~ photos
        +Instant createdAt
        ──────────────────()
        +getNearby(lat, lng, radius) List~Station~
        +getAvailableSlots(date) List~TimeSlot~
        +getAvailableConnectors() List~ChargingConnector~
    }

    class ChargingConnector {
        +UUID id
        +Station station
        +String connectorCode
        +ConnectorType connectorType
        +BigDecimal powerKw
        +ConnectorStatus status
        +Instant updatedAt
        ──────────────────()
        +isAvailable() boolean
        +updateStatus(status) void
    }

    %% ══════════════════════════════════════════════════════════════
    %% BOOKING
    %% ══════════════════════════════════════════════════════════════

    class Reservation {
        +UUID id
        +Driver driver
        +Vehicle vehicle
        +Station station
        +ChargingConnector connector
        +Instant scheduledStart
        +Instant scheduledEnd
        +ReservationStatus status
        +String cancelReason
        +String reportNote
        +Instant createdAt
        +Instant updatedAt
        ──────────────────()
        +confirm() void
        +cancel(reason) void
        +report(note) void
        +getDurationMinutes() long
        +isUpcoming() boolean
    }

    class ChargingSession {
        +UUID id
        +Reservation reservation
        +Driver driver
        +Vehicle vehicle
        +ChargingConnector connector
        +Instant startedAt
        +Instant endedAt
        +BigDecimal energyKwh
        +BigDecimal costEur
        +int socStartPct
        +int socEndPct
        ──────────────────()
        +start() void
        +end() void
        +getDurationMinutes() long
    }

    %% ══════════════════════════════════════════════════════════════
    %% SECURITY / OTP
    %% ══════════════════════════════════════════════════════════════

    class OtpToken {
        +UUID id
        +String identifier
        +String otpHash
        +OtpChannel otpType
        +OtpPurpose purpose
        +int attempts
        +boolean isUsed
        +Instant expiresAt
        +Instant createdAt
        ──────────────────()
        +verify(rawOtp) boolean
        +isExpired() boolean
        +incrementAttempts() void
        +invalidate() void
    }

    class AuditLog {
        +Long id
        +UUID actorId
        +String action
        +String entityType
        +UUID entityId
        +JsonNode oldData
        +JsonNode newData
        +String ipAddress
        +String userAgent
        +Instant createdAt
    }

    %% ══════════════════════════════════════════════════════════════
    %% RELATIONSHIPS
    %% ══════════════════════════════════════════════════════════════

    %% Driver ↔ Vehicle (many-to-many via DriverVehicle)
    Driver "1" --> "0..*" DriverVehicle : conduit
    Vehicle "1" --> "0..*" DriverVehicle : utilisé par

    %% Ownership history
    Driver "1" --> "0..*" VehicleOwnership : possède
    Vehicle "1" --> "0..*" VehicleOwnership : appartient à

    %% Station structure
    Station "1" *-- "1..*" ChargingConnector : contient

    %% Reservation
    Driver "1" --> "0..*" Reservation : effectue
    Vehicle "1" --> "0..*" Reservation : utilisé dans
    Station "1" --> "0..*" Reservation : héberge
    ChargingConnector "1" --> "0..*" Reservation : assigné à

    %% Session
    Reservation "0..1" --> "0..1" ChargingSession : génère
    Driver "1" --> "0..*" ChargingSession : participe à
    Vehicle "1" --> "0..*" ChargingSession : chargé dans
    ChargingConnector "1" --> "0..*" ChargingSession : fournit énergie

    %% OTP
    Driver "1" --> "0..*" OtpToken : reçoit

    %% Enum usage
    Driver --> Gender
    Vehicle --> ConnectorType
    ChargingConnector --> ConnectorType
    ChargingConnector --> ConnectorStatus
    Reservation --> ReservationStatus
    OtpToken --> OtpChannel
    OtpToken --> OtpPurpose
```

---

## Légende

| Symbole | Signification |
|---|---|
| `1 --> 0..*` | Association directionnelle (un à plusieurs) |
| `1 *-- 1..*` | Composition (cycle de vie lié) |
| `0..1 --> 0..1` | Association optionnelle des deux côtés |
| `<<enumeration>>` | Type énuméré |
| `«include»` | Relation d'inclusion (cas d'utilisation) |
| `«extend»` | Relation d'extension optionnelle |

> **Note :** Les diagrammes sont écrits en syntaxe [Mermaid](https://mermaid.js.org/) et sont rendus nativement par GitHub, GitLab, Notion, VS Code (extension Mermaid) et la plupart des wikis modernes.
