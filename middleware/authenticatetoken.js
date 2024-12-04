const jwt = require('jsonwebtoken');


const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.sendStatus(401); // No token provided

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403); // Token is invalid
        req.userId = user.userId; // Attach userId to the request
        next();
    });
};

module.exports = authenticateToken;