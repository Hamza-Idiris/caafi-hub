// ============================================================
// CAAFI WATER OPERATIONS — SERVER ENTRY POINT
// ============================================================
require('dotenv').config();
require('express-async-errors');

const express  = require('express');
const cors     = require('cors');
const helmet   = require('helmet');
const morgan   = require('morgan');
const rateLimit = require('express-rate-limit');

const connectDB    = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// ── Route Imports ─────────────────────────────────────────
const authRoutes   = require('./routes/authRoutes');
const shopRoutes   = require('./routes/shopRoutes');
const orderRoutes  = require('./routes/orderRoutes');
const driverRoutes = require('./routes/driverRoutes');
const staffRoutes  = require('./routes/staffRoutes');
const adminRoutes  = require('./routes/adminRoutes');

// ── Init ──────────────────────────────────────────────────
connectDB();
const app = express();

// ── Global Middleware ─────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ── Rate Limiting ─────────────────────────────────────────
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max:      parseInt(process.env.RATE_LIMIT_MAX)        || 100,
  message:  { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);

// ── Health Check ──────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Caafi API is running',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ── API Routes ────────────────────────────────────────────
app.use('/api/auth',   authRoutes);
app.use('/api/shops',  shopRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/driver', driverRoutes);
app.use('/api/staff',  staffRoutes);
app.use('/api/admin',  adminRoutes);

// ── 404 Handler ───────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

// ── Global Error Handler ──────────────────────────────────
app.use(errorHandler);

// ── Start Server ──────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🌊  Caafi API running on port ${PORT} [${process.env.NODE_ENV}]`);
  console.log(`🔗  Health check: http://localhost:${PORT}/api/health\n`);
});

module.exports = app;
