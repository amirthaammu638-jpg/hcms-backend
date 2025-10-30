// app.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const session = require('express-session');
const MongoStore = require('connect-mongo');

dotenv.config();
const app = express();

// --- DB ---
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hostel_complaints';
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

// --- Middlewares ---
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// --- Sessions ---
app.use(session({
  secret: process.env.SESSION_SECRET || 'devsecret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: MONGO_URI }),
  cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 day
}));

// --- Make user available to views ---
app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  next();
});

// --- Routes ---
const authRoutes = require('./routes/auth');
const complaintRoutes = require('./routes/complaints');

app.use('/', authRoutes);
app.use('/complaints', complaintRoutes);

// --- Home ---
// app.get('/', (req, res) => res.render('index', { title: 'Home' }));

// --- Start ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
