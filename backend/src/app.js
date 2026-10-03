const express = require('express');
require('dotenv').config();
const app = express();
const cors = require('cors');
const seeUser = require('./seeUser');
const Otp = require('./reqOTP');
const login = require('./login');
const session = require('express-session');
const passport = require('../config/passport');
const encrollCourses = require('./encrollCourses');

/* OAuth Middleware */
app.use(session({
  secret: process.env.JWT_SECRET || 'secret',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
const path = require('path');

app.use(cors({
  origin: 'http://localhost:8891',
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..', 'public')));
const AllCoures = require('./AllCoures');



app.use('/encrollcourse', encrollCourses);

// Course routes
const addCourse = require('./addCourse');
app.use('/addcourse', addCourse);
app.use('/seeuser', seeUser);  
app.use('/seeCoures', AllCoures);
const signup = require('./signup');
app.use('/signup', signup);
app.use('/login',login);
app.use('/otp',Otp);

const googleAuth = require('./googleAuth');
app.use('/auth', googleAuth);

const port = process.env.PORT || 8890;

// Serve the frontend build
app.use(express.static(path.join(__dirname, '../../frontend/dist')));

// Catch-all route to serve React app for non-API routes
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
