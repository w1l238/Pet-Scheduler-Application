-- schema.sql

-- Client Table
CREATE TABLE Client (
	ClientID SERIAL PRIMARY KEY,
	FirstName VARCHAR(50) NOT NULL,
	LastName VARCHAR(50) NOT NULL,
	Email VARCHAR(100) UNIQUE NOT NULL,
	PhoneNumber VARCHAR(20),
	PasswordHash VARCHAR(255) NOT NULL,
	ProfilePhotoURL TEXT,
	CreatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
	Role VARCHAR(20) DEFAULT 'Client' NOT NULL
);

-- Pet Table
CREATE TABLE Pet (
	PetID SERIAL PRIMARY KEY,
	ClientID INT NOT NULL,
	Name VARCHAR(50) NOT NULL,
	Breed VARCHAR(50),
	Age INT,
	Notes TEXT,
	ProfilePhotoURL TEXT,
	CreatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (ClientID) REFERENCES Client(ClientID) ON DELETE CASCADE
);

-- Service Table
CREATE TABLE Service (
	ServiceID SERIAL PRIMARY KEY,
	Name VARCHAR(100) NOT NULL,
	Description TEXT,
	Price DECIMAL(10, 2) NOT NULL,
	DurationMinutes INT
);

-- Appointment Table
CREATE TABLE Appointment (
	AppointmentID SERIAL PRIMARY KEY,
	ClientID INT NOT NULL,
	PetID INT NOT NULL,
	ServiceID INT NOT NULL,
	AppointmentTime TIMESTAMP WITH TIME ZONE NOT NULL,
	Status VARCHAR(20) DEFAULT 'Scheduled', -- e.g., Scheduled, Completed, Canceled
	Notes TEXT,
    ReminderSent24h BOOLEAN DEFAULT FALSE,
    ReminderSent1h BOOLEAN DEFAULT FALSE,
	CreatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (ClientID) REFERENCES Client(ClientID) ON DELETE CASCADE,
	FOREIGN KEY (PetID) REFERENCES Pet(PetID) ON DELETE CASCADE,
	FOREIGN KEY (ServiceID) REFERENCES Service(ServiceID)
);

-- Invoice Table
CREATE TABLE Invoice (
	InvoiceID SERIAL PRIMARY KEY,
	AppointmentID INT NOT NULL,
	Amount DECIMAL(10, 2) NOT NULL,
	Status VARCHAR(20) DEFAULT 'Unpaid', -- e.g. Unpaid, paid
	DueDate DATE,
	CreatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (AppointmentID) REFERENCES Appointment(AppointmentID) ON DELETE CASCADE
);

-- Notification Table
CREATE TABLE Notification (
    NotificationID SERIAL PRIMARY KEY,
    ClientID INT NOT NULL,
    Message TEXT NOT NULL,
    IsRead BOOLEAN DEFAULT FALSE,
    Link VARCHAR(255), -- Optional link for navigation
    CreatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ClientID) REFERENCES Client(ClientID) ON DELETE CASCADE
);

CREATE TABLE Settings (
    SettingID SERIAL PRIMARY KEY,
    Name VARCHAR(255) UNIQUE NOT NULL,
    Value TEXT
);

-- Insert default values for the email templates
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