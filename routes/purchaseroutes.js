const express = require('express');
const { createOrder, handlePaymentSuccess } = require('../controller/purchasecontroller');
const authenticateToken = require('../middleware/authenticateToken');

const router = express.Router();

// Route for creating a new order
router.post('/order', authenticateToken, createOrder);

// Route for handling the success of a payment
router.post('/success', authenticateToken, handlePaymentSuccess);

module.exports = router;
