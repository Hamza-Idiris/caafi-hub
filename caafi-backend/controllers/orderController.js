// controllers/orderController.js — Order lifecycle for all roles
const Order = require('../models/Order');
const Shop  = require('../models/Shop');
const User  = require('../models/User');
const { success, error } = require('../utils/apiResponse');

// ─────────────────────────────────────────────────────────
// SHOP — Place a new order
// POST /api/orders
// ─────────────────────────────────────────────────────────
const placeOrder = async (req, res) => {
  const { quantity, note } = req.body;

  if (!quantity || quantity < 10) {
    return error(res, 400, 'Minimum order is 10 barrels (20L each).');
  }

  const order = await Order.create({
    shop:      req.shop._id,
    quantity:  parseInt(quantity),
    note:      note || '',
    statusLog: [{
      status:     'Pending',
      actorModel: 'Shop',
      changedBy:  req.shop._id,
      note:       'Order placed by shop',
    }],
  });

  const populated = await order.populate('shop', 'shopName district ownerName phone');

  return success(res, 201, 'Order placed successfully', populated);
};

// ─────────────────────────────────────────────────────────
// SHOP — Get own order history
// GET /api/orders/my-orders
// ─────────────────────────────────────────────────────────
const getMyOrders = async (req, res) => {
  const orders = await Order.find({ shop: req.shop._id })
    .populate('assignedDriver', 'name plateNumber vehicle')
    .sort({ createdAt: -1 });

  return success(res, 200, 'Orders retrieved', orders);
};

// ─────────────────────────────────────────────────────────
// STAFF — Get all orders (with optional status filter)
// GET /api/orders?status=Pending
// ─────────────────────────────────────────────────────────
const getAllOrders = async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;

  const page  = parseInt(req.query.page)  || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip  = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate('shop',           'shopName district ownerName phone')
      .populate('assignedDriver', 'name plateNumber vehicle')
      .populate('approvedBy',     'name username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Order.countDocuments(filter),
  ]);

  return success(res, 200, 'Orders retrieved', orders, {
    total, page, limit, pages: Math.ceil(total / limit),
  });
};

// ─────────────────────────────────────────────────────────
// STAFF — Approve or reject a pending order
// PATCH /api/orders/:id/review
// body: { action: 'approve' | 'reject', note? }
// ─────────────────────────────────────────────────────────
const reviewOrder = async (req, res) => {
  const { action, note } = req.body;

  if (!['approve', 'reject'].includes(action)) {
    return error(res, 400, 'Action must be "approve" or "reject".');
  }

  const order = await Order.findById(req.params.id);
  if (!order) return error(res, 404, 'Order not found.');
  if (order.status !== 'Pending') {
    return error(res, 409, `Cannot review an order with status "${order.status}".`);
  }

  order.status     = action === 'approve' ? 'Approved' : 'Rejected';
  order.approvedBy = req.user._id;
  order.statusLog.push({
    status:     order.status,
    actorModel: 'User',
    changedBy:  req.user._id,
    note:       note || `Order ${order.status.toLowerCase()} by staff`,
  });

  await order.save();
  return success(res, 200, `Order ${order.status.toLowerCase()} successfully`, order);
};

// ─────────────────────────────────────────────────────────
// ADMIN — Dispatch an approved order to a driver
// PATCH /api/orders/:id/dispatch
// body: { driverId }
// ─────────────────────────────────────────────────────────
const dispatchOrder = async (req, res) => {
  const { driverId } = req.body;
  if (!driverId) return error(res, 400, 'driverId is required.');

  const [order, driver] = await Promise.all([
    Order.findById(req.params.id),
    User.findById(driverId),
  ]);

  if (!order)  return error(res, 404, 'Order not found.');
  if (!driver) return error(res, 404, 'Driver not found.');

  if (order.status !== 'Approved') {
    return error(res, 409, `Only "Approved" orders can be dispatched. Current: "${order.status}".`);
  }
  if (driver.role !== 'driver') return error(res, 400, 'Specified user is not a driver.');
  if (!driver.isActive)         return error(res, 400, 'Driver account is inactive.');

  order.status         = 'Dispatched';
  order.assignedDriver = driver._id;
  order.plateNumber    = driver.plateNumber;
  order.statusLog.push({
    status:     'Dispatched',
    actorModel: 'User',
    changedBy:  req.user._id,
    note:       `Dispatched to ${driver.name} (${driver.plateNumber})`,
  });

  await order.save();

  const populated = await order.populate('assignedDriver', 'name plateNumber vehicle');
  return success(res, 200, `Order dispatched to ${driver.name}`, populated);
};

// ─────────────────────────────────────────────────────────
// DRIVER — Update delivery status (On The Way / Delivered)
// PATCH /api/orders/:id/deliver
// body: { status: 'On The Way' | 'Delivered' }
// ─────────────────────────────────────────────────────────
const updateDeliveryStatus = async (req, res) => {
  const { status } = req.body;
  const allowed = { Dispatched: 'On The Way', 'On The Way': 'Delivered' };

  const order = await Order.findById(req.params.id);
  if (!order) return error(res, 404, 'Order not found.');

  if (order.assignedDriver?.toString() !== req.user._id.toString()) {
    return error(res, 403, 'This order is not assigned to you.');
  }

  const nextStatus = allowed[order.status];
  if (!nextStatus || status !== nextStatus) {
    return error(res, 409, `Cannot transition from "${order.status}" to "${status}".`);
  }

  order.status = status;
  order.statusLog.push({
    status,
    actorModel: 'User',
    changedBy:  req.user._id,
    note:       `Marked ${status} by driver`,
  });

  await order.save();
  return success(res, 200, `Order marked as "${status}"`, order);
};

// ─────────────────────────────────────────────────────────
// ADMIN — Delete an order
// DELETE /api/orders/:id
// ─────────────────────────────────────────────────────────
const deleteOrder = async (req, res) => {
  const order = await Order.findByIdAndDelete(req.params.id);
  if (!order) return error(res, 404, 'Order not found.');
  return success(res, 200, 'Order deleted successfully');
};

// ─────────────────────────────────────────────────────────
// ADMIN / STAFF — Get single order detail
// GET /api/orders/:id
// ─────────────────────────────────────────────────────────
const getOrderById = async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('shop',           'shopName district ownerName phone')
    .populate('assignedDriver', 'name plateNumber vehicle')
    .populate('approvedBy',     'name username');

  if (!order) return error(res, 404, 'Order not found.');
  return success(res, 200, 'Order retrieved', order);
};

module.exports = {
  placeOrder,
  getMyOrders,
  getAllOrders,
  reviewOrder,
  dispatchOrder,
  updateDeliveryStatus,
  deleteOrder,
  getOrderById,
};
