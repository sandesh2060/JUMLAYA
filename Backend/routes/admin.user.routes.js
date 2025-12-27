// ============================================
// admin.user.routes.js
// Path: Backend/routes/admin.user.routes.js
// ============================================
const express = require('express');
const router = express.Router();
const userController = require('../controllers/admin/admin.user.controller');
const { protect } = require('../middlewares/auth.middleware');
const { adminOnly } = require('../middlewares/authorize.middleware');

// All routes require authentication and admin role
router.use(protect);
router.use(adminOnly);

// ============================================
// USER ROUTES
// ============================================

// GET /api/admin/users - Get all users with filters
router.get('/', userController.getAllUsers);

// GET /api/admin/users/stats - Get user statistics
router.get('/stats', userController.getUserStats);

// GET /api/admin/users/:id - Get single user
router.get('/:id', userController.getUserById);

// GET /api/admin/users/:id/orders - Get user's orders
router.get('/:id/orders', userController.getUserOrders);

// PUT /api/admin/users/:id - Update user
router.put('/:id', userController.updateUser);

// DELETE /api/admin/users/:id - Delete user
router.delete('/:id', userController.deleteUser);

// PATCH /api/admin/users/:id/toggle-block - Block/Unblock user
router.patch('/:id/toggle-block', userController.toggleBlockUser);

module.exports = router;