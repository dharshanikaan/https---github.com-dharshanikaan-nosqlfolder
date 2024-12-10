const express = require('express');
const { downloadExpense, addExpense, getExpenses, deleteExpense } = require('../controller/expensecontroller');
const authenticateToken = require('../middleware/authenticateToken');

const router = express.Router();

// Define routes
router.post('/', authenticateToken, addExpense);  // Adding an expense
router.get('/', authenticateToken, getExpenses);  // Fetching paginated expenses
router.delete('/', authenticateToken, deleteExpense);  // Deleting an expense
router.get('/download', authenticateToken, downloadExpense);  // Download expenses

module.exports = router;
