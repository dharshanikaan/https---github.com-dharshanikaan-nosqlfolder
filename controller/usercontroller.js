const { body, validationResult } = require('express-validator');
const { models } = require('../util/database'); // Correct import
const User = models.User; // Use the imported User model
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const signup = [
    body('name').notEmpty().withMessage('Name is required.'),
    body('email').isEmail().withMessage('Valid email is required.'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long.'),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });  // Validation error
        }

        const { name, email, password } = req.body;

        try {
            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                return res.status(400).json({ message: 'User already exists.' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            await User.create({ name, email, password: hashedPassword });
            res.status(201).json({ message: 'User created successfully.' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error creating user.' });
        }
    }
];

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'User not authorized.' });
        }

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ message: 'User login successful.', token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error logging in.' });
    }
};

const getUserStatus = async (req, res) => {
    const userId = req.userId;

    try {
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }
        res.status(200).json({ isPremium: user.isPremium });
    } catch (error) {
        console.error('Error fetching user status:', error);
        res.status(500).json({ message: 'Error fetching user status.' });
    }
};

module.exports = { signup, login, getUserStatus };