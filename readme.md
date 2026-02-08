# Drone Delivery System Backend

A robust, enterprise-grade backend service designed to orchestrate a fully automated drone delivery fleet. This project implements a RESTful API using **Node.js**, **TypeScript**, and **PostgreSQL**, focusing on transactional integrity, real-time fleet management, and rigorous testing.

## 📖 Overview

The Drone Delivery System manages the interaction between customers, administrators, and autonomous drones. It solves complex logistical challenges such as battery monitoring, load management, and "Transactional Rescue"—ensuring that if a drone fails mid-flight, its orders are atomically re-queued without data loss.

### Key Features

- **Real-time Telemetry:** Drones report battery levels and GPS coordinates via heartbeat APIs.
- **ACID Transactions:** Uses Prisma interactive transactions to handle order dispatching and rescue logic.
- **API Documentation:** Full Swagger/OpenAPI documentation available.
- **Dockerized Environment:** One-command setup for App, Database, and Admin UI.
- **Resilient Architecture:** Global error handling and strict input validation using Zod.

## 🛠️ Tech Stack

| Component      | Technology       | Description                                |
| -------------- | ---------------- | ------------------------------------------ |
| **Runtime**    | Node.js (v18+)   | Server-side JavaScript runtime             |
| **Language**   | TypeScript       | Static typing for enterprise reliability   |
| **Framework**  | Express.js       | Fast, unopinionated web framework          |
| **Database**   | PostgreSQL 15    | Relational database for transactional data |
| **ORM**        | Prisma           | Type-safe database access and migrations   |
| **Validation** | Zod              | Runtime schema validation                  |
| **Testing**    | Jest & Supertest | Integration and unit testing suite         |
| **Docs**       | Swagger UI       | Interactive API documentation              |
| **Infra**      | Docker Compose   | Container orchestration                    |

## 📂 Project Structure

The project follows a modular **Layered Architecture** (Controller-Service-Repository) to ensure separation of concerns.

```bash
src/
├── config/             # Environment variables & DB connection
├── controllers/        # Request handlers (Input/Output logic)
├── middlewares/        # Global Error Handler, Auth, Validation
├── routes/             # API Route Definitions
├── services/           # Business Logic & Complex Transactions
├── utils/              # JWT, ApiError, Logger
├── app.ts              # App Setup (Separated for Testing)
└── server.ts           # Server Entry Point
tests/
├── integration/        # End-to-end API tests
└── helpers/            # Database reset & test utilities
prisma/
├── schema.prisma       # Database Schema
└── migrations/         # SQL Migration history

```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- Docker & Docker Compose

### 1. Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/your-username/drone-delivery-backend.git
cd drone-delivery-backend
npm install

```

### 2. Configuration

Create a `.env` file in the root directory:

```env
PORT=3000
NODE_ENV=development
JWT_SECRET=super_secret_key_change_me
# For Docker (Internal Network)
DATABASE_URL="postgresql://postgres:password@postgres:5432/drone_delivery?schema=public"

```

### 3. Run via Docker (Recommended)

Launch the Application, PostgreSQL database, and pgAdmin UI with a single command:

```bash
docker-compose up --build

```

- **API:** `http://localhost:3000`
- **Swagger Docs:** `http://localhost:3000/api-docs`
- **pgAdmin:** `http://localhost:5050`

### 4. Run Locally (Manual)

If you prefer running Node.js locally while using a local Postgres instance:

1. Update `.env` to use `localhost`.
2. Run migrations: `npx prisma migrate dev`.
3. Install Dependencies:

```bash
npm i
```

4. Start server:

```bash
npm run dev
```

---

## 📚 API Documentation (Swagger)

A complete, interactive API reference is generated automatically.

- **URL:** `http://localhost:3000/api-docs`
- **Postman Collection** `https://documenter.getpostman.com/view/23525113/2sBXc8qj5H`
- **Postman Collection:** [Postman Documentation](https://documenter.getpostman.com/view/23525113/2sBXc8qj5H)

You can use this UI to test endpoints, authorize with JWT tokens, and view request/response schemas.

### Key Endpoints

| Method | Endpoint            | Description                     | Access    |
| ------ | ------------------- | ------------------------------- | --------- |
| `POST` | `/auth/token`       | Login & Get Access Token        | Public    |
| `POST` | `/drones/heartbeat` | Update battery & location       | **Drone** |
| `POST` | `/drones/broken`    | Report failure & trigger rescue | **Drone** |
| `POST` | `/orders`           | Create a delivery order         | **User**  |
| `GET`  | `/orders`           | List all orders                 | **Admin** |

---

## 🧪 Testing

The project includes a comprehensive **Integration Test Suite** using Jest. Tests run against a real database to verify transactional integrity.

```bash
# Run all tests
npm test

# Run tests in watch mode (for development)
npm run test:watch

```

_Note: The test suite automatically cleans the database between runs to ensure isolation._

---

## 🔮 Future Work

We are actively planning the next phase of development to introduce a **Dual-Database Architecture** and advanced security features.

### 1. API v2: MongoDB Integration

- Implementation of a NoSQL version of the API using **MongoDB** and **Mongoose**.
- Designed to handle high-frequency telemetry data (logs, sensor data) that exceeds the scaling needs of relational tables.
- Will utilize **Joi** for schema validation.

### 2. Advanced Authentication

- **Refresh Tokens:** Implementation of a secure `refreshToken` flow to allow long-lived sessions without exposing long-lived access tokens.
- **Token Rotation:** Security hardening to detect and prevent token theft.
- **Blacklisting:** Redis-based token revocation for immediate logout capabilities.

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.
