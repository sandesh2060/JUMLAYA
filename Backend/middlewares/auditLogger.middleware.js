// ============================================
// Backend/middleware/auditLogger.middleware.js
// Automatic Audit Logging Middleware
// ============================================

const AuditLog = require('../models/auditLog.model');

/**
 * Middleware to automatically log admin actions
 * Usage: Add to routes that need audit logging
 * Example: router.post('/products', auditLogger('CREATE', 'products'), createProduct)
 */
const auditLogger = (action, resource, options = {}) => {
  return async (req, res, next) => {
    // Store original json method
    const originalJson = res.json;
    
    // Override res.json to capture response
    res.json = function(data) {
      // Only log if user is authenticated
      if (req.user) {
        // Determine status based on response
        const status = data.success ? 'success' : 'failure';
        const severity = options.severity || determineSeverity(action, status);
        
        // Get resource ID from various sources
        let resourceId = null;
        if (req.params.id) resourceId = req.params.id;
        else if (req.body._id) resourceId = req.body._id;
        else if (data.data?._id) resourceId = data.data._id;
        
        // Build details object
        const details = {
          ...options.details,
          responseMessage: data.message
        };
        
        // Add body data for CREATE/UPDATE (excluding sensitive fields)
        if (['CREATE', 'UPDATE'].includes(action)) {
          details.data = sanitizeData(req.body);
        }
        
        // Add query params if present
        if (Object.keys(req.query).length > 0) {
          details.query = req.query;
        }
        
        // Get metadata
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
        
        // Create audit log (async, don't wait)
        AuditLog.logAction({
          user: req.user._id,
          userEmail: req.user.email,
          userName: `${req.user.firstname || ''} ${req.user.lastname || ''}`.trim() || req.user.email,
          userRole: req.user.role,
          action,
          resource,
          resourceId,
          details,
          metadata,
          status,
          severity,
          reversible: options.reversible !== false
        }).catch(err => {
          console.error('❌ Audit log error:', err.message);
        });
      }
      
      // Call original json method
      return originalJson.call(this, data);
    };
    
    next();
  };
};

/**
 * Determine severity based on action and status
 */
function determineSeverity(action, status) {
  if (status === 'failure') return 'medium';
  
  switch (action) {
    case 'DELETE':
      return 'high';
    case 'UPDATE':
      return 'medium';
    case 'CREATE':
      return 'low';
    case 'SECURITY':
      return 'critical';
    default:
      return 'low';
  }
}

/**
 * Remove sensitive fields from data before logging
 */
function sanitizeData(data) {
  if (!data || typeof data !== 'object') return data;
  
  const sensitiveFields = [
    'password',
    'passwordConfirm',
    'currentPassword',
    'newPassword',
    'token',
    'refreshToken',
    'accessToken',
    'apiKey',
    'secret',
    'creditCard',
    'cvv',
    'ssn'
  ];
  
  const sanitized = { ...data };
  
  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  });
  
  return sanitized;
}

/**
 * Audit logger for route-level logging
 * Logs when route is accessed (before controller execution)
 */
const logRouteAccess = (action, resource) => {
  return (req, res, next) => {
    if (req.user) {
      AuditLog.logAction({
        user: req.user._id,
        userEmail: req.user.email,
        userName: `${req.user.firstname || ''} ${req.user.lastname || ''}`.trim(),
        userRole: req.user.role,
        action: 'VIEW',
        resource: `${resource}_route`,
        details: {
          route: req.originalUrl,
          params: req.params,
          query: req.query
        },
        metadata: {
          url: req.originalUrl,
          method: req.method,
          ipAddress: req.ip
        }
      }).catch(err => {
        console.error('❌ Route access log error:', err.message);
      });
    }
    next();
  };
};

/**
 * Log failed authentication attempts
 */
const logAuthFailure = async (email, reason, req) => {
  try {
    await AuditLog.create({
      userEmail: email,
      userName: email,
      userRole: 'unknown',
      action: 'LOGIN',
      resource: 'auth',
      status: 'failure',
      severity: 'medium',
      errorMessage: reason,
      details: {
        reason,
        attemptedEmail: email
      },
      metadata: {
        url: req.originalUrl,
        method: req.method,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent')
      }
    });
  } catch (error) {
    console.error('❌ Auth failure log error:', error.message);
  }
};

/**
 * Log successful login
 */
const logLogin = async (user, req) => {
  try {
    await AuditLog.logAction({
      user: user._id,
      userEmail: user.email,
      userName: `${user.firstname || ''} ${user.lastname || ''}`.trim() || user.email,
      userRole: user.role,
      action: 'LOGIN',
      resource: 'auth',
      status: 'success',
      severity: 'low',
      details: {
        loginTime: new Date()
      },
      metadata: {
        url: req.originalUrl,
        method: req.method,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent')
      }
    });
  } catch (error) {
    console.error('❌ Login log error:', error.message);
  }
};

/**
 * Log logout
 */
const logLogout = async (user, req) => {
  try {
    await AuditLog.logAction({
      user: user._id,
      userEmail: user.email,
      userName: `${user.firstname || ''} ${user.lastname || ''}`.trim() || user.email,
      userRole: user.role,
      action: 'LOGOUT',
      resource: 'auth',
      status: 'success',
      severity: 'low',
      details: {
        logoutTime: new Date()
      },
      metadata: {
        url: req.originalUrl,
        method: req.method,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent')
      }
    });
  } catch (error) {
    console.error('❌ Logout log error:', error.message);
  }
};

module.exports = {
  auditLogger,
  logRouteAccess,
  logAuthFailure,
  logLogin,
  logLogout
};