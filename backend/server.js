const logger = require('./logger'); // Import logger to structure the logging process to the console in the backend.

process.on('unhandledRejection', (reason, promise) => {
  logger.error('FATAL', 'Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  logger.error('FATAL', 'Uncaught Exception:', error);
  process.exit(1);
});

const { sendEmail } = require('./emailService')
require('dotenv').config();
const pool = require('./db');

const express = require('express');
const { authenticateToken, authorizeRoles } = require('./middleware/auth');
const authRoutes = require('./routes/auth');
const cors = require('cors');

const app = express();
const port = 5000;

app.use(express.json()); // Middleware to parse JSON bodies
app.use(cors()); // Enable CORS for all routes

// --- Public Routes ---

// -- Test Routes --
app.get('/', (req, res) => {
	res.send('Hello from the backend!');
});

// Auth routes (register, login)
app.use('/api/auth', authRoutes);

// GET all booked appointment time slots
app.get('/api/public/appointments/booked-times', async (req, res) => {
    try {
        const { rows } = await pool.query(`
            SELECT
                a.AppointmentTime as start,
                a.AppointmentTime + s.DurationMinutes * INTERVAL '1 minute' as end
            FROM Appointment a
            JOIN Service s ON a.ServiceID = s.ServiceID
            WHERE a.Status IN ('Scheduled', 'Pending')
        `);
        res.json(rows);
    } catch (err) {
        logger.error('API', `Error in ${req.method} ${req.originalUrl}: ${err.message}`);
        res.status(500).send('Server error');
    }
});

// --- Protected Routes ---

// -- Client API Endpoints --

// GET all clients (ADMIN ONLY)
app.get('/api/clients', authenticateToken, authorizeRoles(['Admin']),  async (req, res) => {
	try {
		const { rows } = await pool.query('SELECT ClientID, FirstName, LastName, Email, PhoneNumber, Role, CreatedAt, ProfilePhotoURL FROM Client');
		logger.info('CLIENT', `Retrieved all ${rows.length} clients.`);
		res.json(rows);
	} catch (err) {
		logger.error('API', `Error in ${req.method} ${req.originalUrl}: ${err.message}`);
		res.status(500).send('Server error');
	}
});

// GET a single client by ID (Admin OR Client)
app.get('/api/clients/:id', authenticateToken, async (req, res) => {
	try {
		const { id } = req.params;
		// Check if the authenticated user is an Admin or is requesting their own info
		if (req.user.role !== 'Admin' && req.user.id !== parseInt(id, 10)) {
			logger.warn('AUTH', `Access denied for user ${req.user.id} to view client ${id}.`);
			return res.status(403).json({ message: 'Access denied' });
		}
		const { rows } = await pool.query('SELECT ClientID, FirstName, LastName, Email, PhoneNumber, Role, CreatedAt, ProfilePhotoURL FROM Client WHERE ClientID = $1', [id]);
		if (rows.length === 0) {
			return res.status(404).json({ message: 'Client not found' });
		}
		logger.info('CLIENT', `Retrieved client ${id}.`);
		res.json(rows[0]);
	} catch (err) {
		logger.error('API', `Error in ${req.method} ${req.originalUrl}: ${err.message}`);
		res.status(500).send('Server error');
	}
});

// PUT (update) a client by ID
app.put('/api/clients/:id', authenticateToken, async (req, res) => {
	try {
		const { id } = req.params;
		const updates = req.body;

        // Authorization: Allow admin or the user themselves
        if (req.user.role !== 'Admin' && req.user.id !== parseInt(id, 10)) {
            logger.warn('AUTH', `Access denied for user ${req.user.id} to update client ${id}.`);
            return res.status(403).json({ message: 'Access denied' });
        }

        // Prevent non-admins from changing roles
        if (req.user.role !== 'Admin') {
            delete updates.Role;
        }

        // Prevent admin from changing their own role to non-admin
        if (req.user.role === 'Admin' && req.user.id === parseInt(id, 10) && updates.Role && updates.Role !== 'Admin') {
            logger.warn('AUTH', `Admin user ${req.user.id} attempted to change their own role.`);
            return res.status(400).json({ message: 'Admins cannot change their own role.' });
        }

		// Fetch the current client data
        const currentClientResult = await pool.query('SELECT * FROM Client WHERE ClientID = $1', [id]);
        if (currentClientResult.rows.length === 0) {
            return res.status(404).json({ message: 'Client not found' });
        }
        const currentClient = currentClientResult.rows[0];

		// Merge updates with current data
        const newClientData = { ...currentClient, ...updates };
		// Sanitize and handle casing
		const { FirstName, LastName, Email, PhoneNumber, ProfilePhotoURL } = newClientData;
        const Role = newClientData.Role || newClientData.role; // Handle case difference


		const { rows } = await pool.query(
			'UPDATE Client SET FirstName = $1, LastName = $2, Email = $3, PhoneNumber = $4, Role = $5, ProfilePhotoURL = $6 WHERE ClientID = $7 RETURNING ClientID, FirstName, LastName, Email, PhoneNumber, Role, ProfilePhotoURL',
			[FirstName, LastName, Email, PhoneNumber, Role, ProfilePhotoURL, id]
		);
		
		logger.info('CLIENT', `Client ${id} updated successfully.`);
		res.json(rows[0]);
	} catch (err) {
		logger.error('API', `Error in ${req.method} ${req.originalUrl}: ${err.message}`);
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
		logger.info('CLIENT', `Client ${id} deleted successfully by admin ${req.user.id}.`);
		res.json({ message: 'Client deleted successfully' });
	} catch (err) {
		logger.error('API', `Error in ${req.method} ${req.originalUrl}: ${err.message}`);
		res.status(500).send('Server error');
	}
});

// -- Pet API Endpoints --

// GET all pets (ADMIN ONLY)
app.get('/api/pets', authenticateToken, authorizeRoles(['Admin']), async (req, res) => {
	try {
		const { rows } = await pool.query(`
            SELECT p.*, c.FirstName, c.LastName
            FROM Pet p
            JOIN Client c ON p.ClientID = c.ClientID
            ORDER BY p.PetID ASC
        `);
		logger.info('PET', `Retrieved all ${rows.length} pets.`);
		res.json(rows);
	} catch (err) {
		logger.error('API', `Error in ${req.method} ${req.originalUrl}: ${err.message}`);
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
			logger.warn('AUTH', `Access denied for user ${req.user.id} to view pet ${id}.`);
			return res.status(403).json({ message: 'Access denied' });
		}
		logger.info('PET', `Retrieved pet ${id}.`);
		res.json(rows[0]);
	} catch (err) {
		logger.error('API', `Error in ${req.method} ${req.originalUrl}: ${err.message}`);
		res.status(500).send('Server error');
	}
});

