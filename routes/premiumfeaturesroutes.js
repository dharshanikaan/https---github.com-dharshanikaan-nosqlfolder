const express = require('express');
const { getLeaderboard } = require('../controller/premiumfeaturescontroller');
const authenticateToken = require('../middleware/authenticatetoken');
const checkPremium = require('../middleware/checkpremium');

const router = express.Router();


router.get('/leaderboard', (req, res, next) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');  // Disable caching
    res.setHeader('Pragma', 'no-cache');  // For HTTP/1.0 compatibility
    res.setHeader('Expires', '0');  // Set expiration date to a past date
    
    next(); // Call the next middleware or route handler
}, getLeaderboard);

module.exports = router;