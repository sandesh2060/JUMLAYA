// ============================================
// Backend/middlewares/auth.middleware.js (COMPLETE)
// ============================================
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const Rider = require("../models/rider.model"); 

/**
 * Protect routes - Verify JWT token
 */
const protect = async (req, res, next) => {
  try {
    let token = req.headers.authorization;
    
    console.log("🔐 Auth Middleware - Checking token...");
    
    if (!token || !token.startsWith("Bearer ")) {
      console.log("❌ No token or invalid format");
      return res.status(401).json({ 
        success: false,
        message: "Unauthorized: No token provided" 
      });
    }

    token = token.split(" ")[1];
    console.log("✅ Token extracted");
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("✅ Token decoded - User ID:", decoded.id, "Role:", decoded.role);
    
    // Fetch full user from database
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      console.log("❌ User not found");
      return res.status(401).json({ 
        success: false,
        message: "User not found" 
      });
    }
    
    // ✅ Attach full user to request
    req.user = user;
    
    // ✅ Also attach to req.rider if user is a rider (for rider routes)
    if (user.role === 'rider') {
      const Rider = require('../models/rider.model');
      const rider = await Rider.findOne({ user: user._id });
      if (rider) {
        req.rider = rider;
      }
    }
    
    console.log("✅ Auth successful - User:", req.user._id, "Role:", req.user.role);
    next();
  } catch (error) {
    console.error("❌ Auth Middleware Error:", error.message);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        message: "Token expired. Please login again." 
      });
    }
    
    return res.status(401).json({ 
      success: false,
      message: "Invalid token" 
    });
  }
};

/**
 * Restrict access to specific roles
 * Usage: restrictTo('admin', 'rider')
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    console.log("🔒 Role Check - User Role:", req.user?.role, "Allowed:", roles);
    
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated"
      });
    }
    
    if (!roles.includes(req.user.role)) {
      console.log("❌ Access denied - Insufficient permissions");
      return res.status(403).json({
        success: false,
        message: `Access denied. This route is only for ${roles.join(', ')} users.`
      });
    }
    
    console.log("✅ Role check passed");
    next();
  };
};

/**
 * Optional authentication - doesn't fail if no token
 * Useful for routes that work with or without auth
 */
const optionalAuth = async (req, res, next) => {
  try {
    let token = req.headers.authorization;
    
    if (!token || !token.startsWith("Bearer ")) {
      // No token, but that's okay - continue without user
      return next();
    }

    token = token.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findById(decoded.id).select('-password');
    if (user) {
      req.user = user;
    }
    
    next();
  } catch (error) {
    // Token invalid, but continue without user
    next();
  }
};

module.exports = { 
  protect, 
  authenticate: protect, // Alias for backwards compatibility
  restrictTo,
  optionalAuth
};