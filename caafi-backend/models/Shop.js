// models/Shop.js — Registered shop (B2B client) accounts
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const MOGADISHU_DISTRICTS = [
  'Hodan', 'Wadajir', 'Karaan', 'Heliwa', 'Dharkenley',
  'Kaxda', 'Boondheere', 'Hawl-Wadaag', 'Shangani', 'Yaaqshid',
];

const ShopSchema = new mongoose.Schema(
  {
    shopName: {
      type:     String,
      required: [true, 'Shop name is required'],
      trim:     true,
      maxlength: [80, 'Shop name must be 80 characters or less'],
    },
    ownerName: {
      type:     String,
      required: [true, 'Owner name is required'],
      trim:     true,
    },
    phone: {
      type:     String,
      required: [true, 'Phone number is required'],
      unique:   true,
      trim:     true,
      match:    [/^[0-9]{9,15}$/, 'Phone must be 9–15 digits'],
    },
    district: {
      type:     String,
      required: [true, 'District is required'],
      enum:     {
        values:  MOGADISHU_DISTRICTS,
        message: '{VALUE} is not a valid Mogadishu district',
      },
    },
    pin: {
      // 4-digit PIN used as shop "password"
      type:     String,
      required: [true, 'PIN is required'],
      select:   false,
    },
    isActive: {
      type:    Boolean,
      default: true,
    },
    address: {
      type:    String,
      trim:    true,
      default: '',
    },
    notes: {
      type:    String,
      trim:    true,
      default: '',
    },
  },
  {
    timestamps: true,
    toJSON:     { virtuals: true },
    toObject:   { virtuals: true },
  }
);

// ── Virtual: all orders from this shop ───────────────────
ShopSchema.virtual('orders', {
  ref:          'Order',
  localField:   '_id',
  foreignField: 'shop',
});

// ── Pre-save: hash PIN ────────────────────────────────────
ShopSchema.pre('save', async function (next) {
  if (!this.isModified('pin')) return next();
  const salt = await bcrypt.genSalt(10);
  this.pin = await bcrypt.hash(this.pin, salt);
  next();
});

// ── Instance method: verify PIN ───────────────────────────
ShopSchema.methods.matchPin = async function (enteredPin) {
  return bcrypt.compare(String(enteredPin), this.pin);
};

// ── Index ────────────────────────────────────────────────
// phone index is already created by unique:true on the field above
ShopSchema.index({ district: 1 });

module.exports = mongoose.model('Shop', ShopSchema);