// controllers/driverController.js — Driver delivery workspace
const Order = require('../models/Order');
const { success, error } = require('../utils/apiResponse');

// ─────────────────────────────────────────────────────────
// GET /api/driver/deliveries — Today's assigned orders
// ─────────────────────────────────────────────────────────
const getMyDeliveries = async (req, res) => {
  const filter = { assignedDriver: req.user._id };
  if (req.query.status) filter.status = req.query.status;

  const orders = await Order.find(filter)
    .populate('shop', 'shopName district ownerName phone address')
    .sort({ dispatchedAt: 1 });

  return success(res, 200, 'Deliveries retrieved', orders);
};

// ─────────────────────────────────────────────────────────
// GET /api/driver/deliveries/:id — Single delivery detail
// ─────────────────────────────────────────────────────────
const getDeliveryById = async (req, res) => {
  const order = await Order.findOne({
    _id:            req.params.id,
    assignedDriver: req.user._id,
  }).populate('shop', 'shopName district ownerName phone address');

  if (!order) return error(res, 404, 'Delivery not found or not assigned to you.');
  return success(res, 200, 'Delivery retrieved', order);
};

// ─────────────────────────────────────────────────────────
// PATCH /api/driver/deliveries/:id/status
// body: { status: 'On The Way' | 'Delivered' }
// ─────────────────────────────────────────────────────────
const updateDeliveryStatus = async (req, res) => {
  const { status } = req.body;
  const transitions = { Dispatched: 'On The Way', 'On The Way': 'Delivered' };

  const order = await Order.findOne({
    _id:            req.params.id,
    assignedDriver: req.user._id,
  });

  if (!order) return error(res, 404, 'Order not found or not assigned to you.');

  const next = transitions[order.status];
  if (!next || next !== status) {
    return error(res, 409, `Cannot move from "${order.status}" to "${status}".`);
  }

  order.status = status;
  order.statusLog.push({
    status,
    actorModel: 'User',
    changedBy:  req.user._id,
    note:       status === 'Delivered' ? 'Delivery confirmed by driver' : 'Driver en route',
  });

  await order.save();

  const populated = await order.populate('shop', 'shopName district ownerName phone');
  return success(res, 200, `Delivery updated to "${status}"`, populated);
};

// ─────────────────────────────────────────────────────────
// GET /api/driver/stats — Driver's own delivery summary
// ─────────────────────────────────────────────────────────
const getDriverStats = async (req, res) => {
  const driverId = req.user._id;

  const [active, delivered, total] = await Promise.all([
    Order.countDocuments({ assignedDriver: driverId, status: { $in: ['Dispatched', 'On The Way'] } }),
    Order.countDocuments({ assignedDriver: driverId, status: 'Delivered' }),
    Order.countDocuments({ assignedDriver: driverId }),
  ]);

  return success(res, 200, 'Driver stats', { active, delivered, total });
};

module.exports = { getMyDeliveries, getDeliveryById, updateDeliveryStatus, getDriverStats };
