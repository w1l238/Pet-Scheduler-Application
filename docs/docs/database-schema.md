# Database Schema

The application uses a PostgreSQL database to store all its data. The schema is designed to be relational, with clear connections between clients, pets, appointments, and invoices.

Below is a description of each table and its columns.

---

## Client
Stores information about the users of the application.

| Column            | Type                      | Constraints                               | Description                                                                 |
| ----------------- | ------------------------- | ----------------------------------------- | --------------------------------------------------------------------------- |
| `ClientID`        | `SERIAL`                  | `PRIMARY KEY`                             | Unique identifier for the client.                                           |
| `FirstName`       | `VARCHAR(50)`             | `NOT NULL`                                | The client's first name.                                                    |
| `LastName`        | `VARCHAR(50)`             | `NOT NULL`                                | The client's last name.                                                     |
| `Email`           | `VARCHAR(100)`            | `UNIQUE`, `NOT NULL`                      | The client's email address, used for login and communication.               |
| `PhoneNumber`     | `VARCHAR(20)`             |                                           | The client's phone number.                                                  |
| `PasswordHash`    | `TEXT`                    | `NOT NULL`                                | The hashed password for the client's account.                               |
| `ProfilePhotoPath` | `TEXT` | | URL to the client's profile picture. |
| `ProfilePhotoHash` | `TEXT` | | Hash of the client's profile picture for duplicate detection. |
| `CreatedAt`       | `TIMESTAMP WITH TIME ZONE`| `DEFAULT CURRENT_TIMESTAMP`               | Timestamp of when the client account was created.                           |
| `Role`            | `VARCHAR(20)`             | `NOT NULL`, `DEFAULT 'Client'`            | The user's role, either 'Client' or 'Admin'.                                |

---

## Pet
Stores information about the clients' pets.

| Column          | Type                      | Constraints                               | Description                                                                 |
| --------------- | ------------------------- | ----------------------------------------- | --------------------------------------------------------------------------- |
| `PetID`         | `SERIAL`                  | `PRIMARY KEY`                             | Unique identifier for the pet.                                              |
| `ClientID`      | `INT`                     | `NOT NULL`, `FOREIGN KEY (Client)`        | The ID of the client who owns the pet.                                      |
| `Name`          | `VARCHAR(50)`             | `NOT NULL`                                | The pet's name.                                                             |
| `Breed`         | `VARCHAR(50)`             |                                           | The pet's breed.                                                            |
| `Age`           | `INT`                     |                                           | The pet's age.                                                              |
| `Notes`         | `TEXT`                    |                                           | Any relevant notes about the pet.                                           |
| `ProfilePhotoPath` | `TEXT` | | URL to the pet's profile picture. |
| `ProfilePhotoHash` | `TEXT` | | Hash of the pet's profile picture for duplicate detection. |
| `CreatedAt`     | `TIMESTAMP WITH TIME ZONE`| `DEFAULT CURRENT_TIMESTAMP`               | Timestamp of when the pet profile was created.                              |

---

## Service
Stores information about the services offered by the business.

| Column          | Type          | Constraints           | Description                               |
| --------------- | ------------- | --------------------- | ----------------------------------------- |
| `ServiceID`     | `SERIAL`      | `PRIMARY KEY`         | Unique identifier for the service.        |
| `Name`          | `VARCHAR(100)`| `NOT NULL`            | The name of the service.                  |
| `Description`   | `TEXT`        |                       | A description of the service.             |
| `Price`         | `DECIMAL(10, 2)`| `NOT NULL`            | The price of the service.                 |
| `DurationMinutes`| `INT`        |                       | The duration of the service in minutes.   |
| `IsActive`      | `BOOLEAN`     | `NOT NULL`, `DEFAULT TRUE` | Whether the service is currently active. |

---

## Appointment
Stores information about appointments.

| Column            | Type                      | Constraints                               | Description                                                                 |
| ----------------- | ------------------------- | ----------------------------------------- | --------------------------------------------------------------------------- |
| `AppointmentID`   | `SERIAL`                  | `PRIMARY KEY`                             | Unique identifier for the appointment.                                      |
| `ClientID`        | `INT`                     | `NOT NULL`, `FOREIGN KEY (Client)`        | The ID of the client for the appointment.                                   |
| `PetID`           | `INT`                     | `NOT NULL`, `FOREIGN KEY (Pet)`           | The ID of the pet for the appointment.                                      |
| `ServiceID`       | `INT`                     | `NOT NULL`, `FOREIGN KEY (Service)`       | The ID of the service for the appointment.                                  |
| `AppointmentTime` | `TIMESTAMP WITH TIME ZONE`| `NOT NULL`                                | The date and time of the appointment.                                       |
| `Status`          | `VARCHAR(20)`             | `DEFAULT 'Scheduled'`                     | The status of the appointment (e.g., Scheduled, Completed, Canceled).       |
| `Notes`           | `TEXT`                    |                                           | Any notes for the appointment.                                              |
| `ReminderSent24h` | `BOOLEAN`                 | `DEFAULT FALSE`                           | Flag to indicate if a 24-hour reminder has been sent.                       |
| `ReminderSent1h`  | `BOOLEAN`                 | `DEFAULT FALSE`                           | Flag to indicate if a 1-hour reminder has been sent.                        |
| `CreatedAt`       | `TIMESTAMP WITH TIME ZONE`| `DEFAULT CURRENT_TIMESTAMP`               | Timestamp of when the appointment was created.                              |

