// models/Complaint.js
const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  registerNumber: { type: String, required: true },
  hostelName: { type: String, required: true },
  floor: { type: String, required: true },
  room: { type: String, required: true },
  issue: { type: String, required: true },
  status: { type: String, enum: ['Pending','In Progress','Resolved'], default: 'Pending' },
  adminComment: { type: String },
  nextActionDate: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Complaint', ComplaintSchema);