// GET all pets for a specific client (Admin OR client)
app.get('/api/clients/:clientId/pets', authenticateToken, async (req, res) => {
	try {
		const { clientId } = req.params;
		if (req.user.role !== 'Admin' && req.user.id !== parseInt(clientId, 10)) {
			logger.warn('AUTH', `Access denied for user ${req.user.id} to view pets for client ${clientId}.`);
			return res.status(403).json({ message: 'Access denied' });
		}
		const { rows } = await pool.query('SELECT * FROM Pet WHERE ClientID = $1 ORDER BY PetID ASC', [clientId]);
		logger.info('PET', `Retrieved ${rows.length} pets for client ${clientId}.`);
		res.json(rows);
	} catch (err) {
		logger.error('API', `Error in ${req.method} ${req.originalUrl}: ${err.message}`);
		res.status(500).send('Server error');
	}
});

// POST a new pet (Authenicated users for their own client ID)
app.post('/api/pets', authenticateToken, async (req, res) => {
	try {
		const { ClientID, Name, Breed, Age, Notes, ProfilePhotoURL } = req.body;
		// Ensure users can only add pets to their own profile
		if (req.user.id !== ClientID) {
			logger.warn('AUTH', `User ${req.user.id} failed to add pet for client ${ClientID}.`);
			return res.status(403).json({ message: 'Access denied: You can only add pets to your own profile.' });
		}
		const { rows } = await pool.query (
			'INSERT INTO Pet (ClientID, Name, Breed, Age, Notes, ProfilePhotoURL) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
			[ClientID, Name, Breed, Age, Notes, ProfilePhotoURL]
		);
		logger.info('PET', `New pet '${Name}' (ID: ${rows[0].petid}) created for client ${ClientID}.`);
		res.status(201).json(rows[0]);
	} catch (err) {
		logger.error('API', `Error in ${req.method} ${req.originalUrl}: ${err.message}`);
		res.status(500).send('Server error');
	}
});

