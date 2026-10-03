const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

const Authonthicate = (req, res, next) => {
    const header = req.headers['authorization']; // Fixed from req.header
    const token = header;

    if (!token) {
        return res.status(404).json({ messege: "token missing" });
    }
    
    // Verify JWT token
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid token' });
        req.user = user;
        next();
    });
}

module.exports = Authonthicate;
