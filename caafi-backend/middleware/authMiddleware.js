// middleware/authMiddleware.js — JWT verification + RBAC helpers
const jwt   = require('jsonwebtoken');
const User  = require('../models/User');
const Shop  = require('../models/Shop');
const { error } = require('../utils/apiResponse');

// ─────────────────────────────────────────────────────────
// protect — verifies JWT and attaches the actor to req
// Works for both system users (User model) and shops (Shop model)
// ─────────────────────────────────────────────────────────
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return error(res, 401, 'Not authorised — no token provided.');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Token carries { id, role, actorType }
    if (decoded.actorType === 'shop') {
      const shop = await Shop.findById(decoded.id);
      if (!shop || !shop.isActive) {
        return error(res, 401, 'Shop account not found or deactivated.');
      }
      req.shop = shop;
      req.role = 'shop';
    } else {
      const user = await User.findById(decoded.id);
      if (!user || !user.isActive) {
        return error(res, 401, 'User account not found or deactivated.');
      }
      req.user = user;
      req.role = user.role;
    }

    next();
  } catch (err) {
    const msg =
      err.name === 'TokenExpiredError'
        ? 'Token expired, please log in again.'
        : 'Invalid token.';
    return error(res, 401, msg);
  }
};

// ─────────────────────────────────────────────────────────
// authorise — restrict to specific roles
// Usage: authorise('admin', 'staff')
// ─────────────────────────────────────────────────────────
const authorise = (...roles) => (req, res, next) => {
  if (!roles.includes(req.role)) {
    return error(
      res,
      403,
      `Access denied — requires role: [${roles.join(', ')}].`
    );
  }
  next();
};

module.exports = { protect, authorise };
