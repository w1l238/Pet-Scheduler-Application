# Technology Stack

This project utilizes a modern, robust technology stack to deliver a full-featured web application.

## Core Technologies

*   **Frontend:** The client-side application is built with **React**, a popular JavaScript library for building user interfaces. It uses `react-router-dom` for navigation and `axios` for communicating with the backend API.

*   **Backend:** The server-side application is powered by **Node.js** and the **Express** framework, creating a fast and efficient RESTful API.

*   **Database:** All application data is stored in a **PostgreSQL** relational database, chosen for its reliability and feature set.

## Containerization & Deployment

*   **Docker & Docker Compose:** The entire application (frontend, backend, and database) is containerized using **Docker**. `docker-compose.yml` is used to define and run the multi-container application in an isolated environment, ensuring consistency across development, testing, and production.

*   **Nginx:** The production-ready frontend container uses **Nginx** as a lightweight web server to serve the static React files and properly handle single-page application (SPA) routing.