// PUT (update) a pet by ID (Admin OR pet owner)
app.put('/api/pets/:id', authenticateToken, async (req, res) => {
	try {
		const { id } = req.params;
		const { ClientID, Name, Breed, Age, Notes, ProfilePhotoURL } = req.body;

		// Get the pet to check ownership
		const petResult = await pool.query('SELECT ClientID FROM Pet WHERE PetID = $1', [id]);
		if (petResult.rows.length === 0) {
			return res.status(404).json({ message: 'Pet not found' });
		}
		if (req.user.role !== 'Admin' && req.user.id !== petResult.rows[0].clientid) {
			logger.warn('AUTH', `Access denied for user ${req.user.id} to update pet ${id}.`);
			return res.status(403).json({ message: 'Access denied' });
		}

		const { rows } = await pool.query(
			'UPDATE Pet SET ClientID = $1, Name = $2, Breed = $3, Age = $4, Notes = $5, ProfilePhotoURL = $6 WHERE PetID = $7 RETURNING *',
			[ClientID, Name, Breed, Age, Notes, ProfilePhotoURL, id]
		);
		logger.info('PET', `Pet ${id} updated successfully.`);
		res.json(rows[0]);
	} catch (err) {
		logger.error('API', `Error in ${req.method} ${req.originalUrl}: ${err.message}`);
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
			logger.warn('AUTH', `Access denied for user ${req.user.id} to delete pet ${id}.`);
			return res.status(403).json({ message: 'Access denied' });
		}

		const { rowCount } = await pool.query('DELETE FROM Pet WHERE PetID = $1', [id]);
		if (rowCount === 0) {
			return res.status(404).json({ message: 'Pet not found' });
		}
		logger.info('PET', `Pet ${id} deleted successfully.`);
		res.json({ message: 'Pet deleted successfully' });
	} catch (err) {
		logger.error('API', `Error in ${req.method} ${req.originalUrl}: ${err.message}`);
		res.status(500).send('Server error');
	}
});


// --- Appointment API Endpoints ---

// GET all appointments (ADMIN ONLY)
app.get('/api/appointments', authenticateToken, authorizeRoles(['Admin']), async (req, res) => {
	try {
		const { status } = req.query; // Get status from query params

        let query = `
            SELECT a.*, c.FirstName, c.LastName, p.Name as PetName
            FROM Appointment a
            JOIN Client c ON a.ClientID = c.ClientID
            JOIN Pet p ON a.PetID = p.PetID
        `;
        const params = [];

        if (status) {
            query += ' WHERE a.Status = $1';
            params.push(status);
        }

        query += ' ORDER BY a.AppointmentID ASC';

		const { rows } = await pool.query(query, params);
		logger.info('APPOINTMENT', `Retrieved ${rows.length} appointments.`);
		res.json(rows);
	} catch (err) {
		logger.error('API', `Error in ${req.method} ${req.originalUrl}: ${err.message}`);
		res.status(500).send('Server error');
	}
});

// GET a single appointment by ID (Admin OR involved client)
app.get('/api/appointments/:id', authenticateToken, async (req, res) => {
	try {
		const { id } = req.params;
		const appointmentId = parseInt(id, 10);
		const query = `
            SELECT a.*, c.FirstName, c.LastName, p.Name as PetName
            FROM Appointment a
            JOIN Client c ON a.ClientID = c.ClientID
            JOIN Pet p ON a.PetID = p.PetID
            WHERE a.AppointmentID = $1
        `;
		const { rows } = await pool.query(query, [appointmentId]);
		if (rows.length === 0) {
			return res.status(404).json({ message: 'Appointment not found' });
		}
		if (req.user.role !== 'Admin' && req.user.id !== rows[0].clientid) {
			logger.warn('AUTH', `Access denied for user ${req.user.id} to view appointment ${id}.`);
			return res.status(403).json({ message: 'Access denied' });
		}
		logger.info('APPOINTMENT', `Retrieved appointment ${id}.`);
		res.json(rows[0]);
	} catch (err) {
		logger.error('API', `Error in ${req.method} ${req.originalUrl}: ${err.message}`);
		res.status(500).send('Server error');
	}
});

// GET all appointments for the LOGGED-IN client
app.get('/api/client/appointments', authenticateToken, async (req, res) => {
	try {
		const clientId = req.user.id; // Get client ID from token
		const query = `
            SELECT a.*, c.FirstName, c.LastName, p.Name as PetName
            FROM Appointment a
            JOIN Client c ON a.ClientID = c.ClientID
            JOIN Pet p ON a.PetID = p.PetID
            WHERE a.ClientID = $1
            ORDER BY a.AppointmentID ASC
        `;
		const { rows } = await pool.query(query, [clientId]);
		logger.info('APPOINTMENT', `Retrieved ${rows.length} appointments for logged-in client ${clientId}.`);
		res.json(rows);
	} catch (err) {
		logger.error('API', `Error in ${req.method} ${req.originalUrl}: ${err.message}`);
		res.status(500).send('Server error');
	}
});

