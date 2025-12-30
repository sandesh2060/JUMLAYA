// ============================================
// Backend/models/auditLog.model.js
// Audit Log Model for tracking admin actions
// ============================================

const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    // User who performed the action
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    
    // User details (denormalized for historical record)
    userEmail: {
      type: String,
      required: true
    },
    
    userName: {
      type: String,
      required: true
    },
    
    userRole: {
      type: String,
      required: true,
      enum: ['admin', 'rider', 'customer']
    },
    
    // Action performed
    action: {
      type: String,
      required: true,
      enum: [
        'CREATE',
        'UPDATE', 
        'DELETE',
        'VIEW',
        'EXPORT',
        'LOGIN',
        'LOGOUT',
        'SECURITY',
        'NAVIGATION',
        'CLEAR_LOGS'
      ]
    },
    
    // Resource affected
    resource: {
      type: String,
      required: true,
      index: true
    },
    
    // Resource ID (if applicable)
    resourceId: {
      type: String,
      default: null
    },
    
    // Additional details
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    
    // Request metadata
    metadata: {
      // Request URL
      url: {
        type: String,
        default: null
      },
      
      // HTTP Method
      method: {
        type: String,
        default: null
      },
      
      // IP Address
      ipAddress: {
        type: String,
        default: null
      },
      
      // User Agent
      userAgent: {
        type: String,
        default: null
      },
      
      // Request headers (sanitized)
      headers: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
      }
    },
    
    // Status of the action
    status: {
      type: String,
      enum: ['success', 'failure', 'warning'],
      default: 'success'
    },
    
    // Error message (if any)
    errorMessage: {
      type: String,
      default: null
    },
    
    // Changes made (for UPDATE actions)
    changes: {
      before: {
        type: mongoose.Schema.Types.Mixed,
        default: null
      },
      after: {
        type: mongoose.Schema.Types.Mixed,
        default: null
      }
    },
    
    // Severity level
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'low'
    },
    
    // Is this action reversible?
    reversible: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    collection: 'audit_logs'
  }
);

// ============================================
// INDEXES
// ============================================

// Index for common queries
auditLogSchema.index({ user: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ resource: 1, createdAt: -1 });
auditLogSchema.index({ userEmail: 1, createdAt: -1 });
auditLogSchema.index({ createdAt: -1 }); // For date range queries
auditLogSchema.index({ status: 1 });
auditLogSchema.index({ severity: 1 });

// Compound index for filtered queries
auditLogSchema.index({ 
  action: 1, 
  resource: 1, 
  createdAt: -1 
});

// TTL index - automatically delete logs older than 90 days (optional)
// Uncomment if you want automatic deletion
// auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 }); // 90 days

// ============================================
// METHODS
// ============================================

// Static method to create audit log
auditLogSchema.statics.logAction = async function(logData) {
  try {
    const log = new this(logData);
    await log.save();
    return log;
  } catch (error) {
    console.error('❌ Error creating audit log:', error);
    // Don't throw - audit logging should not break the application
    return null;
  }
};

// Static method to get logs with filters
auditLogSchema.statics.getFilteredLogs = async function(filters = {}, options = {}) {
  const query = {};
  
  // Apply filters
  if (filters.action) query.action = filters.action;
  if (filters.resource) query.resource = new RegExp(filters.resource, 'i');
  if (filters.userId) query.user = filters.userId;
  if (filters.userEmail) query.userEmail = new RegExp(filters.userEmail, 'i');
  if (filters.status) query.status = filters.status;
  if (filters.severity) query.severity = filters.severity;
  
  // Date range
  if (filters.startDate || filters.endDate) {
    query.createdAt = {};
    if (filters.startDate) query.createdAt.$gte = new Date(filters.startDate);
    if (filters.endDate) query.createdAt.$lte = new Date(filters.endDate);
  }
  
  // Pagination
  const page = parseInt(options.page) || 1;
  const limit = parseInt(options.limit) || 50;
  const skip = (page - 1) * limit;
  
  // Sort
  const sort = options.sort || { createdAt: -1 };
  
  // Execute query
  const logs = await this.find(query)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .populate('user', 'firstname lastname email role avatar')
    .lean();
  
  const total = await this.countDocuments(query);
  
  return {
    logs,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

// Static method to get statistics
auditLogSchema.statics.getStats = async function(filters = {}) {
  const query = {};
  
  // Apply date range filter
  if (filters.startDate || filters.endDate) {
    query.createdAt = {};
    if (filters.startDate) query.createdAt.$gte = new Date(filters.startDate);
    if (filters.endDate) query.createdAt.$lte = new Date(filters.endDate);
  }
  
  const [
    totalLogs,
    byAction,
    byResource,
    byUser,
    bySeverity,
    recentActivity
  ] = await Promise.all([
    // Total count
    this.countDocuments(query),
    
    // Count by action
    this.aggregate([
      { $match: query },
      { $group: { _id: '$action', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]),
    
    // Count by resource
    this.aggregate([
      { $match: query },
      { $group: { _id: '$resource', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]),
    
    // Count by user
    this.aggregate([
      { $match: query },
      { $group: { _id: '$userEmail', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]),
    
    // Count by severity
    this.aggregate([
      { $match: query },
      { $group: { _id: '$severity', count: { $sum: 1 } } }
    ]),
    
    // Recent activity
    this.find(query)
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('user', 'firstname lastname email')
      .lean()
  ]);
  
  return {
    total: totalLogs,
    byAction: byAction.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
    byResource: byResource.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
    byUser: byUser.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
    bySeverity: bySeverity.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
    recentActivity
  };
};

// ============================================
// VIRTUAL FIELDS
// ============================================

// Virtual for formatted timestamp
auditLogSchema.virtual('formattedTimestamp').get(function() {
  return this.createdAt.toLocaleString();
});

// Ensure virtuals are included in JSON
auditLogSchema.set('toJSON', { virtuals: true });
auditLogSchema.set('toObject', { virtuals: true });

// ============================================
// EXPORT MODEL
// ============================================

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = AuditLog;