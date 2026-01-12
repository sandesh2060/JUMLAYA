// ============================================
// Backend/app.js - PRODUCTION-READY WITH PERFECT CORS
// ✅ FIXED: Rider routes now use /api/riders (plural)
// ============================================

const express = require("express");
const cors = require("cors");
const path = require("path");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const mongoSanitize = require("express-mongo-sanitize");

const app = express();

const isProduction = process.env.NODE_ENV === "production";
const isDevelopment = process.env.NODE_ENV === "development";
const adminSettingsRoutes = require('./routes/admin.settings.routes');


// =====================================================
// TRUST PROXY (for production deployments)
// =====================================================
if (isProduction) {
  app.set("trust proxy", 1);
}

// =====================================================
// BODY PARSERS
// =====================================================
app.use(express.json({ 
  limit: "10mb",
  verify: (req, res, buf) => {
    req.rawBody = buf.toString();
  }
}));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// =====================================================
// SECURITY MIDDLEWARES
// =====================================================
app.use(helmet({
  contentSecurityPolicy: isProduction ? {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  } : false,
  hsts: isProduction ? {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  } : false,
}));

app.use(mongoSanitize());


// =====================================================
// CORS CONFIGURATION (PERFECT FOR DEVELOPMENT & PRODUCTION)
// =====================================================
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map(origin => origin.trim())
  : isDevelopment 
    ? [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:4173",
        "http://localhost:4174",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:4173",
        "http://127.0.0.1:4174",
      ]
    : [];

if (isDevelopment) {
  console.log("🔒 CORS Configuration:");
  console.log("   Environment:", process.env.NODE_ENV);
  console.log("   Allowed Origins:", allowedOrigins);
}

app.use(cors({
  origin: (origin, callback) => {
    // ✅ Allow requests with no origin in development (Postman, mobile apps, etc.)
    if (!origin && isDevelopment) {
      return callback(null, true);
    }
    
    // ✅ PRODUCTION: Smart origin checking
    if (isProduction && origin) {
      // 1. Check exact matches from ALLOWED_ORIGINS
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      
      // 2. Allow all Vercel deployments (preview & production)
      if (origin.endsWith('.vercel.app')) {
        return callback(null, true);
      }
      
      // 3. Allow your custom domains
      const customDomains = [
        'jumlaya.com',
        'www.jumlaya.com',
        'jumlaya.vercel.app'
      ];
      
      if (customDomains.some(domain => origin.includes(domain))) {
        return callback(null, true);
      }
      
      // 4. Block everything else in production
      console.warn(`🚫 CORS blocked in production: ${origin}`);
      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
    
    // ✅ DEVELOPMENT: Check allowed origins
    if (isDevelopment) {
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      
      console.warn(`🚫 CORS blocked in development: ${origin}`);
      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
    
    // Block requests with no origin in production
    if (!origin && isProduction) {
      console.warn("⚠️  Blocked request with no origin in production");
      return callback(new Error("Origin not allowed by CORS"));
    }
    
    // Fallback: block
    console.warn(`🚫 CORS blocked (fallback): ${origin}`);
    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  exposedHeaders: ["Content-Range", "X-Content-Range"],
  maxAge: 86400, // 24 hours
}));

// Handle preflight requests
app.options("*", cors());

// CORS error handler
app.use((err, req, res, next) => {
  if (err.message && err.message.includes("CORS")) {
    return res.status(403).json({
      success: false,
      message: "Access denied: Origin not allowed by CORS policy",
    });
  }
  next(err);
});

// =====================================================
// RATE LIMITING
// =====================================================
const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests, please try again later."
  },
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === "/api/health" || req.path === "/";
  }
});

app.use("/api", apiLimiter);

// Stricter rate limiting for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isProduction ? 5 : 100, // 5 in production, 100 in development
  message: {
    success: false,
    message: "Too many authentication attempts. Please try again later."
  }
});

