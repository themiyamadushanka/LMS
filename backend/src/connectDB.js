const mySql = require('mysql2');
require('dotenv').config();

// Use a pool instead of a single connection.
// A pool automatically creates new connections when the old one times out,
// fixing the "Can't add new command when connection is in closed state" error.
const conn = mySql.createPool({
    host: process.env.DBHOST,
    user: process.env.DBUSER,
    password: process.env.DBPASSWORD,
    database: process.env.DBNAME,
    ssl: {
        rejectUnauthorized: true
    },
    waitForConnections: true,
    connectionLimit: 10,      // max 10 simultaneous connections
    queueLimit: 0
});

conn.getConnection((err, connection) => {
    if (err) {
        console.error('Database connection failed:', err.message);
        return;
    }
    console.log('Database connected! (pool)');
    connection.release();
});

module.exports = conn;