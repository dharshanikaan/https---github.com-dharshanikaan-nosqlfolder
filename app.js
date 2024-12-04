require('dotenv').config({ path: '../expenseapppassword/.env' });
const express = require('express');
const { sequelize } = require('./util/database');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const userRoutes = require('./routes/userroutes');
const expenseRoutes = require('./routes/expenseroutes');
const purchaseRoutes = require('./routes/purchaseroutes');
const premiumFeaturesRoutes = require('./routes/premiumfeaturesroutes');
const passwordRoutes = require('./routes/password');
const fs=require('fs');
const https=require('https');
const app = express();
const helmet=require('helmet');
const compression=require('compression');
const morgan=require('morgan');
// Middleware setup
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'views')));


const privateKey =fs.readFileSync('server.key');
const certificate=fs.readFileSync('server.cert');

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

const accessLogStream = fs.createWriteStream(
    path.join(__dirname, "access.log"),
    { flag: 'a' }
);

app.use(helmet())
app.use(compression())
app.use(morgan('combined',{stream:accessLogStream}));

// Sync database and start the server
sequelize.sync()
    .then(() => {
        https.createServer({key:privateKey,cert:certificate},app)
        .listen(3000, () => {
            console.log('Server running on http://localhost:3000');
        });
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
    });