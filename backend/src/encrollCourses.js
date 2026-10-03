const express = require('express');
const router = express.Router();
const conn = require('./connectDB');

// POST /encrollcourse/addcourse — enroll a student
router.post('/addcourse', (req, res) => {
    const { CID, SID } = req.body;
    console.log('[encroll] addcourse → CID:', CID, 'SID:', SID);
    if (!CID || !SID) {
        return res.status(400).json({ message: 'CID and SID are required' });
    }
    const sql = `INSERT INTO encrollcourses (CID,SID,VID) VALUES (?,?,'V1')`;
    conn.query(sql, [CID, SID], (err) => {
        if (err) {
            console.error('[encroll] addcourse error:', err.message);
            return res.status(500).json({ message: err.message });
        }
        console.log('[encroll] addcourse success');
        res.status(200).json({ message: 'success' });
    });
});

// GET /encrollcourse/mycourses?SID=xxx — get enrolled courses for a student
router.get('/mycourses', (req, res) => {
    const { SID } = req.query;
    console.log('[encroll] mycourses → SID:', SID);

    if (!SID) {
        return res.status(400).json({ message: 'SID is required' });
    }

    const sql =
        'SELECT c.* FROM courses c ' +
        'INNER JOIN encrollcourses e ON c.CID = e.CID ' +
        'WHERE e.SID = ?';

    conn.query(sql, [SID], (err, result) => {
        if (err) {
            console.error('[encroll] mycourses error:', err.message);
            return res.status(500).json({ message: err.message });
        }
        console.log('[encroll] mycourses result count:', result.length);
        res.status(200).json({ result });
    });
});

module.exports = router;