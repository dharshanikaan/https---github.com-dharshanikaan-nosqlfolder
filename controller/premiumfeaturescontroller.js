const User = require('../models/user'); // Import User model (Mongoose)

const getLeaderboard = async (req, res) => {
    try {
        // Fetch all users, sort by totalExpense in descending order, and select id, name, and totalExpense attributes
        const users = await User.find()
            .sort({ totalExpense: -1 }) // Sort by totalExpense descending
            .select('id name totalExpense'); // Select only required fields (id, name, totalExpense)

        console.log('Fetched Leaderboard Data:', users); // Log the data to check what's returned

        if (users.length === 0) {
            return res.status(200).json([]); // If no users, return empty array
        }

        res.status(200).json(users); // Send leaderboard data
    } catch (error) {
        console.error('Error fetching leaderboard:', error.message);
        res.status(500).json({ message: 'Error fetching leaderboard.' });
    }
};

module.exports = { getLeaderboard };
