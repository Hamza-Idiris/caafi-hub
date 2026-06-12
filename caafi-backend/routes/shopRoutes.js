// routes/shopRoutes.js
const express = require('express');
const { getProfile, updateProfile } = require('../controllers/shopController');
const { protect, authorise } = require('../middleware/authMiddleware');

const router = express.Router();
router.use(protect, authorise('shop'));

router.get('/profile',  getProfile);
router.put('/profile',  updateProfile);

module.exports = router;
