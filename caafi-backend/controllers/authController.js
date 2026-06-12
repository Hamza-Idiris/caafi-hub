// controllers/authController.js — Login & registration logic
const User          = require('../models/User');
const Shop          = require('../models/Shop');
const generateToken = require('../utils/generateToken');
const { success, error } = require('../utils/apiResponse');

// ─────────────────────────────────────────────────────────
// @route   POST /api/auth/system/login
// @desc    Login for Admin, Staff, Driver
// @access  Public
// ─────────────────────────────────────────────────────────
const systemLogin = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return error(res, 400, 'Username and password are required.');
  }

  const user = await User.findOne({ username: username.toLowerCase() }).select('+password');
  if (!user || !user.isActive) {
    return error(res, 401, 'Invalid credentials or account deactivated.');
  }

  const match = await user.matchPassword(password);
  if (!match) {
    return error(res, 401, 'Invalid credentials.');
  }

  const token = generateToken({ id: user._id, role: user.role, actorType: 'user' });

  const userData = {
    _id:         user._id,
    name:        user.name,
    username:    user.username,
    role:        user.role,
    plateNumber: user.plateNumber,
    vehicle:     user.vehicle,
    isActive:    user.isActive,
  };

  return success(res, 200, 'Login successful', { token, user: userData });
};

// ─────────────────────────────────────────────────────────
// @route   POST /api/auth/shop/register
// @desc    New shop self-registration
// @access  Public
// ─────────────────────────────────────────────────────────
const shopRegister = async (req, res) => {
  const { shopName, ownerName, phone, district, pin } = req.body;

  const existing = await Shop.findOne({ phone });
  if (existing) {
    return error(res, 409, 'A shop with this phone number is already registered.');
  }

  const shop = await Shop.create({ shopName, ownerName, phone, district, pin });

  const token = generateToken({ id: shop._id, role: 'shop', actorType: 'shop' });

  return success(res, 201, 'Shop registered successfully', {
    token,
    shop: {
      _id:       shop._id,
      shopName:  shop.shopName,
      ownerName: shop.ownerName,
      phone:     shop.phone,
      district:  shop.district,
    },
  });
};

// ─────────────────────────────────────────────────────────
// @route   POST /api/auth/shop/login
// @desc    Shop login by phone + PIN
// @access  Public
// ─────────────────────────────────────────────────────────
const shopLogin = async (req, res) => {
  const { phone, pin } = req.body;

  if (!phone || !pin) {
    return error(res, 400, 'Phone and PIN are required.');
  }

  const shop = await Shop.findOne({ phone }).select('+pin');
  if (!shop) {
    return error(res, 404, 'No account found with this phone number.');
  }
  if (!shop.isActive) {
    return error(res, 401, 'Account is deactivated. Contact support.');
  }

  const match = await shop.matchPin(pin);
  if (!match) {
    return error(res, 401, 'Incorrect PIN.');
  }

  const token = generateToken({ id: shop._id, role: 'shop', actorType: 'shop' });

  return success(res, 200, 'Login successful', {
    token,
    shop: {
      _id:       shop._id,
      shopName:  shop.shopName,
      ownerName: shop.ownerName,
      phone:     shop.phone,
      district:  shop.district,
      createdAt: shop.createdAt,
    },
  });
};

// ─────────────────────────────────────────────────────────
// @route   GET /api/auth/me
// @desc    Get the current authenticated actor's profile
// @access  Private (all roles)
// ─────────────────────────────────────────────────────────
const getMe = async (req, res) => {
  if (req.role === 'shop') {
    return success(res, 200, 'Shop profile retrieved', { role: 'shop', ...req.shop.toObject() });
  }
  return success(res, 200, 'User profile retrieved', { ...req.user.toObject() });
};

module.exports = { systemLogin, shopRegister, shopLogin, getMe };
