const Razorpay = require('razorpay');
const Order = require('../models/order'); // Import Order model (Mongoose)
const User = require('../models/user'); // Import User model (Mongoose)
require('dotenv').config();

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create a new Razorpay order
const createOrder = async (req, res) => {
    const options = {
        amount: 50000, // ₹500 in paisa
        currency: 'INR',
        receipt: `receipt#${Date.now()}`,
        notes: { userId: req.userId }
    };

    try {
        const order = await razorpay.orders.create(options);

        // Create an Order document in MongoDB
        const newOrder = new Order({
            userId: req.userId,
            orderId: order.id,
            status: 'PENDING'
        });
        await newOrder.save();

        return res.status(201).json({ orderId: order.id, amount: options.amount });
    } catch (error) {
        console.error('Error creating order:', error);
        return res.status(500).json({ message: 'Error creating order.', error: error.message });
    }
};

// Handle the payment success and mark user as premium
const handlePaymentSuccess = async (req, res) => {
    const { orderId, paymentId } = req.body;

    try {
        // Find the order by orderId in the database
        const order = await Order.findOne({ orderId });
        if (!order) {
            return res.status(404).json({ message: 'Order not found.' });
        }

        // Update order status to successful
        order.status = 'SUCCESSFUL';
        await order.save();

        // Mark user as premium in the User model
        await User.updateOne({ _id: order.userId }, { $set: { isPremium: true } });

        return res.status(200).json({ message: 'Payment successful.' });
    } catch (error) {
        console.error('Error handling payment:', error);
        return res.status(500).json({ message: 'Error handling payment.' });
    }
};

module.exports = { createOrder, handlePaymentSuccess };
