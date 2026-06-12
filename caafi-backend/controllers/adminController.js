// controllers/adminController.js — Full system control for Super Admin
const User  = require('../models/User');
const Shop  = require('../models/Shop');
const Order = require('../models/Order');
const { success, error } = require('../utils/apiResponse');

// ─── DASHBOARD ────────────────────────────────────────────
// GET /api/admin/stats
const getStats = async (_req, res) => {
  const [
    totalOrders, pendingOrders, approvedOrders,
    dispatchedOrders, deliveredOrders, rejectedOrders,
    totalShops, totalDrivers, totalStaff,
  ] = await Promise.all([
    Order.countDocuments(),
    Order.countDocuments({ status: 'Pending' }),
    Order.countDocuments({ status: 'Approved' }),
    Order.countDocuments({ status: { $in: ['Dispatched', 'On The Way'] } }),
    Order.countDocuments({ status: 'Delivered' }),
    Order.countDocuments({ status: 'Rejected' }),
    Shop.countDocuments({ isActive: true }),
    User.countDocuments({ role: 'driver', isActive: true }),
    User.countDocuments({ role: 'staff', isActive: true }),
  ]);

  const recentOrders = await Order.find()
    .populate('shop',           'shopName district')
    .populate('assignedDriver', 'name plateNumber')
    .sort({ createdAt: -1 })
    .limit(8);

  return success(res, 200, 'Stats retrieved', {
    orders: { total: totalOrders, pending: pendingOrders, approved: approvedOrders, inTransit: dispatchedOrders, delivered: deliveredOrders, rejected: rejectedOrders },
    shops:   totalShops,
    drivers: totalDrivers,
    staff:   totalStaff,
    recentOrders,
  });
};

// ─── USER MANAGEMENT ──────────────────────────────────────
// GET /api/admin/users
const getAllUsers = async (req, res) => {
  const filter = { role: { $ne: 'admin' } };
  if (req.query.role) filter.role = req.query.role;

  const users = await User.find(filter).sort({ createdAt: -1 });
  return success(res, 200, 'Users retrieved', users);
};

// POST /api/admin/users
const createUser = async (req, res) => {
  const { name, username, password, role, plateNumber, vehicle } = req.body;

  if (!name || !username || !password || !role) {
    return error(res, 400, 'name, username, password, and role are required.');
  }
  if (!['staff', 'driver'].includes(role)) {
    return error(res, 400, 'Role must be "staff" or "driver".');
  }
  if (role === 'driver' && !plateNumber) {
    return error(res, 400, 'Plate number is required for drivers.');
  }

  const existing = await User.findOne({ username: username.toLowerCase() });
  if (existing) return error(res, 409, 'Username already taken.');

  const user = await User.create({
    name, username, password, role,
    plateNumber: plateNumber || null,
    vehicle:     vehicle     || null,
    createdBy:   req.user._id,
  });

  return success(res, 201, 'User created', user);
};

// GET /api/admin/users/:id
const getUserById = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return error(res, 404, 'User not found.');
  return success(res, 200, 'User retrieved', user);
};

// PUT /api/admin/users/:id
const updateUser = async (req, res) => {
  const allowed = ['name', 'username', 'password', 'plateNumber', 'vehicle', 'isActive'];
  const updates = Object.fromEntries(
    Object.entries(req.body).filter(([k]) => allowed.includes(k))
  );

  if (Object.keys(updates).length === 0) {
    return error(res, 400, 'No valid fields to update.');
  }

  const user = await User.findByIdAndUpdate(req.params.id, updates, {
    new: true, runValidators: true,
  });
  if (!user) return error(res, 404, 'User not found.');

  return success(res, 200, 'User updated', user);
};

// DELETE /api/admin/users/:id
const deleteUser = async (req, res) => {
  if (req.params.id === req.user._id.toString()) {
    return error(res, 400, 'You cannot delete your own admin account.');
  }
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return error(res, 404, 'User not found.');
  return success(res, 200, 'User deleted successfully');
};

// PATCH /api/admin/users/:id/toggle
const toggleUserStatus = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return error(res, 404, 'User not found.');
  user.isActive = !user.isActive;
  await user.save();
  return success(res, 200, `User ${user.isActive ? 'activated' : 'deactivated'}`, user);
};

// ─── SHOP MANAGEMENT ──────────────────────────────────────
// GET /api/admin/shops
const getAllShops = async (req, res) => {
  const shops = await Shop.find().sort({ createdAt: -1 });
  return success(res, 200, 'Shops retrieved', shops);
};

// DELETE /api/admin/shops/:id
const deleteShop = async (req, res) => {
  const shop = await Shop.findByIdAndDelete(req.params.id);
  if (!shop) return error(res, 404, 'Shop not found.');
  return success(res, 200, 'Shop deleted');
};

// PATCH /api/admin/shops/:id/toggle
const toggleShopStatus = async (req, res) => {
  const shop = await Shop.findById(req.params.id);
  if (!shop) return error(res, 404, 'Shop not found.');
  shop.isActive = !shop.isActive;
  await shop.save();
  return success(res, 200, `Shop ${shop.isActive ? 'activated' : 'deactivated'}`, shop);
};

module.exports = {
  getStats,
  getAllUsers, createUser, getUserById, updateUser, deleteUser, toggleUserStatus,
  getAllShops, deleteShop, toggleShopStatus,
};
