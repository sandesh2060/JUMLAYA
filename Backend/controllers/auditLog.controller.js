// ============================================
// Backend/controllers/auditLog.controller.js
// Audit Log Controller - Handle all audit log operations
// ============================================

const AuditLog = require('../models/auditLog.model');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

// ============================================
// CREATE AUDIT LOG
// ============================================

/**
 * @desc    Create a new audit log entry
 * @route   POST /api/audit-logs
 * @access  Private/Admin
 */
exports.createAuditLog = catchAsync(async (req, res, next) => {
  const { action, resource, resourceId, details, status, severity } = req.body;

  // Validate required fields
  if (!action || !resource) {
    return next(new AppError('Action and resource are required', 400));
  }

  // Get request metadata
  const metadata = {
    url: req.originalUrl,
    method: req.method,
    ipAddress: req.ip || req.connection.remoteAddress,
    userAgent: req.get('user-agent'),
    headers: {
      'content-type': req.get('content-type'),
      'accept': req.get('accept')
    }
  };

  // Create audit log
  const auditLog = await AuditLog.logAction({
    user: req.user._id,
    userEmail: req.user.email,
    userName: `${req.user.firstname || ''} ${req.user.lastname || ''}`.trim() || req.user.email,
    userRole: req.user.role,
    action,
    resource,
    resourceId,
    details: details || {},
    metadata,
    status: status || 'success',
    severity: severity || 'low'
  });

  res.status(201).json({
    success: true,
    message: 'Audit log created successfully',
    data: auditLog
  });
});

// ============================================
// GET ALL AUDIT LOGS (WITH FILTERS)
// ============================================

/**
 * @desc    Get all audit logs with filters and pagination
 * @route   GET /api/audit-logs
 * @access  Private/Admin
 */
exports.getAllAuditLogs = catchAsync(async (req, res, next) => {
  const {
    action,
    resource,
    userId,
    userEmail,
    status,
    severity,
    startDate,
    endDate,
    page,
    limit,
    sortBy
  } = req.query;

  // Build filters
  const filters = {};
  if (action) filters.action = action;
  if (resource) filters.resource = resource;
  if (userId) filters.userId = userId;
  if (userEmail) filters.userEmail = userEmail;
  if (status) filters.status = status;
  if (severity) filters.severity = severity;
  if (startDate) filters.startDate = startDate;
  if (endDate) filters.endDate = endDate;

  // Build options
  const options = {
    page: page || 1,
    limit: limit || 50,
    sort: {}
  };

  // Handle sorting
  if (sortBy) {
    const [field, order] = sortBy.split(':');
    options.sort[field] = order === 'asc' ? 1 : -1;
  } else {
    options.sort = { createdAt: -1 }; // Default: newest first
  }

  // Get filtered logs
  const result = await AuditLog.getFilteredLogs(filters, options);

  res.status(200).json({
    success: true,
    message: 'Audit logs fetched successfully',
    data: result.logs,
    pagination: result.pagination
  });
});

// ============================================
// GET SINGLE AUDIT LOG
// ============================================

/**
 * @desc    Get a single audit log by ID
 * @route   GET /api/audit-logs/:id
 * @access  Private/Admin
 */
exports.getAuditLogById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const auditLog = await AuditLog.findById(id)
    .populate('user', 'firstname lastname email role avatar');

  if (!auditLog) {
    return next(new AppError('Audit log not found', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Audit log fetched successfully',
    data: auditLog
  });
});

// ============================================
// GET AUDIT LOG STATISTICS
// ============================================

/**
 * @desc    Get audit log statistics
 * @route   GET /api/audit-logs/stats
 * @access  Private/Admin
 */
exports.getAuditLogStats = catchAsync(async (req, res, next) => {
  const { startDate, endDate } = req.query;

  const filters = {};
  if (startDate) filters.startDate = startDate;
  if (endDate) filters.endDate = endDate;

  const stats = await AuditLog.getStats(filters);

  res.status(200).json({
    success: true,
    message: 'Audit log statistics fetched successfully',
    data: stats
  });
});

// ============================================
// GET LOGS BY USER
// ============================================

/**
 * @desc    Get audit logs for a specific user
 * @route   GET /api/audit-logs/user/:userId
 * @access  Private/Admin
 */
exports.getLogsByUser = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const { page, limit } = req.query;

  const filters = { userId };
  const options = {
    page: page || 1,
    limit: limit || 50,
    sort: { createdAt: -1 }
  };

  const result = await AuditLog.getFilteredLogs(filters, options);

  res.status(200).json({
    success: true,
    message: 'User audit logs fetched successfully',
    data: result.logs,
    pagination: result.pagination
  });
});

// ============================================
// GET LOGS BY RESOURCE
// ============================================

/**
 * @desc    Get audit logs for a specific resource
 * @route   GET /api/audit-logs/resource/:resource
 * @access  Private/Admin
 */
exports.getLogsByResource = catchAsync(async (req, res, next) => {
  const { resource } = req.params;
  const { page, limit } = req.query;

  const filters = { resource };
  const options = {
    page: page || 1,
    limit: limit || 50,
    sort: { createdAt: -1 }
  };

  const result = await AuditLog.getFilteredLogs(filters, options);

  res.status(200).json({
    success: true,
    message: 'Resource audit logs fetched successfully',
    data: result.logs,
    pagination: result.pagination
  });
});

// ============================================
// GET RECENT ACTIVITY
// ============================================

