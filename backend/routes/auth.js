const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../db');
const jwt = require('jsonwebtoken');


// --- User Registration ---
router.post('/register', async (req, res) => {
	try {
		const { FirstName, LastName, Email, PhoneNumber, Password } = req.body;

		// Check if user already exists
		const userExists = await pool.query('SELECT * FROM Client WHERE Email = $1', [Email]);
		if (userExists.rows.length > 0) {
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
		
		res.status(201).json({
			message: 'User registrered successfully',
			user: rows[0],
		});
	} catch (err) {
		console.error(err.message);
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
			return res.status(401).json({ message: 'Invalid credentials' });
		}

		const user = rows[0];

		// Check password
		const isMatch = await bcrypt.compare(Password, user.passwordhash);
		if (!isMatch) {
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
				if (err) throw err;
				res.json({ token });
			}
		);
	} catch (err) {
		console.error(err.message);
		res.status(500).send('Server error');
	}
});

module.exports = router;
