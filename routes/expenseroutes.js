// In your expense routes (expenseroutes.js)
const express = require('express');
const { downloadExpense, addExpense, getExpenses, deleteExpense } = require('../controller/expensecontroller');
const authenticateToken = require('../middleware/authenticatetoken');

const router = express.Router();

router.post('/', authenticateToken, addExpense);
router.get('/', authenticateToken, getExpenses);  // Handle paginated requests here
router.delete('/', authenticateToken, deleteExpense);
router.get('/download', authenticateToken, downloadExpense);

module.exports = router;