app.use("/api/users/login", authLimiter);
app.use("/api/users/register", authLimiter);
app.use("/api/password/forgot", authLimiter);
app.use("/api/password/reset", authLimiter);

// =====================================================
// LOGGING
// =====================================================
if (isDevelopment) {
  app.use(morgan("dev"));
} else if (process.env.ENABLE_MORGAN === "true") {
  app.use(morgan("combined"));
}

// Request logging in production
if (isProduction) {
  app.use((req, res, next) => {
    const start = Date.now();
    res.on("finish", () => {
      const duration = Date.now() - start;
      if (res.statusCode >= 400) {
        console.error(`${req.method} ${req.path} ${res.statusCode} - ${duration}ms`);
      }
    });
    next();
  });
}

// =====================================================
// STATIC FILES
// =====================================================
app.use(
  "/uploads",
  (req, res, next) => {
    res.header("Cross-Origin-Resource-Policy", "cross-origin");
    res.header("Access-Control-Allow-Origin", "*");
    next();
  },
  express.static(path.join(__dirname, "uploads"))
);

// =====================================================
// HEALTH CHECK & ROOT
// =====================================================
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "JUMLAYA API is running",
    version: "1.0.0",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

app.get("/api/health", (req, res) => {
  res.json({ 
    success: true,
    status: "healthy",
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    memory: process.memoryUsage(),
  });
});

// =====================================================
// API ROUTES
// =====================================================

// Public routes
app.use("/api/public/settings", require("./routes/publicSettings.routes"));
app.use("/api/users", require("./routes/user.routes"));
app.use("/api/products", require("./routes/product.routes"));
app.use("/api/otp", require("./routes/otp.routes"));
app.use("/api/password", require("./routes/password.routes"));
app.use("/api/orders", require("./routes/order.routes"));
app.use("/api/cart", require("./routes/cart.routes"));
app.use("/api/categories", require("./routes/category.routes"));
app.use("/api/reviews", require("./routes/review.routes"));
app.use("/api/addresses", require("./routes/address.routes"));
app.use("/api/esewa", require("./routes/esewa.routes"));
app.use("/api/wishlist", require("./routes/wishlist.routes"));
app.use("/api/coupons", require("./routes/coupon.routes"));
app.use("/api/notifications", require("./routes/notification.routes"));
app.use("/api/products", require("./routes/product.review.routes"));
app.use("/api/ads", require("./routes/ads.routes"));

// Admin routes
app.use('/api/admin/settings', adminSettingsRoutes);
app.use("/api/settings", require("./routes/settings.routes"));
app.use("/api/admin/settings", require("./routes/admin.settings.routes"));
app.use("/api/admin/dashboard", require("./routes/admin.dashboard.routes"));
app.use("/api/admin/riders", require("./routes/admin.rider.routes"));
app.use("/api/admin/users", require("./routes/admin.user.routes"));
app.use("/api/admin/products", require("./routes/admin.product.routes"));
app.use("/api/admin/orders", require("./routes/admin.order.routes"));
app.use("/api/audit-logs", require("./routes/auditLog.routes"));

// ✅ FIXED: Rider routes (changed from /api/rider to /api/riders)
app.use("/api/riders", require("./routes/rider.routes"));
console.log("✅ Rider routes mounted at: /api/riders");

// =====================================================
// 404 HANDLER
// =====================================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    timestamp: new Date().toISOString()
  });
});

// =====================================================
// GLOBAL ERROR HANDLER
// =====================================================
app.use((err, req, res, next) => {
  // Log error details
  console.error("❌ Error:", {
    message: err.message,
    stack: isDevelopment ? err.stack : undefined,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Don't leak error details in production
  const errorResponse = {
    success: false,
    message: isProduction ? "An error occurred" : err.message,
    ...(isDevelopment ? { stack: err.stack } : {})
  };

  res.status(err.statusCode || 500).json(errorResponse);
});

module.exports = app;