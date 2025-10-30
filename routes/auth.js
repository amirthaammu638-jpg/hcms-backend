// routes/auth.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Middleware helpers
function ensureGuest(req, res, next) { if (req.session.user) return res.redirect('/dashboard'); next(); }
function ensureAuth(req, res, next) { if (!req.session.user) return res.redirect('/login'); next(); }

// ---- Student register
router.get('/register', ensureGuest, (req, res) => res.render('register'));
router.post('/register', async (req, res) => {
  try {
    let { registerNumber, password } = req.body;
    if (!registerNumber || !password) return res.send('Fill required fields');

    registerNumber = registerNumber.trim().toUpperCase();
    if (!/^URK\d{2}[A-Z]{2}\d{4}$/.test(registerNumber)) {
      return res.send('Invalid Register Number (expected URKxxDEPTxxxx)');
    }
    if (!/^\d{4}$/.test(password)) return res.send('Password must be 4 digits');

    const exists = await User.findOne({ registerNumber });
    if (exists) return res.send('User already exists, try login');

    const user = new User({ registerNumber, password, role: 'student' });
    await user.save();
    res.send('✅ Registration successful. <a href="/login">Login</a>');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// ---- Login (student or admin)
router.get('/login', ensureGuest, (req, res) => res.render('login'));
router.post('/login', async (req, res) => {
  try {
    let { id, password } = req.body; // id can be registerNumber or staffId
    if (!id || !password) return res.send('Fill required fields');

    id = id.trim().toUpperCase();

    // Try student then staff
    let user = await User.findOne({ registerNumber: id });
    if (!user) user = await User.findOne({ staffId: id });

    if (!user) return res.send('No account found with that id');

    const ok = await user.comparePassword(password);
    if (!ok) return res.send('Incorrect password');

    // save minimal user session
    req.session.user = { id: user._id, role: user.role, registerNumber: user.registerNumber, staffId: user.staffId };
    return res.redirect(user.role === 'admin' ? '/complaints/all' : '/dashboard');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// ---- Logout
router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    res.redirect('/');
  });
});

// ---- Student dashboard route (simple)
router.get('/dashboard', ensureAuth, async (req, res) => {
  if (req.session.user.role !== 'student') return res.redirect('/');
  // render page, complaints listing handled in complaints routes
  res.render('dashboard');
});

// ---- Helper route (one-time) to create admin - delete after use
router.get('/create-admin', async (req, res) => {
  try {
    const exists = await User.findOne({ staffId: 'WARDEN01' });
    if (exists) return res.send('Admin already exists');
    const admin = new User({ staffId: 'WARDEN01', password: '0000', role: 'admin', name: 'Warden' });
    await admin.save();
    res.send('Admin created: staffId=WARDEN01 password=0000');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error creating admin');
  }
});

module.exports = router;
