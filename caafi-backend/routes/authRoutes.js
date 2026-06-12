// routes/authRoutes.js
const express = require('express');
const { body }  = require('express-validator');
const { systemLogin, shopRegister, shopLogin, getMe } = require('../controllers/authController');
const { protect }  = require('../middleware/authMiddleware');
const validate     = require('../middleware/validate');

const router = express.Router();

// POST /api/auth/system/login
router.post('/system/login',
  [
    body('username').notEmpty().withMessage('Username required'),
    body('password').notEmpty().withMessage('Password required'),
  ],
  validate,
  systemLogin
);

// POST /api/auth/shop/register
router.post('/shop/register',
  [
    body('shopName').notEmpty().trim().withMessage('Shop name required'),
    body('ownerName').notEmpty().trim().withMessage('Owner name required'),
    body('phone').matches(/^[0-9]{9,15}$/).withMessage('Phone must be 9–15 digits'),
    body('district').notEmpty().withMessage('District required'),
    body('pin').isLength({ min: 4, max: 6 }).isNumeric().withMessage('PIN must be 4–6 digits'),
  ],
  validate,
  shopRegister
);

// POST /api/auth/shop/login
router.post('/shop/login',
  [
    body('phone').notEmpty().withMessage('Phone required'),
    body('pin').notEmpty().withMessage('PIN required'),
  ],
  validate,
  shopLogin
);

// GET /api/auth/me  (all authenticated roles)
router.get('/me', protect, getMe);

module.exports = router;