// GET all appointments for a specific client (Admin OR the client)
app.get('/api/clients/:clientId/appointments', authenticateToken, async (req, res) => {
	try {
		const { clientId } = req.params;
		if (req.user.role !== 'Admin' && req.user.id !== parseInt(clientId, 10)) { 
			logger.warn('AUTH', `Access denied for user ${req.user.id} to view appointments for client ${clientId}.`);
			return res.status(403).json({ message: 'Access denied' });
		}
		const query = `
            SELECT a.*, c.FirstName, c.LastName, p.Name as PetName
            FROM Appointment a
            JOIN Client c ON a.ClientID = c.ClientID
            JOIN Pet p ON a.PetID = p.PetID
            WHERE a.ClientID = $1
            ORDER BY a.AppointmentID ASC
        `;
		const { rows } = await pool.query(query, [clientId]);
		logger.info('APPOINTMENT', `Retrieved ${rows.length} appointments for client ${clientId}.`);
		res.json(rows);
	} catch (err) {
		logger.error('API', `Error in ${req.method} ${req.originalUrl}: ${err.message}`);
		res.status(500).send('Server error');
	}
});

// POST a new appointment (Authenticated users)
app.post('/api/appointments', authenticateToken, async (req, res) => {
	try {
		const { ClientID, PetID, ServiceID, AppointmentTime, Status, Notes } = req.body;
		if (req.user.role !== 'Admin' && req.user.id !== ClientID) {
			logger.warn('AUTH', `User ${req.user.id} failed to create appointment for client ${ClientID}.`);
			return res.status(403).json({ message: 'Access denied: You can only create appointments for yourself.' });
		}

		// --- START: Double Booking Prevention ---
        const serviceRes = await pool.query('SELECT DurationMinutes FROM Service WHERE ServiceID = $1', [ServiceID]);
        if (serviceRes.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid service selected.' });
        }
        const durationMinutes = serviceRes.rows[0].durationminutes;
        const durationInterval = `${durationMinutes} minutes`; // Create interval string

        const conflictCheckQuery = `
            SELECT a.AppointmentID
            FROM Appointment a
            WHERE
                a.Status IN ('Scheduled', 'Pending') AND
                (a.AppointmentTime, a.AppointmentTime + (SELECT s.DurationMinutes FROM Service s WHERE s.ServiceID = a.ServiceID) * INTERVAL '1 minute')
                OVERLAPS
                ($1::timestamptz, $1::timestamptz + $2::interval)
        `;

        const conflictCheck = await pool.query(conflictCheckQuery, [AppointmentTime, durationInterval]);

        if (conflictCheck.rows.length > 0) {
			logger.warn('APPOINTMENT', `Double booking prevented for time slot ${AppointmentTime}.`);
            return res.status(409).json({ message: 'This time slot is already booked. Please choose a different time.' });
        }
        // --- END: Double Booking Prevention ---

		// Enforce minimum booking notice for non-admins
		if (req.user.role !== 'Admin') {
			const settingsRes = await pool.query('SELECT Value FROM Settings WHERE Name = $1', ['booking_minimum_notice_hours']);
			const minNoticeHours = settingsRes.rows.length > 0 ? parseInt(settingsRes.rows[0].value, 10) : 24; // Default to 24 if not set

			const now = new Date();
			const appointmentTime = new Date(AppointmentTime);
			const noticeMilliseconds = minNoticeHours * 60 * 60 * 1000;

			if (appointmentTime.getTime() - now.getTime() < noticeMilliseconds) {
				logger.warn('APPOINTMENT', `Booking failed for user ${req.user.id} due to minimum notice period.`);
				return res.status(400).json({ message: `Booking failed: Appointments must be made at least ${minNoticeHours} hours in advance.` });
			}
		}

		const { rows } = await pool.query(
			'INSERT INTO Appointment (ClientID, PetID, ServiceID, AppointmentTime, Status, Notes) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
			[ClientID, PetID, ServiceID, AppointmentTime, Status, Notes]
		);
		logger.info('APPOINTMENT', `New appointment (ID: ${rows[0].appointmentid}) created for client ${ClientID}.`);
		res.status(201).json(rows[0]);
	} catch (err) {
		logger.error('API', `Error in ${req.method} ${req.originalUrl}: ${err.message}`);
		res.status(500).send('Server error');
	}
});

