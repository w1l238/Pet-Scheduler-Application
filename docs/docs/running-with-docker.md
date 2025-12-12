---
sidebar_position: 3
title: Running with Docker
---

# Running with Docker

This guide will walk you through the steps to set up and run the Pet Scheduler Application using Docker and Docker Compose.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

*   [Docker](https://www.docker.com/products/docker-desktop/)
*   [Docker Compose](https://docs.docker.com/compose/install/) (usually included with Docker Desktop)

## 1. Clone the Repository

If you haven't already, clone the project repository from GitHub to your local machine:

```bash
git clone https://github.com/w1l238/Pet-Scheduler-Application
cd Pet-Scheduler-Application
```

## 2. Configure Environment Variables

The `docker-compose.yml` file is pre-configured with the necessary environment variables for the services to communicate with each other. However, you might want to review and customize them, especially the secrets.

### a. Backend Environment Variables

The backend service in `docker-compose.yml` has the following environment variables:

*   `DATABASE_URL`: The connection string for the PostgreSQL database. This is already set to connect to the `db` service.
*   `JWT_SECRET`: A secret key for signing JSON Web Tokens. It's recommended to change this to a long, random string.
*   `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`: Credentials for the email service. You should replace the placeholder values with your actual email service credentials.

### b. Frontend Environment Variables

The frontend service in `docker-compose.yml` has the following environment variable:

*   `REACT_APP_API_BASE_URL`: The base URL for the backend API. This is already set to connect to the `backend` service.

## 3. Build and Run the Application

Once you have reviewed the environment variables, you can build and run the application using a single command from the root of the project directory:

```bash
docker-compose up --build
```

This command will:
1.  Build the Docker images for the `frontend` and `backend` services.
2.  Create and start the `db`, `backend`, and `frontend` containers in the correct order.
3.  The PostgreSQL database will be initialized with the schema from `backend/schema.sql`.

## 4. Accessing the Application

Once the containers are up and running, you can access the application in your web browser:

*   **Frontend:** [http://localhost](http://localhost) (Nginx is configured to serve the React app on port 80)
*   **Backend:** The backend is not directly accessible from the host machine, but it's running on port 5000 inside the Docker network.
*   **Database:** The PostgreSQL database is accessible on port **5433** on the host machine.

## 5. Stopping the Application

To stop the application, press `Ctrl+C` in the terminal where `docker-compose` is running.

To stop and remove the containers, run:

```bash
docker-compose down
```

This will stop and remove the containers, but the database data will be preserved in a Docker volume named `db_data`. If you want to remove the data in it's entirety use:

```bash
docker-compose down -v
```

This will delete all data in the container. Thus restarting the database from scratch when running the container again.

# 6. Promoting your role

The default role for every account is 'client'. If you need to promote your account to admin (where there is no current admin account in the database). Run this command in your docker container (assuming you want to promote the first account to admin):

```bash
docker exec -it pet_scheduler_db psql -U user -d pet_scheduler_db -c "UPDATE Client SET Role = 'Admin' WHERE ClientID = 1;"
```

This will promote the account to admin status and unlock all management features.