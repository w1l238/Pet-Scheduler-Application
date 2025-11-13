const { sendEmail } = require('./emailService')
require('dotenv').config();
const pool = require('./db');

const express = require('express');
const { authenticateToken, authorizeRoles } = require('./middleware/auth');
const authRoutes = require('./routes/auth');

const app = express();
const port = 5000;

app.use(express.json()); // Middleware to parse JSON bodies

// --- Public Routes ---

// -- Test Routes --
app.get('/', (req, res) => {
	res.send('Hello from the backend!');
});

// Auth routes (register, login)
app.use('/api/auth', authRoutes);

// --- Protected Routes ---

// -- Client API Endpoints --

// GET all clients (ADMIN ONLY)
app.get('/api/clients', authenticateToken, authorizeRoles(['Admin']),  async (req, res) => {
	try {
		const { rows } = await pool.query('SELECT ClientID, FirstName, LastName, Email, PhoneNumber, Role, CreatedAt FROM Client');
		res.json(rows);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server error');
	}
});

// GET a single client by ID (Admin OR Client)
app.get('/api/clients/:id', authenticateToken, async (req, res) => {
	try {
		const { id } = req.params;
		// Check if the authenticated user is an Admin or is requesting their own info
		if (req.user.role !== 'Admin' && req.user.id !== parseInt(id, 10)) {
			return res.status(403).json({ message: 'Access denied' });
		}
		const { rows } = await pool.query('SELECT ClientID, FirstName, LastName, Email, PhoneNumber, Role, CreatedAt FROM Client WHERE ClientID = $1', [id]);
		if (rows.length === 0) {
			return res.status(404).json({ message: 'Client not found' });
		}
		res.json(rows[0]);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server error');
	}
});

// PUT (update) a client by ID
app.put('/api/clients/:id', authenticateToken, async (req, res) => {
	try {
		const { id } = req.params;
		// Check if the authticated user is an Admin or is updating their own info
		if (req.user.role !== 'Admin' && req.user.id !== parseInt(id, 10)) {
			return res.status(403).json({ message: 'Access denied' });
		}
		const { FirstName, LastName, Email, PhoneNumber } = req.body;
		const { rows } = await pool.query(
			'UPDATE Client SET FirstName = $1, LastName = $2, Email = $3, PhoneNumber = $4 WHERE ClientID = $5 RETURNING ClientID, FirstName, LastName, Email, PhoneNumber',
			[FirstName, LastName, Email, PhoneNumber, id]
		);
		if (rows.length === 0) {
			return res.status(404).json({ message: 'Client not found' });
		}
		res.json(rows[0]);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server error');
	}
});

// DELETE a client by ID (ADMIN ONLY)
app.delete('/api/clients/:id', authenticateToken, authorizeRoles(['Admin']), async (req, res) => {
	try {
		const { id } = req.params;
		const { rowCount } = await pool.query('DELETE FROM Client WHERE ClientID = $1', [id]);
		if (rowCount === 0) {
			return res.status(404).json({ message: 'Client not found' });
		}
		res.json({ message: 'Client deleted successfully' });
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server error');
	}
});

// -- Pet API Endpoints --

// GET all pets (ADMIN ONLY)
app.get('/api/pets', authenticateToken, authorizeRoles(['Admin']), async (req, res) => {
	try {
		const { rows } = await pool.query('SELECT * FROM Pet ORDER BY PetID ASC');
		res.json(rows);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server error');
	}
});

// GET a single pet by ID (Admin OR pet owner)
app.get('/api/pets/:id', authenticateToken, async (req, res) => {
	try {
		const { id } = req.params;
		const { rows } = await pool.query('SELECT * FROM Pet WHERE PetID = $1', [id]);
		if (rows.length === 0) {
			return res.status(404).json({ message: 'Pet not found' });
		}
		// Check if the authenticated user is an Admin or the pet's owner
		if (req.user.role !== 'Admin' && req.user.id !== rows[0].clientid) {
			return res.status(403).json({ message: 'Access denied' });
		}
		res.json(rows[0]);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server error');
	}
});

// GET all pets for a specific client (Admin OR client)
app.get('/api/clients/:clientId/pets', authenticateToken, async (req, res) => {
	try {
		const { clientId } = req.params;
		if (req.user.role !== 'Admin' && req.user.id !== parseInt(clientId, 10)) {
			return res.status(403).json({ message: 'Access denied' });
		}
		const { rows } = await pool.query('SELECT * FROM Pet WHERE ClientID = $1 ORDER BY PetID ASC', [clientId]);
		res.json(rows);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server error');
	}
});

