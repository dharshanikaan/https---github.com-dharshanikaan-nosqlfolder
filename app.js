// app.js

require('dotenv').config({ path: '../expenseapppassword/.env' });
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const https = require('https');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const mongoose = require('mongoose'); // Import Mongoose

// Import the routes
const userRoutes = require('./routes/userroutes');
const expenseRoutes = require('./routes/expenseroutes');
const purchaseRoutes = require('./routes/purchaseroutes');
const premiumFeaturesRoutes = require('./routes/premiumfeaturesroutes');
const passwordRoutes = require('./routes/password');

// MongoDB connection URI from your environment file
const mongoURI = process.env.MONGO_URI || 'mongodb+srv://dharshanikaan:Dharsh56@cluster1.u1iay.mongodb.net/expense';

// Initialize the express app
const app = express();

// Middleware setup
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'views')));

// SSL certificates for HTTPS (ensure these files exist)
const privateKey = fs.readFileSync('server.key');
const certificate = fs.readFileSync('server.cert');

// Serve HTML files
app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'signup.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.get('/expenses', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'expenses.html'));
});

app.get('/leaderboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'premiumfeatures.html'));
});

// Use routes
app.use('/api/users', userRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/premium/purchase', purchaseRoutes); // Changed route to avoid conflict
app.use('/api/premium/features', premiumFeaturesRoutes); // Changed route to avoid conflict
app.use('/password', passwordRoutes);

// Logging setup
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flag: 'a' });
app.use(helmet());
app.use(compression());
app.use(morgan('combined', { stream: accessLogStream }));

// MongoDB connection setup
mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => {
        console.log('Connected to MongoDB');
        https.createServer({ key: privateKey, cert: certificate }, app).listen(3000, () => {
            console.log('Server running on https://localhost:3000');
        });
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1); // Exit the process if the connection fails
    });
