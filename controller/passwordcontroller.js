const { models } = require('../util/database'); // Ensure correct import
const User = models.User;
const ForgotPasswordRequest = models.ForgotPasswordRequest; // Get from models
const SibApiV3Sdk = require('sib-api-v3-sdk');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Initialize Sendinblue API client
const apiKey = new SibApiV3Sdk.ApiClient();
apiKey.authentications['api-key'].apiKey = process.env.API_KEY;
SibApiV3Sdk.ApiClient.instance = apiKey;
const transactionalEmailsApi = new SibApiV3Sdk.TransactionalEmailsApi();

// Controller to handle forgot password request
const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const request = await ForgotPasswordRequest.create({ userId: user.id });

        const resetLink = `http://localhost:3000/password/resetpassword/${request.id}`;
        const sender = { name: 'Your App Name', email: 'dharshanikaan@gmail.com' };
        const emailContent = {
            sender,
            to: [{ email }],
            subject: 'Password Reset Request',
            htmlContent: `<html><body><h1>Reset Your Password</h1><p>Click <a href="${resetLink}">here</a> to reset your password.</p></body></html>`,
        };

        await transactionalEmailsApi.sendTransacEmail(emailContent);
        res.status(200).json({ message: 'Reset link sent to your email.' });
    } catch (error) {
        console.error('Error sending email:', error.response ? error.response.data : error.message);
        res.status(500).json({ message: 'Error processing request.' });
    }
};

// Controller to handle password reset
const resetPassword = async (req, res) => {
    const { id } = req.params;
    const { newPassword } = req.body;

    try {
        const request = await ForgotPasswordRequest.findOne({ where: { id, isActive: true } });
        if (!request) {
            return res.status(400).json({ message: 'Invalid or expired reset link.' });
        }

        const user = await User.findByPk(request.userId);
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        request.isActive = false; // Mark request as inactive
        await request.save();

        res.status(200).json({ message: 'Password updated successfully!' });
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({ message: 'Error processing request.' });
    }
};

module.exports = { forgotPassword, resetPassword };