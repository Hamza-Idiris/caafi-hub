// models/Order.js — Water barrel orders with full delivery lifecycle
const mongoose = require('mongoose');

// ── Status flow: Pending → Approved → Dispatched → On The Way → Delivered
const ORDER_STATUSES = ['Pending', 'Approved', 'Dispatched', 'On The Way', 'Delivered', 'Rejected'];

const StatusLogSchema = new mongoose.Schema(
  {
    status:    { type: String, enum: ORDER_STATUSES, required: true },
    changedBy: { type: mongoose.Schema.Types.ObjectId, refPath: 'statusLog.actorModel' },
    actorModel:{ type: String, enum: ['User', 'Shop'] },
    note:      { type: String, default: '' },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    // ── Relations ──────────────────────────────────────────
    shop: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Shop',
      required: [true, 'Shop reference is required'],
    },
    assignedDriver: {
      type:    mongoose.Schema.Types.ObjectId,
      ref:     'User',
      default: null,
    },
    approvedBy: {
      type:    mongoose.Schema.Types.ObjectId,
      ref:     'User',
      default: null,
    },

    // ── Order Details ──────────────────────────────────────
    quantity: {
      type:    Number,
      required:[true, 'Quantity is required'],
      min:     [10, 'Minimum order is 10 barrels (20L each)'],
      max:     [500, 'Maximum order is 500 barrels per request'],
    },
    barrelSize: {
      type:    Number,
      default: 20,        // 20-litre barrels
      immutable: true,
    },

    // ── Status ─────────────────────────────────────────────
    status: {
      type:    String,
      enum:    ORDER_STATUSES,
      default: 'Pending',
    },

    // ── Fleet ──────────────────────────────────────────────
    plateNumber: {
      type:    String,
      default: null,
    },

    // ── Timestamps ─────────────────────────────────────────
    approvedAt:   { type: Date, default: null },
    dispatchedAt: { type: Date, default: null },
    pickedUpAt:   { type: Date, default: null },
    deliveredAt:  { type: Date, default: null },

    // ── Tracking ───────────────────────────────────────────
    statusLog: [StatusLogSchema],

    // ── Extras ─────────────────────────────────────────────
    note: {
      type:    String,
      trim:    true,
      default: '',
      maxlength: [200, 'Note must be 200 characters or less'],
    },
  },
  {
    timestamps: true,
    toJSON:     { virtuals: true },
    toObject:   { virtuals: true },
  }
);

// ── Virtual: total litres ─────────────────────────────────
OrderSchema.virtual('totalLitres').get(function () {
  return this.quantity * this.barrelSize;
});

// ── Pre-save: auto-set timestamps on status change ────────
OrderSchema.pre('save', function (next) {
  if (this.isModified('status')) {
    const now = new Date();
    if (this.status === 'Approved'    && !this.approvedAt)   this.approvedAt   = now;
    if (this.status === 'Dispatched'  && !this.dispatchedAt) this.dispatchedAt = now;
    if (this.status === 'On The Way'  && !this.pickedUpAt)   this.pickedUpAt   = now;
    if (this.status === 'Delivered'   && !this.deliveredAt)  this.deliveredAt  = now;
  }
  next();
});

// ── Static: allowed next statuses for RBAC ───────────────
OrderSchema.statics.allowedTransitions = {
  Pending:     { staff: ['Approved', 'Rejected'] },
  Approved:    { admin: ['Dispatched', 'Rejected'] },
  Dispatched:  { driver: ['On The Way'] },
  'On The Way':{ driver: ['Delivered'] },
  Delivered:   {},
  Rejected:    {},
};

// ── Indexes ───────────────────────────────────────────────
OrderSchema.index({ shop: 1, status: 1 });
OrderSchema.index({ assignedDriver: 1, status: 1 });
OrderSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Order', OrderSchema);