// PUT (update) an appointment by ID (Admin OR client)
app.put('/api/appointments/:id', authenticateToken, async (req, res) => {
	try {
		const { id } = req.params;
		const appointmentId = parseInt(id, 10);

		// Use lowercase keys to match the data sent from the frontend
		const { clientid, petid, serviceid, appointmenttime, status, notes } = req.body;

		const aptResult = await pool.query('SELECT ClientID, Status FROM Appointment WHERE AppointmentID = $1', [appointmentId]);
		if (aptResult.rows.length === 0) {
			return res.status(404).json({ message: 'Appointment not found' });
		}
		if (req.user.role !== 'Admin' && req.user.id !== aptResult.rows[0].clientid) {
			logger.warn('AUTH', `Access denied for user ${req.user.id} to update appointment ${id}.`);
			return res.status(403).json({ message: 'Access denied' });
		}

		const { rows } = await pool.query(
			'UPDATE Appointment SET ClientID = $1, PetID = $2, ServiceID = $3, AppointmentTime = $4, Status = $5, Notes = $6 WHERE AppointmentID = $7 RETURNING *',
			[clientid, petid, serviceid, appointmenttime, status, notes, appointmentId]
		);
		logger.info('APPOINTMENT', `Appointment ${id} updated to status '${status}'.`);

		// If the status has changed, create a notification for the client
		if (req.user.role === 'Admin' && status && status !== aptResult.rows[0].status) {
			const petRes = await pool.query('SELECT Name FROM Pet WHERE PetID = $1', [petid]);
			const petName = petRes.rows.length > 0 ? petRes.rows[0].name : 'your pet';
			
			const message = `Your appointment for ${petName} at ${new Date(appointmenttime).toLocaleString()} has been updated to "${status}".`;
			
			await pool.query(
				'INSERT INTO Notification (ClientID, Message, Link) VALUES ($1, $2, $3)',
				[clientid, message, '/client/appointments']
			);
			logger.info('NOTIFICATION', `Created notification for client ${clientid} about appointment ${id} status change.`);
		}

		// If the appointment is marked as 'Completed', automatically create an invoice
		if (status === 'Completed') {
			// Get the service price
			const serviceRes = await pool.query('SELECT Price FROM Service WHERE ServiceID = $1', [serviceid]);
			if (serviceRes.rows.length > 0) {
				const price = serviceRes.rows[0].price;

				// Check if an invoice for this appointment already exists to prevent dupes
				const invoiceExists = await pool.query('SELECT 1 FROM Invoice WHERE AppointmentID = $1', [id]);

				if (invoiceExists.rows.length === 0) {
					// Fetch invoice_due_days setting
					const settingsRes = await pool.query('SELECT Value FROM Settings WHERE Name = $1', ['invoice_due_days']);
					const dueDays = settingsRes.rows.length > 0 ? settingsRes.rows[0].value : '30'; // Default to 30 if not set

					const queryText = `INSERT INTO Invoice (AppointmentID, Amount, Status, DueDate) VALUES ($1, $2, $3, NOW() + INTERVAL '${dueDays} days')`;
					const queryParams = [appointmentId, price, 'Unpaid'];

					// Create the invoice
					await pool.query(queryText, queryParams);
					logger.info('INVOICE', `Invoice created for completed appointment ${id}.`);
				}
			}
		}

		res.json(rows[0]);
	} catch (err) {
		logger.error('API', `Error in ${req.method} ${req.originalUrl}: ${err.message}`);
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
			logger.warn('AUTH', `Access denied for user ${req.user.id} to delete appointment ${id}.`);
			return res.status(403).json({ message: 'Access denied' });
		}

		const { rowCount } = await pool.query('DELETE FROM Appointment WHERE AppointmentID = $1', [id]);
		if (rowCount === 0) {
			return res.status(404).json({ message: 'Appointment not found' });
		}
		logger.info('APPOINTMENT', `Appointment ${id} deleted successfully.`);
		res.json({ message: 'Appointment deleted successfully' });
	} catch (err) {
		logger.error('API', `Error in ${req.method} ${req.originalUrl}: ${err.message}`);
		res.status(500).send('Server error');
	}
});


// --- Service API Endpoints --- (ADMIN ONLY)

// GET all active services
app.get('/api/services', authenticateToken, async (req, res) => {
	try {
		const { rows } = await pool.query('SELECT * FROM Service WHERE IsActive = true ORDER BY ServiceID ASC');
		logger.info('SERVICE', `Retrieved ${rows.length} active services.`);
		res.json(rows);
	} catch (err) {
		logger.error('API', `Error in ${req.method} ${req.originalUrl}: ${err.message}`);
		res.status(500).send('Server error');
	}
});

