const express = require('express');
const { forgotPassword, resetPassword } = require('../controller/passwordcontroller');

const router = express.Router();

router.post('/forgotpassword', forgotPassword);
router.post('/resetpassword/:id', resetPassword);

module.exports = router;