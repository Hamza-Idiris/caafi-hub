// controllers/staffController.js — Staff CRM, order auditing, and dispatch support
const Shop  = require('../models/Shop');
const Order = require('../models/Order');
const User  = require('../models/User');
const { success, error } = require('../utils/apiResponse');

// ─────────────────────────────────────────────────────────
// GET /api/staff/shops — List all client shops
// ─────────────────────────────────────────────────────────
const getShops = async (req, res) => {
  const { search } = req.query;
  const filter = {};

  if (search) {
    filter.$or = [
      { shopName:  { $regex: search, $options: 'i' } },
      { ownerName: { $regex: search, $options: 'i' } },
      { phone:     { $regex: search, $options: 'i' } },
      { district:  { $regex: search, $options: 'i' } },
    ];
  }

  const shops = await Shop.find(filter).sort({ createdAt: -1 });
  return success(res, 200, 'Shops retrieved', shops);
};

// ─────────────────────────────────────────────────────────
// GET /api/staff/shops/:id — Single shop + its orders
// ─────────────────────────────────────────────────────────
const getShopById = async (req, res) => {
  const shop = await Shop.findById(req.params.id);
  if (!shop) return error(res, 404, 'Shop not found.');

  const orders = await Order.find({ shop: shop._id })
    .populate('assignedDriver', 'name plateNumber')
    .sort({ createdAt: -1 });

  return success(res, 200, 'Shop retrieved', { shop, orders });
};

// ─────────────────────────────────────────────────────────
// PUT /api/staff/shops/:id — Update shop contact info (CRM)
// Staff can only edit district, phone, ownerName, address, notes
// ─────────────────────────────────────────────────────────
const updateShop = async (req, res) => {
  const editable = ['ownerName', 'phone', 'district', 'address', 'notes'];
  const updates  = Object.fromEntries(
    Object.entries(req.body).filter(([k]) => editable.includes(k))
  );

  if (Object.keys(updates).length === 0) {
    return error(res, 400, 'No editable fields provided.');
  }

  const shop = await Shop.findByIdAndUpdate(req.params.id, updates, {
    new: true, runValidators: true,
  });
  if (!shop) return error(res, 404, 'Shop not found.');

  return success(res, 200, 'Shop profile updated', shop);
};

// ─────────────────────────────────────────────────────────
// GET /api/staff/summary — Staff dashboard counts
// ─────────────────────────────────────────────────────────
const getSummary = async (_req, res) => {
  const [pending, approved, inTransit, delivered, totalShops] = await Promise.all([
    Order.countDocuments({ status: 'Pending' }),
    Order.countDocuments({ status: 'Approved' }),
    Order.countDocuments({ status: { $in: ['Dispatched', 'On The Way'] } }),
    Order.countDocuments({ status: 'Delivered' }),
    Shop.countDocuments({ isActive: true }),
  ]);

  return success(res, 200, 'Summary retrieved', {
    pending, approved, inTransit, delivered, totalShops,
  });
};

// ─────────────────────────────────────────────────────────
// NEW — GET /api/staff/drivers — List active drivers
// Needed so staff can pick a driver when dispatching an order,
// without requiring admin-only access to /admin/users.
// ─────────────────────────────────────────────────────────
const getDrivers = async (_req, res) => {
  const drivers = await User.find({ role: 'driver', isActive: true })
    .select('name username plateNumber vehicle')
    .sort({ name: 1 });

  return success(res, 200, 'Drivers retrieved', drivers);
};

module.exports = { getShops, getShopById, updateShop, getSummary, getDrivers };
