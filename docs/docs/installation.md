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

Edit the `.env` file in the `backend` directory with your chosen editor (we will use nano for this). This file will store your database credentials and other sensitive information.

```bash
nano .env
```

The env's structure is like so:

```
DB_USER=
DB_LOCALHOST=
DB_DATABASE=
DB_PORT=
JWT_SECRET=

EMAIL_HOST=
EMAIL_PORT=
EMAIL_USER=
EMAIL_PASS=

CRON_SECRET=
```

Refer to the [github's env file](https://github.com/w1l238/Pet-Scheduler-Application/blob/master/backend/.env) for more info for each variable.
 

### c. Set Up the Database

1.  **Create the Database:**
    Open your PostgreSQL client (e.g., `psql`) and create a new database named `pet_scheduler_db` (You can create any name but make sure to reflect that in your .env file, we will use 'pet_scheduler_db' for this example):

    ```sql
    CREATE DATABASE pet_scheduler_db;
    ```

2.  **Create the Tables:**
    Run the `schema.sql` file to create the necessary tables in your database:

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

The frontend does not require a `.env` file for basic setup. The React development server will run on `http://localhost:3000` by default.

## 4. Running the Application

### a. Start the Backend Server

In the `backend` directory, run the following command to start the Node.js server:

```bash
npm start
```

The backend server will run on `http://localhost:5000`.

### b. Start the Frontend Development Server

In the `frontend` directory, run the following command to start the React development server:

```bash
npm start
```

The frontend application will open in your default browser at `http://localhost:3000`.

You should now be able to access and use the Pet Scheduler Application.
