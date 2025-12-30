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
    return res.status(403).json({
      success: false,
      message: "CORS policy: This origin is not allowed",
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
// HEALTH CHECK
// =====================================================
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "JUMLAYA API running",
  });
});

app.get("/api/health", (req, res) => {
  res.json({ success: true });
});

// =====================================================
// PUBLIC ROUTES
// =====================================================
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

// Product reviews
app.use("/api/products", require("./routes/product.review.routes"));

// =====================================================
// ADMIN ROUTES
// =====================================================
app.use("/api/settings", require("./routes/settings.routes"));
app.use("/api/admin/settings", require("./routes/admin.settings.routes"));
app.use("/api/admin/dashboard", require("./routes/admin.dashboard.routes"));
app.use("/api/admin/riders", require("./routes/admin.rider.routes"));
app.use("/api/admin/users", require("./routes/admin.user.routes"));
app.use("/api/admin/products", require("./routes/admin.product.routes"));
app.use("/api/admin/orders", require("./routes/admin.order.routes"));
app.use("/api/audit-logs", require("./routes/auditLog.routes"));

// Rider
app.use("/api/rider", require("./routes/rider.routes"));

// =====================================================
// 404
// =====================================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// =====================================================
// ERROR HANDLER
// =====================================================
app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

module.exports = app;
