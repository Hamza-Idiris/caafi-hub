// routes/staffRoutes.js
const express = require('express');
const { getShops, getShopById, updateShop, getSummary, getDrivers } = require('../controllers/staffController');
const { protect, authorise } = require('../middleware/authMiddleware');

const router = express.Router();
router.use(protect, authorise('admin', 'staff'));

router.get('/summary',   getSummary);
router.get('/shops',     getShops);
router.get('/shops/:id', getShopById);
router.put('/shops/:id', updateShop);

// NEW — lets staff fetch the active driver list for dispatching orders
router.get('/drivers', getDrivers);

module.exports = router;
