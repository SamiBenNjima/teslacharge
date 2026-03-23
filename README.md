# ⚡ Tesla Charging Station Reservation App

A mobile application for managing Tesla charging station reservations, built with **Angular** (frontend) and **Spring Boot** (backend).

---

## 🗂️ Project Structure

```
tesla-charging-reservation/
├── frontend/        # Angular mobile app
├── backend/         # Spring Boot REST API
├── docs/            # Documentation & wireframes
└── README.md
```

---

## 🛠️ Tech Stack

| Layer     | Technology          |
|-----------|---------------------|
| Frontend  | Angular + Ionic      |
| Backend   | Spring Boot 3.x (Java 17+) |
| Database  | PostgreSQL           |
| Auth      | JWT / Spring Security |
| API       | REST                 |

---

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.x & npm
- Java 17+
- Maven 3.8+
- PostgreSQL

### Frontend

```bash
cd frontend
npm install
ng serve
```

### Backend

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

---

## 📱 Key Features

- 🔍 Browse & search available charging stations
- 📅 Book, modify & cancel reservations
- 🔔 Real-time notifications
- 👤 User authentication & profile management
- 🗺️ Map view of nearby stations

---

## 🌿 Git Branching Strategy

```
main          → production-ready code
develop       → integration branch
feature/*     → new features
fix/*         → bug fixes
release/*     → release preparation
```

---

## 👥 Contributing

1. Fork the repository
2. Create your branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m "feat: add my feature"`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request into `develop`

---

## 📄 License

This project is licensed under the MIT License.
