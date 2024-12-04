require('dotenv').config({ path: '../expenseapppassword/.env' });
const Sequelize = require('sequelize');
const sequelize = new Sequelize(process.env.DB_NAME,process.env.DB_USERNAME,process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: "mysql",
    port:process.env.DB_PORT,
});

const User = require('../models/user')(sequelize, Sequelize.DataTypes);
const Expense = require('../models/expense')(sequelize, Sequelize.DataTypes);
const Order = require('../models/order')(sequelize, Sequelize.DataTypes);
const ForgotPasswordRequest = require('../models/forgotpassword')(sequelize, Sequelize.DataTypes);

const models = {
    User,
    Expense,
    Order,
    ForgotPasswordRequest,
};

Object.keys(models).forEach((modelName) => {
    if (models[modelName].associate) {
        models[modelName].associate(models);
    }
});

module.exports = { sequelize, models };