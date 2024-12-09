const User = require('../models/user');

const checkPremium = async (req, res, next) => {
    const userId = req.userId;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        if (!user.isPremium) {
            return res.status(403).json({ message: 'Premium access required.' });
        }

        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        console.error('Error checking premium membership:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

module.exports = checkPremium;
