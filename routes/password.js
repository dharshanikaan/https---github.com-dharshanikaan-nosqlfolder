const express = require('express');
const { forgotPassword, resetPassword } = require('../controller/passwordcontroller');

const router = express.Router();

// Route for forgot password
router.post('/forgotpassword', forgotPassword);

// Route for resetting password
router.post('/resetpassword/:id', resetPassword);

module.exports = router;