---

## Invoice
Stores information about invoices generated from completed appointments.

| Column        | Type                      | Constraints                               | Description                                                         |
| ------------- | ------------------------- | ----------------------------------------- | ------------------------------------------------------------------- |
| `InvoiceID`   | `SERIAL`                  | `PRIMARY KEY`                             | Unique identifier for the invoice.                                  |
| `AppointmentID`| `INT`                    | `NOT NULL`, `FOREIGN KEY (Appointment)`   | The ID of the appointment this invoice is for.                      |
| `Amount`      | `DECIMAL(10, 2)`          | `NOT NULL`                                | The total amount of the invoice.                                    |
| `Status`      | `VARCHAR(20)`             | `DEFAULT 'Unpaid'`                        | The status of the invoice (e.g., Unpaid, Paid).                     |
| `DueDate`     | `DATE`                    |                                           | The date the invoice is due.                                        |
| `CreatedAt`   | `TIMESTAMP WITH TIME ZONE`| `DEFAULT CURRENT_TIMESTAMP`               | Timestamp of when the invoice was created.                          |

---

## Notification
Stores notifications for clients regarding their appointments.

| Column         | Type                      | Constraints                               | Description                                                         |
| -------------- | ------------------------- | ----------------------------------------- | ------------------------------------------------------------------- |
| `NotificationID`| `SERIAL`                 | `PRIMARY KEY`                             | Unique identifier for the notification.                             |
| `ClientID`     | `INT`                     | `NOT NULL`, `FOREIGN KEY (Client)`        | The ID of the client receiving the notification.                    |
| `Message`      | `TEXT`                    | `NOT NULL`                                | The content of the notification message.                            |
| `IsRead`       | `BOOLEAN`                 | `DEFAULT FALSE`                           | Flag to indicate if the client has read the notification.           |
| `Link`         | `VARCHAR(255)`            |                                           | An optional URL link for the notification to navigate to.           |
| `CreatedAt`    | `TIMESTAMP WITH TIME ZONE`| `DEFAULT CURRENT_TIMESTAMP`               | Timestamp of when the notification was created.                     |

---

## Settings
A key-value table to store various application-wide settings and configurations.

| Column    | Type          | Constraints     | Description                               |
| --------- | ------------- | --------------- | ----------------------------------------- |
| `SettingID`| `SERIAL`     | `PRIMARY KEY`   | Unique identifier for the setting.        |
| `Name`    | `VARCHAR(255)`| `UNIQUE`, `NOT NULL` | The unique name (key) of the setting.|
| `Value`   | `TEXT`        |                 | The value of the setting.                 |

### Default Settings

The following default settings are inserted into the `Settings` table upon database initialization:

```sql
INSERT INTO Settings (Name, Value) VALUES 
('email_reminder_24h_subject', 'Reminder: Your upcoming appointment with Pet Scheduler'),
('email_reminder_24h_body', 'Dear {{client_name}},

This is a reminder that your pet, {{pet_name}}, has an appointment scheduled for {{appointment_date}} at {{appointment_time}}.

Thank you,
Pet Scheduler

--
{{business_name}}
{{business_address}}
{{business_phone}}
{{business_email}}'),
('email_reminder_1h_subject', 'Reminder: Your appointment is in one hour'),
('email_reminder_1h_body', 'Dear {{client_name}},

This is a reminder that your pet, {{pet_name}}, has an appointment in one hour at {{appointment_time}}.

See you soon,
Pet Scheduler

--
{{business_name}}
{{business_address}}
{{business_phone}}
{{business_email}}');

-- Insert default values for invoice settings
INSERT INTO Settings (Name, Value) VALUES ('invoice_due_days', '30');
INSERT INTO Settings (Name, Value) VALUES ('invoice_footer', 'Thank you for your business!');

-- Insert default values for business profile
INSERT INTO Settings (Name, Value) VALUES ('business_name', 'Pet Scheduler');
INSERT INTO Settings (Name, Value) VALUES ('business_address', '123 Main St, Anytown, USA');
INSERT INTO Settings (Name, Value) VALUES ('business_phone', '555-123-4567');
INSERT INTO Settings (Name, Value) VALUES ('business_email', 'contact@petscheduler.com');

-- Insert default values for booking and appointment rules
INSERT INTO Settings (Name, Value) VALUES ('booking_minimum_notice_hours', '24');
INSERT INTO Settings (Name, Value) VALUES ('cancellation_policy', 'Please provide at least 24 hours notice for any cancellations.');


-- Insert default values for invoice paid email
INSERT INTO Settings (Name, Value) VALUES ('invoice_paid_subject', 'Your invoice has been paid');
INSERT INTO Settings (Name, Value) VALUES ('invoice_paid_body', 'Dear {{client_name}},

This is a confirmation that your invoice for {{amount}} has been paid.

Thank you for your business!

--
{{business_name}}
{{business_address}}
{{business_phone}}
{{business_email}}');
```

These insert statements are used to create default entries for the Business Profile, Email Templates, Invoice Settings, and Booking Rules.