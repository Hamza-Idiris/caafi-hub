// routes/adminRoutes.js
const express = require('express');
const {
  getStats,
  getAllUsers, createUser, getUserById, updateUser, deleteUser, toggleUserStatus,
  getAllShops, deleteShop, toggleShopStatus,
} = require('../controllers/adminController');
const { protect, authorise } = require('../middleware/authMiddleware');

const router = express.Router();
router.use(protect, authorise('admin'));

router.get('/stats',            getStats);
router.get('/users',            getAllUsers);
router.post('/users',           createUser);
router.get('/users/:id',        getUserById);
router.put('/users/:id',        updateUser);
router.delete('/users/:id',     deleteUser);
router.patch('/users/:id/toggle', toggleUserStatus);
router.get('/shops',            getAllShops);
router.delete('/shops/:id',     deleteShop);
router.patch('/shops/:id/toggle', toggleShopStatus);

module.exports = router;
