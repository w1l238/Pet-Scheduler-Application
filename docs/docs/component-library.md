# Component Library

This document outlines the reusable React components that form the building blocks of the frontend application.

---

## Core & Layout

*   **`Navbar.js`**: The main navigation bar displayed at the top of every page. It provides links for login, registration, and navigation to different parts of the application. It also houses the notification bells.
*   **`AdminSidebar.js`**: The navigation sidebar used within the `AdminLayout` page, providing admins with links to all management pages.
*   **`ClientSidebar.js`**: The navigation sidebar used within the `ClientLayout` page, providing clients with links to their portal pages.
*   **`PrivateRoute.js`**: A higher-order component that protects routes from unauthorized access. It checks for a valid JWT and the required user role.

---

## Admin Dashboard Components

### Management Panels
These components are the primary views for admins to manage different parts of the system. They are typically rendered as full pages within the `AdminLayout`.

*   **`AllAppointments.js`**: Displays a comprehensive list of all appointments. Admins can approve, deny, or complete appointments from this view.
*   **`AllClients.js`**: Displays a list of all registered clients. Provides functionality to edit and delete users.
*   **`AllPets.js`**: Displays a list of every pet in the system, with links to their individual profile pages.
*   **`InvoiceManager.js`**: A dashboard for managing invoices. It shows revenue statistics and a searchable list of all invoices, with the ability to mark them as paid.
*   **`ServiceManager.js`**: A two-column layout for managing services. It displays usage statistics and a list of existing services, which can be clicked to edit.

### Forms & Modals
*   **`EditClientModal.js`**: A modal form for editing the details of a client, including their role.
*   **`ServiceForm.js`**: A unified form used for both creating and editing services.
*   **`EditAdminProfileModal.js`**: A modal for admins to edit their own profile information.
*   **`EditBusinessProfileModal.js`**: A modal for admins to update the public-facing business information (name, address, etc.).
*   **`EditBookingRulesModal.js`**: A modal for admins to configure appointment booking rules, like the minimum notice period.
*   **`EditEmailTemplatesModal.js`**: A modal for admins to customize the content of automated emails (e.g., reminders, payment confirmations).
*   **`EditInvoiceSettingsModal.js`**: A modal for admins to change settings related to invoicing, like the payment due period.

---

## Client Portal Components

### Management Panels
*   **`ClientAppointmentManager.js`**: Displays a list of the logged-in client's appointments, showing their status and details.
*   **`PetManager.js`**: Displays a list of the logged-in client's pets and includes the form to add a new pet.

### Forms & Modals
*   **`AddPetModal.js`**: A modal form for clients to add a new pet to their profile.
*   **`EditPetModal.js`**: A modal form for clients to edit the details of one of their pets.
*   **`EditClientProfileModal.js`**: A modal for clients to edit their own profile information.
*   **`RequestAppointmentModal.js`**: A modal form for clients to request a new appointment for one of their pets.

---

## Profile Pages

*   **`ClientProfilePage.js`**: A dedicated page that displays the full profile for a single client, including their contact information, profile photo, and a list of their pets.
*   **`PetProfilePage.js`**: A dedicated page that displays the full profile for a single pet, including their photo, breed, age, and any notes.

---

## Shared Components

*   **`AppointmentCalendar.js`**: A large, full-page calendar view that displays scheduled appointments. It is used on both the admin and client dashboards.
*   **`AppointmentListPane.js`**: A smaller pane that lists appointments for a selected day. Used in conjunction with the `AppointmentCalendar`.
*   **`Notifications.js`**: The dropdown panel for admins that shows pending appointment requests, allowing for quick approval or denial.
*   **`ClientNotifications.js`**: The dropdown panel for clients that shows status updates and other notifications related to their account.
*   **`ConfirmationModal.js`**: A generic modal used to confirm a user's action, such as deleting a record.
