const { models } = require('../util/database');

const checkPremium = async (req, res, next) => {
    const userId = req.userId;

    try {
        const user = await models.User.findByPk(userId); // Should work if User is defined correctly
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        // rest of your code...
    } catch (error) {
        console.error('Error checking premium membership:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};


module.exports = checkPremium;