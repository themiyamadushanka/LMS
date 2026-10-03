const express = require('express');
const router = express.Router();
require('dotenv').config();
router.use(express.json());
const Auth = require('./authMiddleware');

const conn = require('./connectDB');

router.post('', Auth, (req, res) => {
    if (!req.body || !req.headers) {
        return res.status(400).json({ message: 'Request body is missing' });
    }
    console.log(req.headers['authorization']);
    console.log(req.body);
    const { Cname, Thumbnail, isActive, Description } = req.body;
    const sql = `INSERT INTO courses (CName, Thumbnail, isActive, Description) VALUES (?, ?, ?, ?)`;
    conn.query(sql, [Cname, Thumbnail, isActive, Description], (err) => {
        if (err) {
            console.error('Course insert failed:', err.message);
            return res.status(500).json({ message: 'Database error' });
        }
        console.log('success');
        res.status(200).json({ message: 'success' });
    });
});

module.exports = router;