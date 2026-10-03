const express = require('express');
const router = express.Router();
const conn = require('./connectDB');
const Auth = require('./authMiddleware');
router.post('', Auth,(req, res) => {
    console.log('Content-Type:', req.headers['content-type']);
    console.log('Body:', req.body);
    const { CID } = req.body;
    if (CID) {
        const sql = 'select CName from courses where CId=?';
        conn.query(sql, [CID], (err, result) => {
            if (err) {
                return res.status(404).json({ message: 'failed' });
            }
            return res.status(200).json({ results: result });
        });
    } else {
        return res.status(400).json({ message: 'CID is required' });
    }
});

module.exports = router;
