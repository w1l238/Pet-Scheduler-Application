require('dotenv').config();
const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
function authenticateToken(req, res, next) {
	// Get token from header
	const authHeader = req.headers['authorization'];
	const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"

	if (!token) {
		return res.status(401).json({ message: 'No token, authorization denied' });
	}

	try {
		// Verify token
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		req.user = decoded.user; // Attach user payload to the request object
		next();
	} catch (err) {
		res.status(403).json({ message: 'Token is not valid' });
	}
}

// Middleware to check user role
function authorizeRoles(roles) {
	return (req, res, next) => {
		if (!req.user || !roles.includes(req.user.role)) {
			return res.status(403).json({ message: 'Access denied: Insufficient permissions' });
		}
		next();
	};
}

module.exports = {
	authenticateToken,
	authorizeRoles
};
