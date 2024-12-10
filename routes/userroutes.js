const express = require('express');
const { signup, login, getUserStatus } = require('../controller/usercontroller');
const authenticateToken = require('../middleware/authenticateToken');

const router = express.Router();

// User routes
router.post('/signup', signup);
router.post('/login', login);
router.get('/status', authenticateToken, getUserStatus); // Protected route to get user status

module.exports = router;