// GET service usage statistics
app.get('/api/services/stats', authenticateToken, authorizeRoles(['Admin']), async (req, res) => {
    try {
        const { rows } = await pool.query(`
            SELECT ServiceID, COUNT(AppointmentID) as usage_count
            FROM Appointment
            GROUP BY ServiceID
        `);
        // Convert array to a map for easier lookup on the frontend
        const statsMap = rows.reduce((acc, row) => {
            acc[row.serviceid] = row.usage_count;
            return acc;
        }, {});
        res.json(statsMap);
    } catch (err) {
        logger.error('API', `Error in ${req.method} ${req.originalUrl}: ${err.message}`);
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
		logger.info('SERVICE', `Retrieved service ${id}.`);
		res.json(rows[0]);
	} catch (err) {
		logger.error('API', `Error in ${req.method} ${req.originalUrl}: ${err.message}`);
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
		logger.info('SERVICE', `New service '${Name}' (ID: ${rows[0].serviceid}) created.`);
		res.status(201).json(rows[0]);
	} catch (err) {
		logger.error('API', `Error in ${req.method} ${req.originalUrl}: ${err.message}`);
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
		logger.info('SERVICE', `Service ${id} updated successfully.`);
		res.json(rows[0]);
	} catch (err) {
		logger.error('API', `Error in ${req.method} ${req.originalUrl}: ${err.message}`);
		res.status(500).send('Server error');
	}
});

// DELETE (soft) a service by ID
app.delete('/api/services/:id', authenticateToken, authorizeRoles(['Admin']), async (req, res) => {
	try {
		const { id } = req.params;
		const { rowCount } = await pool.query('UPDATE Service SET IsActive = false WHERE ServiceID = $1', [id]);
		if (rowCount === 0) {
			return res.status(404).json({ message: 'Service not found' });
		}
		logger.info('SERVICE', `Service ${id} archived successfully.`);
		res.json({ message: 'Service archived successfully' });
	} catch (err) {
		logger.error('API', `Error in ${req.method} ${req.originalUrl}: ${err.message}`);
		res.status(500).send('Server error');
	}
});


// --- Invoice API Endpoints --- (ADMIN ONLY)

// GET all invoices
app.get('/api/invoices', authenticateToken, authorizeRoles(['Admin']), async (req, res) => {
	try {
		const { rows } = await pool.query(`
            SELECT 
                i.*, 
                c.FirstName, 
                c.LastName, 
                p.Name as PetName 
            FROM Invoice i
            JOIN Appointment a ON i.AppointmentID = a.AppointmentID
            JOIN Client c ON a.ClientID = c.ClientID
            JOIN Pet p ON a.PetID = p.PetID
            ORDER BY i.InvoiceID ASC
        `);
		logger.info('INVOICE', `Retrieved all ${rows.length} invoices.`);
		res.json(rows);
	} catch (err) {
		logger.error('API', `Error in ${req.method} ${req.originalUrl}: ${err.message}`);
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
		logger.info('INVOICE', `Retrieved invoice ${id}.`);
		res.json(rows[0]);
	} catch (err) {
		logger.error('API', `Error in ${req.method} ${req.originalUrl}: ${err.message}`);
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
		logger.error('API', `Error in ${req.method} ${req.originalUrl}: ${err.message}`);
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
		logger.info('INVOICE', `New invoice (ID: ${rows[0].invoiceid}) created for appointment ${AppointmentID}.`);
		res.status(201).json(rows[0]);
	} catch (err) {
		logger.error('API', `Error in ${req.method} ${req.originalUrl}: ${err.message}`);
		res.status(500).send('Server error');
	}
});

// PUT (update) an invoice by ID
app.put('/api/invoices/:id', authenticateToken, authorizeRoles(['Admin']), async (req, res) => {
	try {
		const { id } = req.params;
		// Use lowercase keys to match the frontend data
		const { appointmentid, amount, status, duedate } = req.body;

		// Get the old status to check if it's changing to 'Paid'
		const oldInvoice = await pool.query('SELECT Status FROM Invoice WHERE InvoiceID = $1', [id]);
		const oldStatus = oldInvoice.rows.length > 0 ? oldInvoice.rows[0].status : null;

		const { rows } = await pool.query(
			'UPDATE Invoice SET AppointmentID = $1, Amount = $2, Status = $3, DueDate = $4 WHERE InvoiceID = $5 RETURNING *',
			[appointmentid, amount, status, duedate, id]
		);
		if (rows.length === 0) {
			return res.status(404).json({ message: 'Invoice not found' });
		}
		logger.info('INVOICE', `Invoice ${id} updated to status '${status}'.`);

		// If status changed to 'Paid', send a confirmation email
		if (status === 'Paid' && oldStatus !== 'Paid') {
			// 1. Fetch client info
			const clientInfo = await pool.query(
				`SELECT c.Email, c.FirstName 
				 FROM Client c
				 JOIN Appointment a ON c.ClientID = a.ClientID
				 WHERE a.AppointmentID = $1`,
				[appointmentid]
			);

			if (clientInfo.rows.length > 0) {
				const { email, firstname } = clientInfo.rows[0];

				// 2. Fetch email templates
				const settingsResult = await pool.query('SELECT Name, Value FROM Settings');
				const settings = settingsResult.rows.reduce((acc, row) => {
					acc[row.name] = row.value;
					return acc;
				}, {});
				const { invoice_paid_subject, invoice_paid_body, business_name, business_address, business_phone, business_email } = settings;

				// 3. Send email
				if (invoice_paid_subject && invoice_paid_body) {
					const subject = invoice_paid_subject;
					const textBody = invoice_paid_body
						.replace(/{{client_name}}/g, firstname)
						.replace(/{{amount}}/g, amount)
						.replace(/{{business_name}}/g, business_name)
						.replace(/{{business_address}}/g, business_address)
						.replace(/{{business_phone}}/g, business_phone)
						.replace(/{{business_email}}/g, business_email);
					const htmlBody = textBody.replace(/\n/g, '<br>');

					await sendEmail(email, subject, textBody, htmlBody);
					logger.info('EMAIL', `Sent 'Invoice Paid' confirmation to ${email}.`);
				}
			}
		}

		res.json(rows[0]);
	} catch (err) {
		logger.error('API', `Error in ${req.method} ${req.originalUrl}: ${err.message}`);
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
		logger.info('INVOICE', `Invoice ${id} deleted successfully.`);
		res.json({ message: 'Invoice deleted successfully' });
	} catch (err) {
		logger.error('API', `Error in ${req.method} ${req.originalUrl}: ${err.message}`);
		res.status(500).send('Server error');
	}
});


