const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../db');
const jwt = require('jsonwebtoken');
const logger = require('../logger');

const router = express.Router(); // Create an Express router to manage authentication routes

// --- User Registration ---
router.post('/register', async (req, res) => {
	try {
		const { FirstName, LastName, Email, PhoneNumber, Password } = req.body;

		// Check if user already exists
		const userExists = await pool.query('SELECT * FROM Client WHERE Email = $1', [Email]);
		if (userExists.rows.length > 0) {
			logger.warn('AUTH', `Registration failed: Email ${Email} already exists.`);
			return res.status(400).json({ message: 'User with this email already exists.' });
		}

		// Hash password
		const salt = await bcrypt.genSalt(10);
		const passwordHash = await bcrypt.hash(Password, salt);

		// Insert new client with a default role of 'Client'
		const { rows } = await pool.query(
			'INSERT INTO Client (FirstName, LastName, Email, PhoneNumber, PasswordHash, Role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING ClientID, Email, Role',
			[FirstName, LastName, Email, PhoneNumber, passwordHash, 'Client']
		);
		
		logger.info('AUTH', `New user registered: ${Email} (ID: ${rows[0].clientid})`);
		res.status(201).json({
			message: 'User registrered successfully',
			user: rows[0],
		});
	} catch (err) {
		logger.error('AUTH', `Error during registration: ${err.message}`);
		res.status(500).send('Server error');
	}
});

// --- User Login ---
router.post('/login', async (req, res) => {
	try {
		const { Email, Password } = req.body;

		// Check if user exists
		const { rows } = await pool.query('SELECT * FROM Client WHERE Email = $1', [Email]);
		if (rows.length === 0) {
			logger.warn('AUTH', `Login failed: No user found for email ${Email}.`);
			return res.status(401).json({ message: 'Invalid credentials' });
		}

		const user = rows[0];

		// Check password
		const isMatch = await bcrypt.compare(Password, user.passwordhash);
		if (!isMatch) {
			logger.warn('AUTH', `Login failed: Password mismatch for user ${Email}.`);
			return res.status(401).json({ message: 'Invalid credentials' });
		}

		// Create and sign JWT
		const payload = {
			user: {
				id: user.clientid,
				role: user.role,
			},
		};

		jwt.sign(
			payload,
			process.env.JWT_SECRET,
			{ expiresIn: '1h' },
			(err, token) => {
				if (err) {
                    logger.error('AUTH', `Error signing JWT for user ${Email}: ${err.message}`);
                    throw err;
                };
				logger.info('AUTH', `Login successful, token created for ${Email}.`);
				res.json({ token });
			}
		);
	} catch (err) {
		logger.error('AUTH', `Error during login: ${err.message}`);
		res.status(500).send('Server error');
	}
});

module.exports = router;