// POST a new pet (Authenicated users for their own client ID)
app.post('/api/pets', authenticateToken, async (req, res) => {
	try {
		const { ClientID, Name, Breed, Age, Notes } = req.body;
		// Ensure users can only add pets to their own profile
		if (req.user.id !== ClientID) {
			return res.status(403).json({ message: 'Access denied: You can only add pets to your own profile.' });
		}
		const { rows } = await pool.query (
			'INSERT INTO Pet (ClientID, Name, Breed, Age, Notes) VALUES ($1, $2, $3, $4, $5) RETURNING *',
			[ClientID, Name, Breed, Age, Notes]
		);
		res.status(201).json(rows[0]);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server error');
	}
});

// PUT (update) a pet by ID (Admin OR pet owner)
app.put('/api/pets/:id', authenticateToken, async (req, res) => {
	try {
		const { id } = req.params;
		const { ClientID, Name, Breed, Age, Notes } = req.body;

		// Get the pet to check ownership
		const petResult = await pool.query('SELECT ClientID FROM Pet WHERE PetID = $1', [id]);
		if (petResult.rows.length === 0) {
			return res.status(404).json({ message: 'Pet not found' });
		}
		if (req.user.role !== 'Admin' && req.user.id !== petResult.rows[0].clientid) {
			return res.status(403).json({ message: 'Access denied' });
		}

		const { rows } = await pool.query(
			'UPDATE Pet SET ClientID = $1, Name = $2, Breed = $3, Age = $4, Notes = $5 WHERE PetID = $6 RETURNING *',
			[ClientID, Name, Breed, Age, Notes, id]
		);
		res.json(rows[0]);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server error');
	}
});

// DELETE a pet by ID (Admin OR pet owner)
app.delete('/api/pets/:id', authenticateToken , async (req, res) => {
	try {
		const { id } = req.params;

		// Get the pet to check ownership
		const petResult = await pool.query('SELECT ClientID FROM Pet WHERE PetID = $1', [id]);
		if (petResult.rows.length === 0) {
			return res.status(404).json({ message: 'Pet not found' });
		}
		if (req.user.role !== 'Admin' && req.user.id !== petResult.rows[0].clientid) {
			return res.status(403).json({ message: 'Access denied' });
		}

		const { rowCount } = await pool.query('DELETE FROM Pet WHERE PetID = $1', [id]);
		if (rowCount === 0) {
			return res.status(404).json({ message: 'Pet not found' });
		}
		res.json({ message: 'Pet deleted successfully' });
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server error');
	}
});


// --- Appointment API Endpoints ---

// GET all appointments (ADMIN ONLY)
app.get('/api/appointments', authenticateToken, authorizeRoles(['Admin']), async (req, res) => {
	try {
		const { rows } = await pool.query('SELECT * FROM Appointment ORDER BY AppointmentID ASC');
		res.json(rows);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server error');
	}
});

// GET a single appointment by ID (Admin OR involved client)
app.get('/api/appointments/:id', authenticateToken, async (req, res) => {
	try {
		const { id } = req.params;
		const { rows } = await pool.query('SELECT * FROM Appointment WHERE AppointmentID = $1', [id]);
		if (rows.length === 0) {
			return res.status(404).json({ message: 'Appointment not found' });
		}
		if (req.user.role !== 'Admin' && req.user.id !== rows[0].clientid) {
			return res.status(403).json({ message: 'Access denied' });
		}
		res.json(rows[0]);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server error');
	}
});

// GET all appointments for a specific client (Admin OR the client)
app.get('/api/clients/:clientId/appointments', authenticateToken, async (req, res) => {
	try {
		const { clientId } = req.params;
		if (req.user.role !== 'Admin' && req.user.id !== parseInt(clientId, 10)) { 
			return res.status(403).json({ message: 'Access denied' });
		}
		const { rows } = await pool.query('SELECT * FROM Appointment WHERE ClientID = $1 ORDER BY AppointmentID ASC', [clientId]);
		res.json(rows);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server error');
	}
});

// POST a new appointment (Authenticated users)
app.post('/api/appointments', authenticateToken, async (req, res) => {
	try {
		const { ClientID, PetID, ServiceID, AppointmentTime, Status, Notes } = req.body;
		if (req.user.role !== 'Admin' && req.user.id !== ClientID) {
			return res.status(403).json({ message: 'Access denied: You can only create appointments for yourself.' });
		}

		const { rows } = await pool.query(
			'INSERT INTO Appointment (ClientID, PetID, ServiceID, AppointmentTime, Status, Notes) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
			[ClientID, PetID, ServiceID, AppointmentTime, Status, Notes]
		);
		res.status(201).json(rows[0]);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server error');
	}
});

