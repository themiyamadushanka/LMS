/* Dependencies */
const router = require("express").Router();
const passport = require("../config/passport");
const jwt = require("jsonwebtoken");
require("dotenv").config();

/* Route to start OAuth2 authentication */
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["https://www.googleapis.com/auth/plus.login", "email"],
  })
);

/* Callback route for OAuth2 authentication */
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "http://localhost:8891/" }),
  function (req, res) {
    // Successful authentication
    console.log("Google Auth Success, User:", req.user);

    // Use sid if available, otherwise fall back to email as the JWT identity
    const identity = req.user.sid || req.user.email;

    // Generate JWT token for the frontend
    const token = jwt.sign({ id: identity }, process.env.JWT_SECRET, { expiresIn: '1h' });

    req.session.save(() => {
      // Set the token in a cookie that the frontend App.jsx reads
      res.cookie('auth_token', token, {
        maxAge: 60 * 60 * 1000, // 1 hour
        path: '/',
        sameSite: 'lax'
      });

      // Redirect back to the frontend app (courses page)
      res.redirect("http://localhost:8891/allcourses");
    });
  }
);

/* EXPORTS */
module.exports = router;