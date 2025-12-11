# Configuration

This section outlines the environment variables used to configure the Pet Scheduler Application for both backend and frontend services. Proper configuration is crucial for connecting to the database, handling authentication, and managing external services like email.

## Backend Configuration

The backend service (`backend`) relies on environment variables for database connection, JWT secret, and email service credentials. These can be provided via a `.env` file for local development or directly through `docker-compose.yml` when running with Docker.

### Local Development (`backend/.env`)

When running the backend locally (outside of Docker), create a `.env` file in the `backend/` directory with the following variables:

*   **`DB_USER`**: PostgreSQL database username (e.g., `user`).
*   **`DB_HOST`**: PostgreSQL database host (e.g., `localhost`).
*   **`DB_DATABASE`**: PostgreSQL database name (e.g., `pet_scheduler_db`).
*   **`DB_PASSWORD`**: PostgreSQL database password (e.g., `password`).
*   **`DB_PORT`**: PostgreSQL database port (e.g., `5432`).
*   **`JWT_SECRET`**: A strong, secret key used for signing and verifying JSON Web Tokens (JWTs). **Crucial for security.**
*   **`EMAIL_HOST`**: SMTP host for sending emails (e.g., `smtp.ethereal.email`).
*   **`EMAIL_PORT`**: SMTP port (e.g., `587`).
*   **`EMAIL_USER`**: Username for the SMTP service.
*   **`EMAIL_PASS`**: Password for the SMTP service.
*   **`CRON_SECRET`**: A secret key to protect the `/api/reminders/send` endpoint, used for scheduled tasks.

Example `backend/.env`:
```
DB_USER=user
DB_HOST=localhost
DB_DATABASE=pet_scheduler_db
DB_PASSWORD=password
DB_PORT=5432
JWT_SECRET=your_very_secret_jwt_key_here
EMAIL_HOST=smtp.ethereal.email
EMAIL_PORT=587
EMAIL_USER=your_ethereal_email@example.com
EMAIL_PASS=your_ethereal_password
CRON_SECRET=a_strong_cron_secret
```

### Docker Deployment (`docker-compose.yml`)

When running with Docker Compose, the backend environment variables are defined directly within the `backend` service section of the `docker-compose.yml` file. The `DATABASE_URL` is used for the database connection, simplifying the configuration.

*   **`DATABASE_URL`**: The full connection string for the PostgreSQL database. This typically includes username, password, host, port, and database name (e.g., `postgres://user:password@db:5432/pet_scheduler_db`).
*   **`JWT_SECRET`**: Same as above.
*   **`EMAIL_HOST`**: Same as above.
*   **`EMAIL_PORT`**: Same as above.
*   **`EMAIL_USER`**: Same as above.
*   **`EMAIL_PASS`**: Same as above.

Example `docker-compose.yml` snippet for backend environment:
```yaml
  backend:
    # ... other configurations ...
    environment:
      DATABASE_URL: postgres://user:password@db:5432/pet_scheduler_db
      JWT_SECRET: your_jwt_secret_key
      EMAIL_HOST: smtp.ethereal.email
      EMAIL_PORT: 587
      EMAIL_USER: your_email@example.com
      EMAIL_PASS: your_email_password
      CRON_SECRET: a_strong_cron_secret
    # ...
```

## Frontend Configuration

The frontend service (`frontend`) requires environment variables to know where to connect to the backend API.

### Local Development (`frontend/.env`)

When running the frontend locally, create a `.env` file in the `frontend/` directory with the following variable:

*   **`REACT_APP_API_BASE_URL`**: The base URL of the backend API (e.g., `http://localhost:5000/api`).

Example `frontend/.env`:
```
REACT_APP_API_BASE_URL=http://localhost:5000/api
```

### Docker Deployment (`docker-compose.yml`)

When running with Docker Compose, the frontend environment variables are defined directly within the `frontend` service section of the `docker-compose.yml` file.

*   **`REACT_APP_API_BASE_URL`**: The base URL of the backend API. When running in Docker, this should refer to the backend service name within the Docker network (e.g., `http://backend:5000/api`).

Example `docker-compose.yml` snippet for frontend environment:
```yaml
  frontend:
    # ... other configurations ...
    environment:
      REACT_APP_API_BASE_URL: http://backend:5000/api
    # ...
```