// PUT (update) an appointment by ID (Admin OR client)
app.put('/api/appointments/:id', authenticateToken, async (req, res) => {
	try {
		const { id } = req.params;
		const { ClientID, PetID, ServiceID, AppointmentTime, Status, Notes } = req.body;

		const aptResult = await pool.query('SELECT ClientID FROM Appointment WHERE AppointmentID = $1', [id]);
		if (aptResult.rows.length === 0) {
			return res.status(404).json({ message: 'Appointment not found' });
		}
		if (req.user.role !== 'Admin' && req.user.id !== aptResult.rows[0].clientid) {
			return res.status(403).json({ message: 'Access denied' });
		}

		const { rows } = await pool.query(
			'UPDATE Appointment SET ClientID = $1, PetID = $2, ServiceID = $3, AppointmentTime = $4, Status = $5, Notes = $6 WHERE AppointmentID = $7 RETURNING *',
			[ClientID, PetID, ServiceID, AppointmentTime, Status, Notes, id]
		);
		res.json(rows[0]);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server error');
	}
});

// DELETE an appointment by ID (Admin OR client)
app.delete('/api/appointments/:id', authenticateToken, async (req, res) => {
	try {
		const { id } = req.params;

		const aptResult = await pool.query('SELECT ClientID FROM Appointment WHERE AppointmentID = $1', [id]);
		if (aptResult.rows.length === 0) {
			return res.status(404).json({ message: 'Appointment not found' });
		}
		if (req.user.role !== 'Admin' && req.user.id !== aptResult.rows[0].clientid) {
			return res.status(403).json({ message: 'Access denied' });
		}

		const { rowCount } = await pool.query('DELETE FROM Appointment WHERE AppointmentID = $1', [id]);
		if (rowCount === 0) {
			return res.status(404).json({ message: 'Appointment not found' });
		}
		res.json({ message: 'Appointment deleted successfully' });
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server error');
	}
});


// --- Service API Endpoints --- (ADMIN ONLY)

// GET all services
app.get('/api/services', authenticateToken, async (req, res) => {
	try {
		const { rows } = await pool.query('SELECT * FROM Service ORDER BY ServiceID ASC');
		res.json(rows);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server error');
	}
});

// GET a single service by ID
app.get('/api/services/:id', authenticateToken, async (req, res) => {
	try {
		const { id } = req.params;
		const { rows } = await pool.query('SELECT * FROM Service WHERE ServiceID = $1', [id]);
		if (rows.length === 0) {
			return res.status(404).json({ message: 'Service not found' });
		}
		res.json(rows[0]);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server error');
	}
});

// POST a new service
app.post('/api/services', authenticateToken, authorizeRoles(['Admin']), async (req, res) => {
	try {
		const { Name, Description, Price, DurationMinutes } = req.body;
		const { rows } = await pool.query(
			'INSERT INTO Service (Name, Description, Price, DurationMinutes) VALUES ($1, $2, $3, $4) RETURNING *',
			[Name, Description, Price, DurationMinutes]
		);
		res.status(201).json(rows[0]);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server error');
	}
});

// PUT (update) a service by ID
app.put('/api/services/:id', authenticateToken, authorizeRoles(['Admin']), async (req, res) => {
	try {
		const { id } = req.params;
		const { Name, Description, Price, DurationMinutes } = req.body;
		const { rows } = await pool.query(
			'UPDATE Service SET Name = $1, Description = $2, Price = $3, DurationMinutes = $4 WHERE ServiceID = $5 RETURNING *',
			[Name, Description, Price, DurationMinutes, id]
		);
		if (rows.length === 0) {
			return res.status(404).json({ message: 'Service not found' });
		}
		res.json(rows[0]);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server error');
	}
});

// DELETE a service by ID
app.delete('/api/services/:id', authenticateToken, authorizeRoles(['Admin']), async (req, res) => {
	try {
		const { id } = req.params;
		const { rowCount } = await pool.query('DELETE FROM Service WHERE ServiceID = $1', [id]);
		if (rowCount === 0) {
			return res.status(404).json({ message: 'Service not found' });
		}
		res.json({ message: 'Service deleted successfully' });
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Service error');
	}
});

// --- Invoice API Endpoints --- (ADMIN ONLY)

// GET all invoices
app.get('/api/invoices', authenticateToken, authorizeRoles(['Admin']), async (req, res) => {
	try {
		const { rows } = await pool.query('SELECT * FROM Invoice ORDER BY InvoiceID ASC');
		res.json(rows);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server error');
	}
});

