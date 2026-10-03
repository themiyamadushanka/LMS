const express = require('express');
const router = express.Router();
const conn = require('./connectDB');
const Auth = require('./authMiddleware');

// GET /seeuser — fetch all courses (protected)
router.get('', Auth, (req, res) => {
    const sql = 'select * from courses';
    conn.query(sql, (err, result) => {
        if (err) {
            console.error('Query failed:', err.message);
            return res.status(500).json({ message: 'Database error' });
        }
        console.log(result);
        res.status(200).json({ result });
    });
});

// GET /seeuser/check-username?username=xxx — check if a username (sid) is available
router.get('/check-username', (req, res) => {
    const { username } = req.query;
    if (!username || username.length < 3) {
        return res.status(400).json({ available: false, message: 'Username too short' });
    }
    const sql = 'SELECT sid FROM user WHERE sid = ?';
    conn.query(sql, [username], (err, result) => {
        if (err) {
            console.error('Username check failed:', err.message);
            return res.status(500).json({ message: 'Database error' });
        }
        res.status(200).json({ available: result.length === 0 });
    });
});

module.exports = router;
