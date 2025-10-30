// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  registerNumber: { type: String, unique: true, sparse: true }, // students
  staffId: { type: String, unique: true, sparse: true },        // admins/staff
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  name: { type: String },
}, { timestamps: true });

// Hash before save
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = async function(candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', UserSchema);
