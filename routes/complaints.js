// routes/complaints.js
const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');
const User = require('../models/User');

// middlewares
function ensureAuth(req, res, next) {
  if (!req.session.user) return res.redirect('/login');
  next();
}
function ensureAdmin(req, res, next) {
  if (!req.session.user || req.session.user.role !== 'admin') return res.redirect('/login');
  next();
}

// Student: show new complaint form
router.get('/new', ensureAuth, async (req, res) => {
  if (req.session.user.role !== 'student') return res.redirect('/');
  res.render('submit_complaint');
});

// Student: submit complaint
router.post('/', ensureAuth, async (req, res) => {
  try {
    if (req.session.user.role !== 'student') return res.status(403).send('Forbidden');
    const { hostelName, floor, room, issue } = req.body;
    const userId = req.session.user.id;
    const registerNumber = req.session.user.registerNumber;
    const comp = new Complaint({ student: userId, registerNumber, hostelName, floor, room, issue });
    await comp.save();
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error creating complaint');
  }
});

// Student: view their complaints
router.get('/mine', ensureAuth, async (req, res) => {
  if (req.session.user.role !== 'student') return res.redirect('/');
  const complaints = await Complaint.find({ student: req.session.user.id }).sort({ createdAt: -1 });
  res.render('complaint_view', { complaints, mine: true });
});

// Admin: view all complaints
router.get('/all', ensureAdmin, async (req, res) => {
  const complaints = await Complaint.find().sort({ createdAt: -1 }).populate('student');
  res.render('complaint_view', { complaints, mine: false });
});

// Admin: update status/comment/nextActionDate
router.post('/:id/update', ensureAdmin, async (req, res) => {
  try {
    const { status, adminComment, nextActionDate } = req.body;
    await Complaint.findByIdAndUpdate(req.params.id, { status, adminComment, nextActionDate: nextActionDate || null });
    res.redirect('/complaints/all');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error updating complaint');
  }
});

module.exports = router;
