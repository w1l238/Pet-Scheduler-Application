# Deployment

This application is designed to be deployed using Docker, which simplifies the process and ensures a consistent environment. However, you can use baremetal if you like.

## Prerequisites

*   A server or cloud instance (e.g., AWS EC2, DigitalOcean Droplet) with Docker and Docker Compose installed.
*   A domain name pointed at your server's IP address (recommended).
*   A way to securely connect to your server (e.g., SSH).

## Steps

### 1. Clone the Repository
Connect to your server and clone the project repository:
```bash
git clone <your-repository-url>
cd Pet-Scheduler-Application
```

### 2. Configure Environment Variables
The `docker-compose.yml` file contains the environment variables needed by the application. For a production deployment, you must edit this file directly to insert your own secrets.

Open the `docker-compose.yml` file and locate the `environment` section for the `backend` service. Replace the placeholder values with your actual production secrets:

```yaml
  backend:
    build: ./backend
    container_name: pet_scheduler_backend
    environment:
      DATABASE_URL: postgres://user:password@db:5432/pet_scheduler_db
      JWT_SECRET: your_super_secret_jwt_key_here # <-- CHANGE THIS
      EMAIL_HOST: smtp.gmail.com # <-- CHANGE THIS
      EMAIL_PORT: 587 # <-- CHANGE THIS
      EMAIL_USER: your_email@gmail.com # <-- CHANGE THIS
      EMAIL_PASS: your_gmail_app_password # <-- CHANGE THIS
      CRON_SECRET: your_cron_job_secret_key # <-- CHANGE THIS
```

Next, locate the `environment` section for the `frontend` service and update the `REACT_APP_API_BASE_URL` to point to your public domain or IP address.

```yaml
  frontend:
    build: ./frontend
    container_name: pet_scheduler_frontend
    environment:
      REACT_APP_API_BASE_URL: http://your_domain_or_ip/api # <-- CHANGE THIS
```

### 3. Build and Run the Application
With the environment variables configured, you can build and run the application in detached mode:

```bash
docker-compose up --build -d
```

*   `--build`: This flag forces Docker to rebuild the images from the Dockerfiles, which is important on the first run or after making code changes.
*   `-d`: This flag runs the containers in the background (detached mode).

Your application should now be running. The frontend will be accessible on port `80` (e.g., `http://your_domain_or_ip`) and the backend on port `5000`.

### 4. Setting Up a Reverse Proxy (Recommended)

For a production setup, it's highly recommended to use a reverse proxy like Nginx or Caddy to:
*   Handle SSL/TLS termination (HTTPS).
*   Route traffic from your domain to the appropriate container.

The `docker-compose.yml` is set up to expose the frontend on port `80` and the backend on `5000`. You would configure your reverse proxy to forward requests for `/api` to `localhost:5000` and all other requests to `localhost:80`.

### 5. Setting Up the Cron Job for Reminders

The automated email reminders rely on an external service to periodically call the `POST /api/reminders/send` endpoint.

You can set up a cron job on your host machine or use a third-party service (like `cron-job.org` or an AWS Lambda scheduled event).

A cron job on the host machine would look like this:

```bash
# Edit the crontab
crontab -e

# Add this line to run the job every 5 minutes, sending the required secret
*/5 * * * * curl -X POST -H "x-cron-secret: your_cron_job_secret_key" http://localhost:5000/api/reminders/send
```
This command sends a POST request to the reminders endpoint on the host machine, which Docker forwards to the backend container.
