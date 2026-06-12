// routes/staffRoutes.js
const express = require('express');
const { getShops, getShopById, updateShop, getSummary } = require('../controllers/staffController');
const { protect, authorise } = require('../middleware/authMiddleware');

const router = express.Router();
router.use(protect, authorise('admin', 'staff'));

router.get('/summary',     getSummary);
router.get('/shops',       getShops);
router.get('/shops/:id',   getShopById);
router.put('/shops/:id',   updateShop);

module.exports = router;
