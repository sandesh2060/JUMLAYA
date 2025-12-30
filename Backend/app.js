// ============================================
// app.js — JUMLAYA Backend (PRODUCTION READY)
// Path: Backend/app.js
// ============================================

const express = require("express");
const cors = require("cors");
const path = require("path");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const mongoSanitize = require("express-mongo-sanitize");
const adminSettingsRoutes = require('./routes/admin.settings.routes');


const app = express();

// =====================================================
// BODY PARSERS
// =====================================================
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// =====================================================
// SECURITY MIDDLEWARES
// =====================================================
app.use(helmet({ contentSecurityPolicy: false }));
app.use(mongoSanitize());

// =====================================================
// CORS CONFIG
// =====================================================
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:3000",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:5174",
      "http://192.168.1.75:5173",
    ];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("CORS blocked"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    exposedHeaders: ["Content-Range", "X-Content-Range"],
  })
);
app.options("*", cors());

// CORS error handler
app.use((err, req, res, next) => {
  if (err.message === "CORS blocked") {
    console.warn(`⚠️ CORS blocked for origin: ${req.headers.origin}`);
    return res.status(403).json({
      success: false,
      message: "CORS policy: This origin is not allowed to access the resource",
    });
  }
  next(err);
});

// =====================================================
// RATE LIMITING
// =====================================================
app.use(
  "/api",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: "Too many requests, please try again later",
    },
  })
);

// =====================================================
// LOGGING
// =====================================================
app.use(morgan(process.env.NODE_ENV === "development" ? "dev" : "combined"));

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
  express.static("uploads")
);

// =====================================================
// HEALTH CHECK ROUTES
// =====================================================
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "JUMLAYA API running",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// =====================================================
// PUBLIC API ROUTES
// =====================================================
// ✅ Public Settings Route (no auth required) - MUST BE FIRST
app.use("/api/public/settings", require("./routes/publicSettings.routes"));

app.use("/api/users", require("./routes/user.routes"));
app.use("/api/products", require("./routes/product.routes"));
app.use("/api/otp", require("./routes/otp.routes"));

// ✅ ADDED: Password Reset Routes (FORGOT PASSWORD, RESET PASSWORD, etc.)
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

// ✅ ADDED: Product Review Routes (handles /api/products/:productId/reviews)
try {
  app.use("/api/products", require("./routes/product.review.routes"));
  console.log("✅ Product review routes loaded");
} catch (error) {
  console.error("❌ Failed to load product.review.routes:", error.message);
}

// =====================================================
// ADMIN API ROUTES
// =====================================================
// Public Settings Route (no auth required)
try {
  app.use("/api/settings", require("./routes/settings.routes"));
} catch (error) {
  console.error("❌ Failed to load settings.routes:", error.message);
}

// Admin Settings Routes
try {
  app.use("/api/admin/settings", require("./routes/admin.settings.routes"));
} catch (error) {
  console.error("❌ Failed to load admin.settings.routes:", error.message);
}

// Admin Dashboard Routes
try {
  app.use("/api/admin/dashboard", require("./routes/admin.dashboard.routes"));
} catch (error) {
  console.error("❌ Failed to load admin.dashboard.routes:", error.message);
}

// Admin Rider Management Routes
try {
  app.use("/api/admin/riders", require("./routes/admin.rider.routes"));
  console.log("✅ Admin rider routes loaded");
} catch (error) {
  console.error("❌ Failed to load admin.rider.routes:", error.message);
}

// Admin User Management Routes
try {
  app.use("/api/admin/users", require("./routes/admin.user.routes"));
} catch (error) {
  console.error("❌ Failed to load admin.user.routes:", error.message);
}

// Admin Product Routes
try {
  app.use("/api/admin/products", require("./routes/admin.product.routes"));
} catch (error) {
  console.error("❌ Failed to load admin.product.routes:", error.message);
}

// Admin Order Routes
try {
  app.use("/api/admin/orders", require("./routes/admin.order.routes"));
} catch (error) {
  console.warn("⚠️ admin.order.routes.js not found - using fallback");
  app.use("/api/admin/orders", require("./routes/order.routes"));
}

// Rider Routes
app.use('/api/rider', require('./routes/rider.routes'));

// =====================================================
// 404 HANDLER
// =====================================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// =====================================================
// GLOBAL ERROR HANDLER
// =====================================================
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      message: "Validation Error",
      errors,
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(409).json({
      success: false,
      message: `${field} already exists`,
    });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Token expired",
    });
  }

  // Default error
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

module.exports = app;