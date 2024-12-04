const express = require('express');
const { signup, login, getUserStatus } = require('../controller/usercontroller');
const authenticateToken = require('../middleware/authenticatetoken');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/status', authenticateToken, getUserStatus); // This line defines the route

module.exports = router;