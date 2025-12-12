# API Endpoints

This document provides a detailed reference for the backend RESTful API.

## Authentication

Most endpoints are protected and require a JSON Web Token (JWT) to be sent in the `Authorization` header of the request.

`Authorization: Bearer <YOUR_JWT_TOKEN>`

Roles (`Admin`, `Client`) are used to control access to certain endpoints.

---

## Public Routes

### Auth

*   **`POST /api/auth/register`**
    *   **Description:** Registers a new client.
    *   **Request Body:** `{ "FirstName": "John", "LastName": "Doe", "Email": "john.doe@example.com", "PhoneNumber": "555-123-4567", "Password": "password123" }`
    *   **Response:** `{ "message": "User registrered successfully", "user": { "ClientID": 1, "Email": "john.doe@example.com", "Role": "Client" } }`

*   **`POST /api/auth/login`**
    *   **Description:** Logs in a client and returns a JWT.
    *   **Request Body:** `{ "Email": "john.doe@example.com", "Password": "password123" }`
    *   **Response:** `{ "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }`

### Public Appointments

*   **`GET /api/public/appointments/booked-times`**
    *   **Description:** Retrieves a list of all currently booked time slots (for 'Scheduled' or 'Pending' appointments) to be displayed on a public-facing calendar. This helps prevent double-booking.
    *   **Response:** `[{ "start": "...", "end": "..." }]`

---

## Protected Routes

## Clients

*   **`GET /api/clients`**
    *   **Auth:** Admin
    *   **Description:** Retrieves a list of all clients.
    *   **Response:** `[ { "ClientID": 1, "FirstName": "John", ... } ]`

*   **`GET /api/clients/:id`**
    *   **Auth:** Admin, or the client themselves.
    *   **Description:** Retrieves a single client by their ID.
    *   **Response:** `{ "ClientID": 1, "FirstName": "John", ... }`

*   **`PUT /api/clients/:id`**
    *   **Auth:** Admin, or the client themselves.
    *   **Description:** Updates a client's information. Non-admins cannot change their role.
    *   **Request Body:** `{ "FirstName": "Johnny", "PhoneNumber": "555-555-5555" }`
    *   **Response:** `{ "ClientID": 1, "FirstName": "Johnny", ... }`

*   **`DELETE /api/clients/:id`**
    *   **Auth:** Admin
    *   **Description:** Deletes a client by their ID.
    *   **Response:** `{ "message": "Client deleted successfully" }`

## Pets

*   **`GET /api/pets`**
    *   **Auth:** Admin
    *   **Description:** Retrieves a list of all pets in the system, including owner information.
    *   **Response:** `[ { "PetID": 1, "Name": "Buddy", "FirstName": "John", ... } ]`

*   **`GET /api/pets/:id`**
    *   **Auth:** Admin, or the pet's owner.
    *   **Description:** Retrieves a single pet by its ID.
    *   **Response:** `{ "PetID": 1, "Name": "Buddy", ... }`

*   **`GET /api/clients/:clientId/pets`**
    *   **Auth:** Admin, or the client themselves.
    *   **Description:** Retrieves all pets belonging to a specific client.
    *   **Response:** `[ { "PetID": 1, "Name": "Buddy", ... } ]`

*   **`POST /api/pets`**
    *   **Auth:** Authenticated User (for their own profile)
    *   **Description:** Adds a new pet to the authenticated user's profile.
    *   **Request Body:** `{ "ClientID": 1, "Name": "Lucy", "Breed": "Golden Retriever", ... }`
    *   **Response:** `{ "PetID": 2, "Name": "Lucy", ... }`

*   **`PUT /api/pets/:id`**
    *   **Auth:** Admin, or the pet's owner.
    *   **Description:** Updates a pet's information.
    *   **Request Body:** `{ "Name": "Lucy", "Age": 3 }`
    *   **Response:** `{ "PetID": 2, "Name": "Lucy", "Age": 3, ... }`

*   **`DELETE /api/pets/:id`**
    *   **Auth:** Admin, or the pet's owner.
    *   **Description:** Deletes a pet by its ID.
    *   **Response:** `{ "message": "Pet deleted successfully" }`

## Appointments

*   **`GET /api/appointments`**
    *   **Auth:** Admin
    *   **Description:** Retrieves all appointments. Can be filtered by status with a query parameter (e.g., `?status=Pending`).
    *   **Response:** `[ { "AppointmentID": 1, "Status": "Scheduled", ... } ]`

*   **`GET /api/appointments/:id`**
    *   **Auth:** Admin, or the involved client.
    *   **Description:** Retrieves a single appointment by its ID.
    *   **Response:** `{ "AppointmentID": 1, "Status": "Scheduled", ... }`

