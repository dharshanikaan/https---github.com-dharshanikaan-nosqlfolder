const express = require('express');
const { getLeaderboard } = require('../controller/premiumfeaturescontroller');
const authenticateToken = require('../middleware/authenticateToken');
const checkPremium = require('../middleware/checkpremium');

const router = express.Router();

// Route for fetching leaderboard with necessary middlewares
router.get('/leaderboard', authenticateToken, checkPremium, getLeaderboard);

module.exports = router;
