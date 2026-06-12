// routes/driverRoutes.js
const express = require('express');
const { getMyDeliveries, getDeliveryById, updateDeliveryStatus, getDriverStats } = require('../controllers/driverController');
const { protect, authorise } = require('../middleware/authMiddleware');

const router = express.Router();
router.use(protect, authorise('driver'));

router.get('/deliveries',          getMyDeliveries);
router.get('/deliveries/:id',      getDeliveryById);
router.patch('/deliveries/:id/status', updateDeliveryStatus);
router.get('/stats',               getDriverStats);

module.exports = router;
