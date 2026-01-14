// ============================================
// Backend/middlewares/authorize.middleware.js
// ✅ FIXED: Added restrictTo as alias for authorize
// ============================================

const AppError = require("../utils/AppError");

// Middleware to check if user has required role
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    console.log("🔒 Authorize Middleware - User:", req.user);
    console.log("🔒 Required roles:", allowedRoles);
    
    if (!req.user) {
      console.log("❌ No user in request");
      return res.status(401).json({
        success: false,
        message: "Please log in first"
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      console.log("❌ Access denied - User role:", req.user.role, "Required:", allowedRoles);
      return res.status(403).json({
        success: false,
        message: "You do not have permission to access this resource"
      });
    }

    console.log("✅ Authorization granted for role:", req.user.role);
    next();
  };
};

// Admin-only middleware (shorthand)
const adminOnly = (req, res, next) => {
  console.log("🔒 AdminOnly Middleware - User:", req.user);
  
  if (!req.user) {
    return res.status(401).json({ 
      success: false,
      message: "Please log in first" 
    });
  }

  if (req.user.role !== 'admin') {
    console.log("❌ Access denied - User role:", req.user.role);
    return res.status(403).json({ 
      success: false,
      message: "Access denied. Admin only." 
    });
  }

  console.log("✅ Admin access granted");
  next();
};

// ✅ Create restrictTo as an alias for authorize (for compatibility)
const restrictTo = (...allowedRoles) => {
  return authorize(...allowedRoles);
};

// Export all functions
module.exports = {
  authorize,
  restrictTo,  // ✅ ADDED: Now restrictTo is available
  adminOnly
};

// Also export authorize as default
module.exports.default = authorize;