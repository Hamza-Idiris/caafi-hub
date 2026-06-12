// routes/orderRoutes.js
const express = require('express');
const { body } = require('express-validator');
const {
  placeOrder, getMyOrders, getAllOrders,
  reviewOrder, dispatchOrder, updateDeliveryStatus,
  deleteOrder, getOrderById,
} = require('../controllers/orderController');
const { protect, authorise } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');

const router = express.Router();

// ── Shop: place a new order ───────────────────────────────
router.post('/',
  protect, authorise('shop'),
  [body('quantity').isInt({ min: 10 }).withMessage('Minimum order is 10 barrels')],
  validate,
  placeOrder
);

// ── Shop: view own order history ──────────────────────────
router.get('/my-orders', protect, authorise('shop'), getMyOrders);

// ── Staff / Admin: all orders (with ?status filter) ───────
router.get('/', protect, authorise('admin', 'staff'), getAllOrders);

// ── Staff: approve / reject a pending order ───────────────
router.patch('/:id/review',
  protect, authorise('admin', 'staff'),
  [body('action').isIn(['approve', 'reject']).withMessage('Action must be approve or reject')],
  validate,
  reviewOrder
);

// ── Admin: dispatch approved order to a driver ────────────
router.patch('/:id/dispatch',
  protect, authorise('admin'),
  [body('driverId').notEmpty().withMessage('driverId is required')],
  validate,
  dispatchOrder
);

// ── Driver: update delivery status ────────────────────────
router.patch('/:id/deliver',
  protect, authorise('driver'),
  [body('status').isIn(['On The Way', 'Delivered']).withMessage('Invalid status')],
  validate,
  updateDeliveryStatus
);

// ── Admin: delete order ───────────────────────────────────
router.delete('/:id', protect, authorise('admin'), deleteOrder);

// ── Staff / Admin: get single order ──────────────────────
router.get('/:id', protect, authorise('admin', 'staff'), getOrderById);

module.exports = router;
