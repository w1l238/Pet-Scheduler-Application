---
sidebar_position: 2
title: Baremetal Installation
---

# Installation Guide (Baremetal)

This guide will walk you through the steps to set up and run the Pet Scheduler Application on your local machine. IF you would like to run this in docker please skip this and go to the **`Running With Docker`** section.

## 1. Clone the Repository

First, clone the project repository from GitHub to your local machine:

```bash
git clone https://github.com/w1l238/Pet-Scheduler-Application
cd Pet-Scheduler-Application
```

## 2. Backend Setup

### a. Install Dependencies

Navigate to the `backend` directory and install the required npm packages:

```bash
cd backend
npm install
```

### b. Configure Environment Variables

Create a `.env` file in the `backend` directory. This file will store your database credentials and other sensitive information.

```bash
nano backend/.env
```

Add the following variables, replacing the values with your local configuration:

```
# PostgreSQL Database Credentials
DB_USER=your_db_user
DB_HOST=localhost
DB_DATABASE=pet_scheduler_db
DB_PASSWORD=your_db_password
DB_PORT=5432

# JWT Secret for authentication
JWT_SECRET=your_very_secret_jwt_key_here

# Email Service Credentials (e.g., for Ethereal, Mailgun)
EMAIL_HOST=smtp.ethereal.email
EMAIL_PORT=587
EMAIL_USER=your_email_user
EMAIL_PASS=your_email_password

# Secret for protecting the cron job endpoint
CRON_SECRET=a_strong_cron_secret
```

### c. Set Up the Database

1.  **Create the Database:**
    Open your PostgreSQL client (e.g., `psql`) and create a new database. We will use `pet_scheduler_db` for this example, but you can use any name as long as it matches your `.env` file.

    ```sql
    CREATE DATABASE pet_scheduler_db;
    ```

2.  **Create the Tables:**
    While in the `backend` directory, run the `schema.sql` file to create the necessary tables in your new database:

    ```bash
    psql -d pet_scheduler_db -f schema.sql
    ```

## 3. Frontend Setup

### a. Install Dependencies

In a new terminal, navigate to the `frontend` directory and install the required npm packages:

```bash
cd frontend
npm install
```

### b. Configure Environment Variables

Create a `.env` file in the `frontend` directory to tell the React application where to find the backend API.

```bash
nano frontend/.env
```

Add the following line. This URL must point to your local backend server.

```
REACT_APP_API_BASE_URL=http://localhost:5000/api
```

## 4. Running the Application

### a. Start the Backend Server

In the `backend` directory, run the following command to start the Node.js server:

```bash
node server.js
```

The backend server will run on `http://localhost:5000`.

### b. Start the Frontend Development Server

In the `frontend` directory, run the following command to start the React development server:

```bash
npm start
```

The frontend application will open in your default browser at `http://localhost:3000`.

You should now be able to access and use the Pet Scheduler Application.
