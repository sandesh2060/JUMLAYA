// ============================================
// Backend/routes/auditLog.routes.js
// Audit Log Routes
// ============================================

const express = require('express');
const router = express.Router();
const auditLogController = require('../controllers/auditLog.controller');
const { protect, restrictTo } = require('../middlewares/auth.middleware');

// ============================================
// PROTECT ALL ROUTES - ADMIN ONLY
// ============================================
router.use(protect);
router.use(restrictTo('admin'));

// ============================================
// STATISTICS & SPECIAL ROUTES (before :id routes)
// ============================================

// Get audit log statistics
router.get('/stats', auditLogController.getAuditLogStats);

// Get recent activity
router.get('/recent', auditLogController.getRecentActivity);

// Export audit logs
router.get('/export', auditLogController.exportAuditLogs);

// Get logs by user
router.get('/user/:userId', auditLogController.getLogsByUser);

// Get logs by resource
router.get('/resource/:resource', auditLogController.getLogsByResource);

// ============================================
// CLEANUP ROUTES
// ============================================

// Delete old logs (by days)
router.delete('/cleanup', auditLogController.deleteOldLogs);

// Delete ALL logs (dangerous - super admin only)
router.delete('/all', auditLogController.deleteAllLogs);

// ============================================
// CRUD ROUTES
// ============================================

// Get all audit logs (with filters & pagination)
router.get('/', auditLogController.getAllAuditLogs);

// Create audit log
router.post('/', auditLogController.createAuditLog);

// Get single audit log by ID
router.get('/:id', auditLogController.getAuditLogById);

module.exports = router;