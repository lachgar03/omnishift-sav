# Omnishift SAV

Full-stack ticketing system for after-sales support.

##  Project Structure

- `sav-frontend/` – Frontend (React, Vite, Mantine, TypeScript)  
- `sav-backend/` – Backend (Java, Spring Boot, Maven)  
- `docker-compose.yml` – Development environment services (Postgres, Keycloak, Redis, etc.)

--------------------------------------------------------------------------------------------------

##  Getting Started

### 1. Run backend and frontend locally

#### Frontend


cd sav-frontend
yarn install
yarn dev

Copy code
cd sav-backend
mvn clean install
2. Start required services using Docker Compose
Make sure you have Docker Desktop installed and running.
From the project root, run:


docker-compose up -d
This will start:

PostgreSQL database

PgAdmin

Keycloak (Identity Provider)

Redis (cache)

Mailhog (email testing)

Check running containers with:

docker ps

To stop the containers:


docker-compose down

---------------------------------------------------------------------------------------------------------------------
Tech Stack

React + Vite + TypeScript

Java + Spring Boot + Maven

PostgreSQL, Redis, Keycloak, Mailhog (via Docker Compose)

Docker for local development environment

 Notes
Environment variables: Ensure .env files (frontend and backend) are properly configured and not committed to version control.

Keycloak: Configure Keycloak clients and realms as per your needs.

Ports: Default ports in Docker Compose are:

PostgreSQL: 5432

PgAdmin: 8082

Keycloak: 8180 (HTTP), 8543 (HTTPS)

Redis: 6379

Mailhog: 1025 (SMTP), 8025 (Web UI)

 Resources
Docker Desktop

Keycloak Documentation

PostgreSQL Documentation

React Documentation

Spring Boot Documentation

 Contributions
Feel free to open issues or submit pull requests for improvements.