// --- Settings API Endpoints --- (ADMIN ONLY)

// GET all settings
app.get('/api/settings', authenticateToken, authorizeRoles(['Admin']), async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT Name, Value FROM Settings');
        // Convert array to a map for easier use on the frontend
        const settingsMap = rows.reduce((acc, row) => {
            acc[row.name] = row.value;
            return acc;
        }, {});
        res.json(settingsMap);
    } catch (err) {
        logger.error('API', `Error in ${req.method} ${req.originalUrl}: ${err.message}`);
        res.status(500).send('Server error');
    }
});

// PUT (update) settings
app.put('/api/settings', authenticateToken, authorizeRoles(['Admin']), async (req, res) => {
    try {
        const settings = req.body; // Expects an object like { settingName: settingValue, ... }
        
        // Use a transaction to ensure all or no settings are updated
        await pool.query('BEGIN');

        for (const [name, value] of Object.entries(settings)) {
            await pool.query(
                'INSERT INTO Settings (Name, Value) VALUES ($1, $2) ON CONFLICT (Name) DO UPDATE SET Value = $2',
                [name, value]
            );
        }

        await pool.query('COMMIT');
        logger.info('SETTINGS', `Settings updated successfully by admin ${req.user.id}.`);
        res.json({ message: 'Settings updated successfully' });
    } catch (err) {
        await pool.query('ROLLBACK');
        logger.error('API', `Error in ${req.method} ${req.originalUrl}: ${err.message}`);
        res.status(500).send('Server error');
    }
});


// --- Notification API Endpoints ---

// GET unread notifications for the logged-in client
app.get('/api/client/notifications', authenticateToken, authorizeRoles(['Client']), async (req, res) => {
    try {
        const clientId = req.user.id;
        const { rows } = await pool.query(
            'SELECT * FROM Notification WHERE ClientID = $1 AND IsRead = FALSE ORDER BY CreatedAt DESC',
            [clientId]
        );
        res.json(rows);
    } catch (err) {
        logger.error('API', `Error in ${req.method} ${req.originalUrl}: ${err.message}`);
        res.status(500).send('Server error');
    }
});

// PUT mark all notifications as read for the logged-in client
app.put('/api/notifications/read-all', authenticateToken, authorizeRoles(['Client']), async (req, res) => {
    try {
        const clientId = req.user.id;
        await pool.query(
            'UPDATE Notification SET IsRead = TRUE WHERE ClientID = $1',
            [clientId]
        );
		logger.info('NOTIFICATION', `All notifications marked as read for client ${clientId}.`);
        res.status(204).send(); // No content
    } catch (err) {
        logger.error('API', `Error in ${req.method} ${req.originalUrl}: ${err.message}`);
        res.status(500).send('Server error');
    }
});


