const { models } = require('../util/database');

const getLeaderboard = async (req, res) => {
    try {
        const users = await models.User.findAll({
            attributes: ['id', 'name', 'totalExpense'],
            order: [['totalExpense', 'DESC']], // Sort by totalExpense descending
        });

        console.log('Fetched Leaderboard Data:', users); // Log the data to check what's returned

        if (users.length === 0) {
            return res.status(200).json([]);
        }

        res.status(200).json(users); // Send leaderboard data
    } catch (error) {
        console.error('Error fetching leaderboard:', error.message);
        res.status(500).json({ message: 'Error fetching leaderboard.' });
    }
};
module.exports = { getLeaderboard };