/**
 * @desc    Get recent audit activity
 * @route   GET /api/audit-logs/recent
 * @access  Private/Admin
 */
exports.getRecentActivity = catchAsync(async (req, res, next) => {
  const { limit } = req.query;

  const logs = await AuditLog.find()
    .sort({ createdAt: -1 })
    .limit(parseInt(limit) || 20)
    .populate('user', 'firstname lastname email role avatar')
    .lean();

  res.status(200).json({
    success: true,
    message: 'Recent activity fetched successfully',
    data: logs
  });
});

// ============================================
// EXPORT AUDIT LOGS
// ============================================

/**
 * @desc    Export audit logs to JSON/CSV
 * @route   GET /api/audit-logs/export
 * @access  Private/Admin
 */
exports.exportAuditLogs = catchAsync(async (req, res, next) => {
  const { format, startDate, endDate } = req.query;

  // Build filters
  const filters = {};
  if (startDate) filters.startDate = startDate;
  if (endDate) filters.endDate = endDate;

  // Get all logs (no pagination for export)
  const result = await AuditLog.getFilteredLogs(filters, { limit: 10000 });
  const logs = result.logs;

  // Log the export action
  await AuditLog.logAction({
    user: req.user._id,
    userEmail: req.user.email,
    userName: `${req.user.firstname || ''} ${req.user.lastname || ''}`.trim(),
    userRole: req.user.role,
    action: 'EXPORT',
    resource: 'audit_logs',
    details: { format, count: logs.length, filters },
    metadata: {
      url: req.originalUrl,
      method: req.method,
      ipAddress: req.ip
    }
  });

  if (format === 'csv') {
    // Convert to CSV
    const csv = convertToCSV(logs);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=audit_logs_${Date.now()}.csv`);
    res.status(200).send(csv);
  } else {
    // Default: JSON
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=audit_logs_${Date.now()}.json`);
    res.status(200).json({
      success: true,
      exportDate: new Date().toISOString(),
      count: logs.length,
      data: logs
    });
  }
});

// ============================================
// DELETE OLD LOGS (CLEANUP)
// ============================================

/**
 * @desc    Delete audit logs older than specified days
 * @route   DELETE /api/audit-logs/cleanup
 * @access  Private/Admin
 */
exports.deleteOldLogs = catchAsync(async (req, res, next) => {
  const { days } = req.body;

  if (!days || days < 1) {
    return next(new AppError('Please provide valid number of days', 400));
  }

  // Calculate date threshold
  const dateThreshold = new Date();
  dateThreshold.setDate(dateThreshold.getDate() - days);

  // Delete old logs
  const result = await AuditLog.deleteMany({
    createdAt: { $lt: dateThreshold }
  });

  // Log the cleanup action
  await AuditLog.logAction({
    user: req.user._id,
    userEmail: req.user.email,
    userName: `${req.user.firstname || ''} ${req.user.lastname || ''}`.trim(),
    userRole: req.user.role,
    action: 'CLEAR_LOGS',
    resource: 'audit_logs',
    details: { 
      daysOld: days, 
      deletedCount: result.deletedCount,
      dateThreshold 
    },
    severity: 'high',
    metadata: {
      url: req.originalUrl,
      method: req.method,
      ipAddress: req.ip
    }
  });

  res.status(200).json({
    success: true,
    message: `Deleted ${result.deletedCount} audit logs older than ${days} days`,
    data: {
      deletedCount: result.deletedCount,
      dateThreshold
    }
  });
});

// ============================================
// DELETE ALL LOGS (DANGEROUS - SUPER ADMIN ONLY)
// ============================================

/**
 * @desc    Delete ALL audit logs (use with extreme caution)
 * @route   DELETE /api/audit-logs/all
 * @access  Private/SuperAdmin
 */
exports.deleteAllLogs = catchAsync(async (req, res, next) => {
  // Extra security check
  if (req.user.role !== 'admin') {
    return next(new AppError('Only super admin can delete all logs', 403));
  }

  const count = await AuditLog.countDocuments();

  // Delete all logs
  await AuditLog.deleteMany({});

  // Create a new log entry about deletion
  await AuditLog.logAction({
    user: req.user._id,
    userEmail: req.user.email,
    userName: `${req.user.firstname || ''} ${req.user.lastname || ''}`.trim(),
    userRole: req.user.role,
    action: 'CLEAR_LOGS',
    resource: 'audit_logs',
    details: { 
      deletedCount: count,
      warning: 'ALL audit logs were deleted' 
    },
    severity: 'critical',
    metadata: {
      url: req.originalUrl,
      method: req.method,
      ipAddress: req.ip
    }
  });

  res.status(200).json({
    success: true,
    message: `All ${count} audit logs have been deleted`,
    data: {
      deletedCount: count
    }
  });
});

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Convert logs to CSV format
 */
function convertToCSV(logs) {
  if (logs.length === 0) return '';

  // CSV Headers
  const headers = [
    'Timestamp',
    'User Email',
    'User Name',
    'User Role',
    'Action',
    'Resource',
    'Resource ID',
    'Status',
    'Severity',
    'IP Address',
    'URL'
  ];

  // CSV Rows
  const rows = logs.map(log => [
    log.createdAt,
    log.userEmail,
    log.userName,
    log.userRole,
    log.action,
    log.resource,
    log.resourceId || '',
    log.status,
    log.severity,
    log.metadata?.ipAddress || '',
    log.metadata?.url || ''
  ]);

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(field => `"${field}"`).join(','))
  ].join('\n');

  return csvContent;
}