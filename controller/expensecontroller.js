const AWS = require('aws-sdk');
const mongoose = require('mongoose');  // Import mongoose
const Expense = require('../models/expense');
const User = require('../models/user');

const { body, validationResult } = require('express-validator');

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: 'us-west-2', // Adjust as needed
});

// Fetch paginated expenses
const getExpenses = async (req, res) => {
    const userId = req.userId;
    const { pageSize = 10, page = 1 } = req.query; // Get page size and page number from query params (default pageSize is 10)

    const limit = parseInt(pageSize); // Number of items per page
    const skip = (parseInt(page) - 1) * limit; // Skip to the correct page

    try {
        const expenses = await Expense.find({ userId }).limit(limit).skip(skip);

        const totalExpenses = await Expense.countDocuments({ userId });
        const totalPages = Math.ceil(totalExpenses / limit); // Calculate the total number of pages

        res.status(200).json({
            expenses,
            totalPages,
            currentPage: page,
            pageSize: limit,
            totalExpenses,
        });
    } catch (error) {
        console.error('Error fetching expenses:', error);
        res.status(500).json({ message: 'Error fetching expenses.' });
    }
};

// Upload expenses to S3 and return the file URL
const downloadExpense = async (req, res) => {
    try {
        const userId = req.userId; // Ensure this is set by authenticateToken
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const expenses = await Expense.find({ userId });
        if (!expenses || expenses.length === 0) {
            return res.status(404).json({ message: 'No expenses found.' });
        }

        const stringifiedExpenses = JSON.stringify(expenses);
        const now = new Date();
        const formattedDate = now.toISOString().slice(0, 10); // Format date as YYYY-MM-DD
        const filename = `Expenses-UserId-${userId}-${formattedDate}.txt`;

        // Upload to S3 and get the file URL
        const fileURL = await uploadToS3(stringifiedExpenses, filename);

        res.status(200).json({
            fileURL,
            filename,
            success: true,
            message: 'File uploaded successfully.',
        });
    } catch (error) {
        console.error("Failed to upload file:", error);
        res.status(500).json({ success: false, message: "Failed to upload expenses." });
    }
};

// Helper function to upload data to AWS S3
async function uploadToS3(data, filename) {
    const BUCKET_NAME = "expensetractor";

    const params = {
        Bucket: BUCKET_NAME,
        Key: filename,
        Body: data,
        ACL: 'public-read',
    };

    try {
        const s3Response = await s3.putObject(params).promise();
        console.log("Upload successful", s3Response);
        return `https://${BUCKET_NAME}.s3.amazonaws.com/${filename}`;
    } catch (err) {
        console.error("Error uploading to S3", err);
        throw err;
    }
}

// Add expense and update user totalExpense
const addExpense = [
    body('amount').isNumeric().withMessage('Amount is required and must be a number.'),
    body('description').notEmpty().withMessage('Description is required.'),
    body('category').notEmpty().withMessage('Category is required.'),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        let { amount, description, category } = req.body;
        const userId = req.userId;

        amount = Number(amount);

        try {
            // Start a session for transaction-like operations (MongoDB doesn't support transactions in the same way as relational databases)
            const session = await mongoose.startSession();
            session.startTransaction();

            // Create the new expense
            const newExpense = new Expense({ amount, description, category, userId });
            await newExpense.save({ session });

            const user = await User.findById(userId);
            if (user) {
                user.totalExpense += amount;
                await user.save({ session });
            }

            await session.commitTransaction();
            session.endSession();

            res.status(201).json(newExpense);
        } catch (error) {
            console.error('Error adding expense:', error);
            res.status(500).json({ message: 'Error adding expense.', error: error.message });
        }
    }
];

// Delete an expense and update user totalExpense
const deleteExpense = async (req, res) => {
    const { expenseId } = req.body;
    const userId = req.userId;

    try {
        // Start a session for transaction-like operations
        const session = await mongoose.startSession();
        session.startTransaction();

        const expense = await Expense.findOne({ _id: expenseId, userId });
        if (!expense) {
            return res.status(404).json({ message: 'Expense not found or user not authorized.' });
        }

        const user = await User.findById(userId);
        if (user) {
            user.totalExpense -= expense.amount;
            await user.save({ session });
        }

        await expense.remove({ session });

        await session.commitTransaction();
        session.endSession();

        res.status(200).json({ message: 'Expense deleted successfully.' });
    } catch (error) {
        console.error('Error deleting expense:', error);
        res.status(500).json({ message: 'Error deleting expense.', error: error.message });
    }
};

module.exports = { addExpense, getExpenses, deleteExpense, downloadExpense };
