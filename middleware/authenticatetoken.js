const jwt = require('jsonwebtoken');
const User = require('../models/user'); // Assuming User model is in 'models/user.js'

const authenticateToken = async (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Extract the token from Authorization header

    if (!token) {
        return res.sendStatus(401); // No token provided
    }

    try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId; // Attach userId to request object
        
        // Check if the user exists in the database
        const user = await User.findById(req.userId); // Find the user by ID

        if (!user) {
            return res.sendStatus(404); // User not found
        }

        next(); // User exists, proceed to the next middleware or route handler
    } catch (err) {
        console.error('Error in authenticateToken:', err);
        return res.sendStatus(403); // Token is invalid or expired
    }
};

module.exports = authenticateToken;
