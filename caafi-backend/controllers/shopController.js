// controllers/shopController.js — Shop self-service profile management
const Shop  = require('../models/Shop');
const { success, error } = require('../utils/apiResponse');

// GET /api/shops/profile
const getProfile = async (req, res) => {
  return success(res, 200, 'Profile retrieved', req.shop);
};

// PUT /api/shops/profile
const updateProfile = async (req, res) => {
  const allowed = ['ownerName', 'phone', 'district', 'address'];
  const updates = Object.fromEntries(
    Object.entries(req.body).filter(([k]) => allowed.includes(k))
  );

  if (Object.keys(updates).length === 0) {
    return error(res, 400, 'No valid fields to update.');
  }

  if (updates.phone) {
    const taken = await Shop.findOne({ phone: updates.phone, _id: { $ne: req.shop._id } });
    if (taken) return error(res, 409, 'This phone number is already used by another shop.');
  }

  const shop = await Shop.findByIdAndUpdate(req.shop._id, updates, {
    new: true, runValidators: true,
  });

  return success(res, 200, 'Profile updated', shop);
};

module.exports = { getProfile, updateProfile };
