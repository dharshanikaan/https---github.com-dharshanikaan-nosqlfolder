// Import the Mongoose model for User
const User = require('../models/user'); // Assuming the User model is in 'models/user.js'

const checkPremium = async (req, res, next) => {
    const userId = req.userId;  // The userId should have been set by your 'authenticateToken' middleware

    try {
        // Find the user by their ID using Mongoose
        const user = await User.findById(userId); // Mongoose method for finding by userId (_id in MongoDB)

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Check if the user has a premium membership
        if (!user.isPremium) {
            return res.status(403).json({ message: 'Premium access required.' });
        }

        next(); // Continue to the next middleware or route handler if the user has premium access
    } catch (error) {
        console.error('Error checking premium membership:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

module.exports = checkPremium;