*   **`GET /api/clients/:clientId/appointments`**
    *   **Auth:** Admin, or the client themselves.
    *   **Description:** Retrieves all appointments for a specific client.
    *   **Response:** `[ { "AppointmentID": 1, ... } ]`

*   **`POST /api/appointments`**
    *   **Auth:** Authenticated User
    *   **Description:** Creates a new appointment. Prevents double-booking and enforces minimum notice periods.
    *   **Request Body:** `{ "ClientID": 1, "PetID": 1, "ServiceID": 1, "AppointmentTime": "...", "Status": "Pending" }`
    *   **Response:** `{ "AppointmentID": 2, ... }`

*   **`PUT /api/appointments/:id`**
    *   **Auth:** Admin, or the involved client.
    *   **Description:** Updates an appointment's status or details. If an admin changes the status, a notification is created for the client. If status is changed to 'Completed', an invoice is automatically generated.
    *   **Request Body:** `{ "status": "Completed" }`
    *   **Response:** `{ "AppointmentID": 1, "Status": "Completed", ... }`

*   **`DELETE /api/appointments/:id`**
    *   **Auth:** Admin, or the involved client.
    *   **Description:** Deletes an appointment.
    *   **Response:** `{ "message": "Appointment deleted successfully" }`

## Services

*   **`GET /api/services`**
    *   **Auth:** Authenticated User
    *   **Description:** Retrieves all active services.
    *   **Response:** `[ { "ServiceID": 1, "Name": "Grooming", ... } ]`

*   **`GET /api/services/stats`**
    *   **Auth:** Admin
    *   **Description:** Retrieves usage statistics for each service.
    *   **Response:** `{ "1": "10", "2": "5" }` (ServiceID: usage_count)

*   **`POST /api/services`**
    *   **Auth:** Admin
    *   **Description:** Creates a new service.
    *   **Request Body:** `{ "Name": "Nail Trim", "Price": 15.00, ... }`
    *   **Response:** `{ "ServiceID": 3, "Name": "Nail Trim", ... }`

*   **`PUT /api/services/:id`**
    *   **Auth:** Admin
    *   **Description:** Updates a service's details.
    *   **Response:** `{ "ServiceID": 3, "Price": 20.00, ... }`

*   **`DELETE /api/services/:id`**
    *   **Auth:** Admin
    *   **Description:** Soft-deletes a service by marking it as inactive.
    *   **Response:** `{ "message": "Service archived successfully" }`

## Invoices

*   **`GET /api/invoices`**
    *   **Auth:** Admin
    *   **Description:** Retrieves all invoices, including client and pet names.
    *   **Response:** `[ { "InvoiceID": 1, "Amount": 50.00, "Status": "Unpaid", ... } ]`

*   **`PUT /api/invoices/:id`**
    *   **Auth:** Admin
    *   **Description:** Updates an invoice, typically to mark it as 'Paid'. Sends a confirmation email to the client upon payment.
    *   **Request Body:** `{ "status": "Paid" }`
    *   **Response:** `{ "InvoiceID": 1, "Status": "Paid", ... }`

## Notifications

*   **`GET /api/client/notifications`**
    *   **Auth:** Client
    *   **Description:** Retrieves all unread notifications for the logged-in client.
    *   **Response:** `[ { "NotificationID": 1, "Message": "Your appointment has been approved.", ... } ]`

*   **`PUT /api/notifications/read-all`**
    *   **Auth:** Client
    *   **Description:** Marks all of the logged-in client's notifications as read.
    *   **Response:** `204 No Content`

## Settings

*   **`GET /api/settings`**
    *   **Auth:** Admin
    *   **Description:** Retrieves all application settings as a key-value map.
    *   **Response:** `{ "business_name": "Pet Scheduler", "invoice_due_days": "30", ... }`

*   **`PUT /api/settings`**
    *   **Auth:** Admin
    *   **Description:** Updates multiple settings at once.
    *   **Request Body:** `{ "business_name": "My Grooming Business", "cancellation_policy": "48 hours notice required." }`
    *   **Response:** `{ "message": "Settings updated successfully" }`

## Reminders

*   **`POST /api/reminders/send`**
    *   **Auth:** Cron Job (Requires `x-cron-secret` header)
    *   **Description:** A protected endpoint designed to be called by an external scheduling service (like a cron job). It scans for upcoming appointments and sends 24-hour and 1-hour email reminders.
    *   **Response:** `{ "message": "Reminder check completed.", "sent24h": 1, "sent1h": 0 }`
