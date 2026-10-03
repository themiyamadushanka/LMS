const express = require('express');
const jwt = require('jsonwebtoken');
const conn = require('./connectDB');
require('dotenv').config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// POST /login
router.post('/', (req, res) => {
    const { user, pass } = req.body;

    if (!user || !pass) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    const sql = "SELECT * FROM user WHERE sid = ?";
    
    conn.query(sql, [user], (err, result) => {
        if (err) {
            console.error('Login database error:', err);
            return res.status(500).json({ message: "Internal server error" });
        }

        // If no user found with that sid
        if (!result || result.length === 0) {
            return res.status(404).json({ message: "User not found. Please sign up." });
        }

        const dbUser = result[0];

        // Check if password matches
        if (dbUser.password === pass) {
            // Sign token and send it back. 
            // In a real app, you would use bcrypt to compare passwords.
            const token = jwt.sign(
                { id: dbUser.SID, email: dbUser.email }, 
                JWT_SECRET, 
                { expiresIn: '1h' }
            );
            return res.status(200).json({ token, message: "Login successful" });
        } else {
            return res.status(401).json({ message: "Invalid credentials" });
        }
    });
});

module.exports = router;
