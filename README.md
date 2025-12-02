# TourAdvisor - Chichen Itza Virtual Tour 🏛️

[![Made with Node.js](https://img.shields.io/badge/Made%20with-Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![Powered by Express](https://img.shields.io/badge/Powered%20by-Express-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com)
[![Database: MySQL](https://img.shields.io/badge/Database-MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com)
[![Containerized with Docker](https://img.shields.io/badge/Containerized-Docker-2496ED?style=for-the-badge&logo=docker)](https://www.docker.com/)
[![Frontend: Tailwind](https://img.shields.io/badge/Frontend-Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Architecture: 3--Tier](https://img.shields.io/badge/Architecture-3--Tier-FF5722?style=for-the-badge&logo=architecture)](https://en.wikipedia.org/wiki/Multitier_architecture)

> A comprehensive distributed system for managing and experiencing virtual tours of the Chichen Itza archaeological site. Built with a robust 3-tier architecture, featuring role-based access, interactive calendars, and real-time tour management.

---

## What is TourAdvisor?

**TourAdvisor** is a specialized platform designed to bridge the gap between history and technology. It allows users to explore Chichen Itza virtually through a distributed system that manages participants, guides, and avatars in real-time. The system features distinct interfaces for users and administrators, ensuring a seamless experience for booking tours and managing the virtual environment.

---

## Key Features

- **3-Tier Architecture:** Clear separation of Presentation (Frontend), Logic (Node.js/Express), and Data (MySQL).
- **Role-Based Access Control:** Distinct capabilities for Explorers, Guides, Photographers, Researchers, and Admins.
- **Interactive Dashboards:**
    - **User Dashboard:** View available tours on a calendar, book slots, and **move your avatar** between different zones (Lobby, El Castillo, etc.).
    - **Admin Dashboard:** Master schedule view, create/edit tours with **zone assignment**, and manage active users.
- **Virtual Avatar System:** Users are represented by avatars with specific roles and permissions within the virtual space.
- **Real-Time Booking:** Instant reservation of tour slots with database persistence.
- **Dockerized:** Complete environment (App + DB) orchestrated with Docker Compose for consistent deployment.
- **Premium UI:** Built with Tailwind CSS for a responsive, dark-themed aesthetic inspired by premium travel experiences.

---

## Screenshots

### Landing Page
![Landing Page](https://images.unsplash.com/photo-1518638151313-982d9120c80b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80)

### User Dashboard
![User Dashboard](https://images.unsplash.com/photo-1552074291-ad4dfd8b11c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80)

### Admin Dashboard
![Admin Dashboard](https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80)

---

## Prerequisites

- **Docker Desktop** (Required for containerization)
- **Git** (To clone the repository)

---

## Quickstart ⚡️

### 1. Clone the repository

```bash
git clone <repository-url>
cd TourAdvisor
```

### 2. Start with Docker (Recommended)

The entire system is containerized. Run the following command to build and start the services:

```bash
docker-compose up --build -d
```

- **Web Application:** http://localhost:3000
- **Database Port:** 3307 (Mapped to avoid conflicts)

### 3. Default Credentials

The system comes pre-seeded with the following accounts for testing:

| Role | Username | Password | Access |
|------|----------|----------|--------|
| **Admin** | `admin` | `admin` | Full Admin Dashboard |
| **User** | `user` | `user` | User Dashboard & Booking |

---

## Usage Guide

### For Users 🗺️
1.  **Register/Login:** Create an account or use the default `user` credentials.
2.  **Browse Tours:** Use the **Calendar** on your dashboard to see upcoming tours.
3.  **Book a Tour:** Click "Book" on any available tour in the sidebar list.
4.  **Move Avatar:** Use the "Current Location" card to move your avatar to different zones in the virtual world.
5.  **My Bookings:** View your confirmed tours in the "My Bookings" section.

### For Administrators 🛡️
1.  **Login:** Access the system using the `admin` credentials.
2.  **Master Schedule:** View all tours across the platform on the main calendar.
3.  **Create Tours:** Use the "Create New Tour" form to schedule tours (selecting **Date** and **Time** separately) and **assign specific zones** to them.
4.  **Manage Users:** Monitor active participants and remove users if necessary.

---

## Technical Architecture

The system follows a strict **3-Tier Architecture**:

1.  **Presentation Tier (Frontend):**
    -   HTML5, Tailwind CSS, **jQuery**.
    -   Communicates with the backend via **AJAX requests (`$.ajax`)**.
    -   Uses **FullCalendar** for schedule visualization.

2.  **Logic Tier (Backend):**
    -   **Node.js & Express**: Handles API routing, business logic, and session management.
    -   **Models**: JavaScript classes (`Participante`, `Avatar`, `Recorrido`) implementing the UML design.

3.  **Data Tier (Database):**
    -   **MySQL**: Relational database storing Users, Tours, Zones, and Roles.
    -   **Persistence**: Docker volumes ensure data survives container restarts.
    -   **Schema**: Fully aligned with the project's UML Class Diagram (see `database/schema.puml`).

---

## Troubleshooting

-   **Database Connection Error:** Ensure the `db` container is healthy. If port 3306 is taken locally, the docker-compose maps it to 3307.
-   **"No space left on device":** Run `docker system prune -f` to clean up old containers/images.
-   **Login Failed:** Verify you are using the exact credentials listed above.
-   **Logs:**
    ```bash
    docker-compose logs -f app
    ```

---

## Extensions & Extra Points 🌟

This project implements the following optional extensions:

### 1. AJAX Queries with jQuery
-   **Implementation:** All frontend-backend communication (Login, Registration, Tour Booking, Zone Movement, Admin Management) has been refactored to use **jQuery AJAX (`$.ajax`)** instead of the native Fetch API.
-   **Benefit:** Provides robust cross-browser compatibility and simplified asynchronous request handling.
-   **Files:** `frontend/js/login.js`, `frontend/js/user.js`, `frontend/js/admin.js`.

### 2. Connection to a DBMS (MySQL)
-   **Implementation:** The system is fully integrated with a **MySQL** database to manage all persistent data.
-   **Entities Managed:** Users (`Participante`), Roles (`Rol`), Zones (`ZonaGeografica`), Tours (`RecorridoVirtual`), and Avatars (`Avatar`).
-   **Architecture:** The Node.js backend uses the `mysql2` driver to execute SQL queries directly against the containerized MySQL instance.

---

## License

Academic Project - Distributed Systems Course

---

**Built with ❤️ by the TourAdvisor Team — © 2025**