// GET a single invoice by ID
app.get('/api/invoices/:id', authenticateToken, authorizeRoles(['Admin']), async (req, res) => {
	try {
		const { id } = req.params;
		const { rows } = await pool.query('SELECT * FROM Invoice WHERE InvoiceID = $1', [id]);
		if (rows.length === 0) {
			return res.status(404).json({ message: 'Invoice not found' });
		}
		res.json(rows[0]);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server error');
	}
});

// GET invoice for a specific appointment
app.get('/api/appointments/:appointmentId/invoice', authenticateToken, authorizeRoles(['Admin']), async (req, res) => {
	try {
		const { appointmentId } = req.params;
		const { rows } = await pool.query('SELECT * FROM Invoice WHERE AppointmentID = $1', [appointmentId]);
		if (rows.length === 0) {
			return res.status(404).json({ message: 'Invoice not found for this appointment' });
		}
		res.json(rows[0]);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server error');
	}
});

// POST a new invoice
app.post('/api/invoices', authenticateToken, authorizeRoles(['Admin']), async (req, res) => {
	try {
		const { AppointmentID, Amount, Status, DueDate } = req.body;
		const { rows } = await pool.query(
			'INSERT INTO Invoice (AppointmentID, Amount, Status, DueDate) VALUES ($1, $2, $3, $4) RETURNING *',
			[AppointmentID, Amount, Status, DueDate]
		);
		res.status(201).json(rows[0]);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server error');
	}
});

// PUT (update) an invoice by ID
app.put('/api/invoices/:id', authenticateToken, authorizeRoles(['Admin']), async (req, res) => {
	try {
		const { id } = req.params;
		const { AppointmentID, Amount, Status, DueDate } = req.body;
		const { rows } = await pool.query(
			'UPDATE Invoice SET AppointmentID = $1, Amount = $2, Status = $3, DueDate = $4 WHERE InvoiceID = $5 RETURNING *',
			[AppointmentID, Amount, Status, DueDate, id]
		);
		if (rows.length === 0) {
			return res.status(404).json({ message: 'Invoice not found' });
		}
		res.json(rows[0]);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server error');
	}
});

// DELETE an invoice by ID
app.delete('/api/invoices/:id', authenticateToken, authorizeRoles(['Admin']), async (req, res) => {
	try {
		const { id } = req.params;
		const { rowCount } = await pool.query('DELETE FROM Invoice WHERE InvoiceID = $1', [id]);
		if (rowCount === 0) {
			return res.status(404).json({ message: 'Invoice not found' });
		}
		res.json({ message: 'Invoice deleted successfully' });
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server error');
	}
});

// --- Reminder API Endpoint ---
app.post('/api/reminders/send', authenticateToken, authorizeRoles(['Admin']), async (req, res) => {
	try {
		// Find appointments in the next 24 hours that haven't been sent a reminder yet
		const upcomingAppointments = await pool.query(
		   `SELECT a.AppointmentID, a.AppointmentTime, c.Email, c.FirstName, p.Name as PetName
			FROM APPOINTMENT AS a
			JOIN CLIENT AS c ON a.ClientID = c.ClientID
			JOING PET AS p ON a.PetID = p.PetID
			WHERE a.AppointmentTime BETWEEN NOW() AND NOW() + INTERVAL '24 hours'
			AND a.ReminderSent`
		);

		if (upcomingAppointments.rows.length === 0) {
			return res.json({ message: 'No upcoming appointments to send reminders for.' });
		}

		let remindersSentCount = 0;
		// Loop through appointments and send email
		for (const appt of upcomingAppointments.rows) {
			const subject = 'Appointment Reminder';
			const text = `Hi ${appt.firstname},\n\nThis is a reminder for your upcoming appointment for 
			${appt.petname} tomorrow at ${new Date(appt.appointmenttime).toLocaleTimeString()}.\n\nSee you soon!`;
			const html = `<p>Hi ${appt.firstname},</p><p>This is a reminder for your upcoming appointment for
			<strong>${appt.petname}</strong> tomorrow at <strong>${new Date(appt.appointmenttime).toLocaleTimeString()}
			</strong>.</p><p>See you soon!</p>`;

			await sendEmail(appt.email, subject, text, html);

			// Mark the reminder as sent in the database
			await pool.query(
				'UPDATE Appointment SET ReminderSent = TRUE WHERE AppointmentID = $1',
				[appt.appointmentid]
			);
			remindersSentCount++;
		}

		res.json({ message: `${remindersSentCount} reminder(s) sent successfully.` });
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server error');
	}
});

app.listen(port, () => {
	console.log('Backend server listening at http://localhost:${port}');
});