// --- Reminder API Endpoint ---
app.post('/api/reminders/send', async (req, res) => {
	// Secure the endpoint with a secret key
	const cronSecret = req.headers['x-cron-secret'];
	if (cronSecret !== process.env.CRON_SECRET) {
		logger.warn('AUTH', 'Unauthorized attempt to access cron reminder endpoint.');
		return res.status(401).json({ message: 'Unauthorized: Invalid secret.'});
	}

	try {
		// 1. Fetch all email templates from settings
        const settingsResult = await pool.query('SELECT Name, Value FROM Settings');
        const settings = settingsResult.rows.reduce((acc, row) => {
            acc[row.name] = row.value;
            return acc;
        }, {});

        const { 
            email_reminder_24h_subject, email_reminder_24h_body,
            email_reminder_1h_subject, email_reminder_1h_body,
            business_name, business_address, business_phone, business_email
        } = settings;

		// --- 24-Hour Reminders ---
		const twentyFourHourReminders = await pool.query(
			`SELECT a.AppointmentID, a.AppointmentTime, c.Email, c.FirstName, p.Name as PetName
			 FROM Appointment AS a
			 JOIN Client AS c ON a.ClientID = c.ClientID
			 JOIN Pet AS p ON a.PetID = p.PetID
			 WHERE a.AppointmentTime > NOW() AND a.AppointmentTime <= NOW() + INTERVAL '24 hours'
			 AND a.ReminderSent24h = FALSE`
		);

		for (const appt of twentyFourHourReminders.rows) {
			// 2. Replace placeholders
            const subject = email_reminder_24h_subject.replace('{{client_name}}', appt.firstname).replace('{{pet_name}}', appt.petname);
            const textBody = email_reminder_24h_body
                .replace(/{{client_name}}/g, appt.firstname)
                .replace(/{{pet_name}}/g, appt.petname)
                .replace(/{{appointment_date}}/g, new Date(appt.appointmenttime).toLocaleDateString())
                .replace(/{{appointment_time}}/g, new Date(appt.appointmenttime).toLocaleTimeString())
                .replace(/{{business_name}}/g, business_name)
                .replace(/{{business_address}}/g, business_address)
                .replace(/{{business_phone}}/g, business_phone)
                .replace(/{{business_email}}/g, business_email);
			
			const htmlBody = textBody.replace(/\n/g, '<br>');

			await sendEmail(appt.email, subject, textBody, htmlBody);
			await pool.query('UPDATE Appointment SET ReminderSent24h = TRUE WHERE AppointmentID = $1', [appt.appointmentid]);
			logger.info('EMAIL', `Sent 24-hour reminder to ${appt.email} for appointment ${appt.appointmentid}.`);
		}

		// --- 1-Hour Reminders ---
		const oneHourReminders = await pool.query(
			`SELECT a.AppointmentID, a.AppointmentTime, c.Email, c.FirstName, p.Name as PetName
			 FROM Appointment AS a
			 JOIN Client AS c ON a.ClientID = c.ClientID
			 JOIN Pet AS p ON a.PetID = p.PetID
			 WHERE a.AppointmentTime BETWEEN NOW() + INTERVAL '55 minutes' AND NOW() + INTERVAL '65 minutes'
			 AND a.ReminderSent1h = FALSE`
		);

		for (const appt of oneHourReminders.rows) {
			// 2. Replace placeholders
            const subject = email_reminder_1h_subject.replace('{{client_name}}', appt.firstname).replace('{{pet_name}}', appt.petname);
            const textBody = email_reminder_1h_body
                .replace(/{{client_name}}/g, appt.firstname)
                .replace(/{{pet_name}}/g, appt.petname)
                .replace(/{{appointment_time}}/g, new Date(appt.appointmenttime).toLocaleTimeString())
                .replace(/{{business_name}}/g, business_name)
                .replace(/{{business_address}}/g, business_address)
                .replace(/{{business_phone}}/g, business_phone)
                .replace(/{{business_email}}/g, business_email);

			const htmlBody = textBody.replace(/\n/g, '<br>');

			await sendEmail(appt.email, subject, textBody, htmlBody);
			await pool.query('UPDATE Appointment SET ReminderSent1h = TRUE WHERE AppointmentID = $1', [appt.appointmentid]);
			logger.info('EMAIL', `Sent 1-hour reminder to ${appt.email} for appointment ${appt.appointmentid}.`);
		}

		logger.info('CRON', `Reminder job completed. Sent ${twentyFourHourReminders.rowCount} 24h reminders and ${oneHourReminders.rowCount} 1h reminders.`);
		res.json({ 
			message: 'Reminder check completed.',
			sent24h: twentyFourHourReminders.rowCount,
			sent1h: oneHourReminders.rowCount
		});

	} catch (err) {
		logger.error('CRON', `Error running reminder job: ${err.message}`);
		res.status(500).send('Server error during reminder job.');
	}
});

// --- Start Server ---
// Wrap server startup in a database connection check
pool.connect()
  .then(client => {
    logger.info('SYSTEM', 'Database connected successfully!');
    client.release(); // Release the client back to the pool
    app.listen(port, () => {
      logger.info('SYSTEM', `Backend server listening at http://localhost:${port}`);
    });
  })
  .catch(err => {
    logger.error('FATAL', 'Failed to connect to the database.', err);
    process.exit(1);
  });
