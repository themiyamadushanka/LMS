const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const conn = require('../src/connectDB');
require('dotenv').config();

// Serialize by email — always present for Google OAuth users, never null
passport.serializeUser((user, done) => {
    if (!user || !user.email) {
        return done(new Error('Cannot serialize user: email is missing'));
    }
    done(null, user.email);
});

passport.deserializeUser((email, done) => {
    conn.query('SELECT * FROM user WHERE email = ?', [email], (err, result) => {
        if (err) return done(err);
        done(null, result[0] || null);
    });
});

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:8890/auth/google/callback"
},
    function (accessToken, refreshToken, profile, done) {
        const googleId = profile.id;
        const email = (profile.emails && profile.emails[0].value) || '';
        let username = profile.displayName || (email ? email.split('@')[0] : googleId);

        // Ensure username doesn't have spaces and max 20 chars for database
        username = username.toLowerCase().replace(/[^a-z0-9_]/g, '').substring(0, 20);

        // Check if user already exists by email ONLY
        conn.query('SELECT * FROM user WHERE email = ?', [email], (err, result) => {
            if (err) {
                console.error("Database error during Google Auth:", err);
                return done(err);
            }

            if (result && result.length > 0) {
                // User already exists, log them in!
                return done(null, result[0]);
            } else {
                // Function to generate a unique username under 20 chars
                const checkUniqueUsername = (baseUsername, callback) => {
                    conn.query('SELECT sid FROM user WHERE sid = ?', [baseUsername], (err, rows) => {
                        if (err) return callback(err);
                        if (rows.length === 0) return callback(null, baseUsername); // Free to use!

                        // It's taken! Append 3 random numbers.
                        const suffix = Math.floor(100 + Math.random() * 900).toString();
                        // Keep the total length strictly <= 20
                        const newBase = baseUsername.substring(0, 20 - suffix.length) + suffix;
                        checkUniqueUsername(newBase, callback); // check again
                    });
                };

                checkUniqueUsername(username, (err, finalUsername) => {
                    if (err) return done(err);

                    // We need to create a new user with the guaranteed unique username
                    const sql = 'INSERT INTO user (sid, password, email) VALUES (?, ?, ?)';

                    const dummyPass = 'google_auth';

                    conn.query(sql, [finalUsername, dummyPass, email], (err, insertResult) => {
                        if (err) {
                            console.error("Error creating new Google user:", err);
                            return done(err);
                        }

                        conn.query('SELECT * FROM user WHERE sid = ?', [finalUsername], (err, newUser) => {
                            if (err) return done(err);
                            return done(null, newUser[0]);
                        });
                    });
                });
            }
        });
    }
));

module.exports = passport;
