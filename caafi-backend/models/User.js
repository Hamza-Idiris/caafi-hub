// models/User.js — System user accounts (Admin | Staff | Driver)
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type:     String,
      required: [true, 'Name is required'],
      trim:     true,
      maxlength: [60, 'Name must be 60 characters or less'],
    },
    username: {
      type:      String,
      required:  [true, 'Username is required'],
      unique:    true,
      lowercase: true,
      trim:      true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [30, 'Username must be 30 characters or less'],
    },
    password: {
      type:      String,
      required:  [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select:    false, // never returned in queries by default
    },
    role: {
      type:     String,
      enum:     ['admin', 'staff', 'driver'],
      required: [true, 'Role is required'],
    },

    // ── Driver-specific fields ─────────────────────────────
    plateNumber: {
      type:      String,
      uppercase: true,
      trim:      true,
      default:   null,
    },
    vehicle: {
      type:    String,
      trim:    true,
      default: null,
    },

    // ── Account status ────────────────────────────────────
    isActive: {
      type:    Boolean,
      default: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'User',
      default: null,
    },
  },
  { timestamps: true }
);

// ── Pre-save: hash password ───────────────────────────────
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ── Pre-findOneAndUpdate: hash password on update ─────────
UserSchema.pre('findOneAndUpdate', async function (next) {
  const update = this.getUpdate();
  if (update.password) {
    const salt = await bcrypt.genSalt(12);
    update.password = await bcrypt.hash(update.password, salt);
  }
  next();
});

// ── Instance method: compare password ────────────────────
UserSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

// ── Virtual: driver order stats (populated separately) ───
UserSchema.virtual('orderCount', { ref: 'Order', localField: '_id', foreignField: 'assignedDriver', count: true });

// ── Index ────────────────────────────────────────────────
UserSchema.index({ role: 1, isActive: 1 });

module.exports = mongoose.model('User', UserSchema);
