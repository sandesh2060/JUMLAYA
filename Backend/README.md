# JUMLAYA Backend - Configuration & Setup Guide

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Prerequisites & Installation](#prerequisites--installation)
3. [Environment Configuration](#environment-configuration)
4. [Database Configuration](#database-configuration)
5. [Security Configuration](#security-configuration)
6. [API Server Configuration](#api-server-configuration)
7. [Middleware Configuration](#middleware-configuration)
8. [File Upload Configuration](#file-upload-configuration)
9. [Email Configuration](#email-configuration)
10. [Payment Gateway Configuration](#payment-gateway-configuration)
11. [Scheduled Jobs Configuration](#scheduled-jobs-configuration)
12. [CRUD & Routes Documentation](#crud--routes-documentation)
13. [Running the Server](#running-the-server)

---

## 🎯 Project Overview

**JUMLAYA** is an organic e-commerce platform backend built with:

- **Framework**: Express.js (Node.js)
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: Helmet, CORS, Rate Limiting, XSS Protection, MongoDB Sanitization
- **File Storage**: Cloudinary
- **Email Service**: Nodemailer
- **Job Scheduler**: Node-cron
- **Version**: 1.0.0

---

## 🔧 Prerequisites & Installation

### Required Software

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MongoDB**: v6.0+ (local or Atlas cloud)
- **Git**: v2.0+

### Installation Steps

```bash
# 1. Clone the repository
git clone <repository-url>

# 2. Navigate to backend directory
cd Backend

# 3. Install dependencies
npm install

# 4. Create .env file in Backend root
touch .env

# 5. Fill in environment variables (see Environment Configuration section)

# 6. Start development server
npm run dev
```

---

## 🔐 Environment Configuration

### Create `.env` file in Backend root directory

```env
# ============================================
# SERVER CONFIGURATION
# ============================================
NODE_ENV=development
PORT=4001

# ============================================
# DATABASE CONFIGURATION
# ============================================
DB_CONNECT=mongodb://username:password@cluster0.mongodb.net/jumlaya?retryWrites=true&w=majority

# ============================================
# JWT SECRET KEYS
# ============================================
JWT_SECRET=your_jwt_secret_key_here_min_32_chars
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your_refresh_secret_key_here_min_32_chars
JWT_REFRESH_EXPIRE=30d

# ============================================
# CORS & ALLOWED ORIGINS
# ============================================
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000,https://yourdomain.com

# ============================================
# CLOUDINARY CONFIGURATION
# ============================================
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# ============================================
# EMAIL CONFIGURATION (NODEMAILER)
# ============================================
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=noreply@jumlaya.com
EMAIL_FROM_NAME=JUMLAYA

# ============================================
# PAYMENT GATEWAY CONFIGURATION
# ============================================
ESEWA_MERCHANT_CODE=your_esewa_merchant_code
ESEWA_SECRET_KEY=your_esewa_secret_key
ESEWA_SUCCESS_URL=http://localhost:5173/order-success
ESEWA_FAILURE_URL=http://localhost:5173/order-failed

# ============================================
# OTP CONFIGURATION
# ============================================
OTP_EXPIRY_TIME=10
OTP_LENGTH=6

# ============================================
# RATE LIMITING
# ============================================
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# ============================================
# SESSION CONFIGURATION
# ============================================
SESSION_SECRET=your_session_secret_here
```

### Environment Variables Breakdown

| Variable              | Type   | Purpose                                          | Example                                    |
| --------------------- | ------ | ------------------------------------------------ | ------------------------------------------ |
| NODE_ENV              | String | Application environment (development/production) | `development`                              |
| PORT                  | Number | Server port                                      | `4001`                                     |
| DB_CONNECT            | String | MongoDB connection string                        | `mongodb://...`                            |
| JWT_SECRET            | String | JWT signing key (min 32 chars)                   | `your_secret_key`                          |
| JWT_EXPIRE            | String | JWT token expiration                             | `7d`                                       |
| ALLOWED_ORIGINS       | String | CORS origins (comma-separated)                   | `http://localhost:5173,https://domain.com` |
| CLOUDINARY_CLOUD_NAME | String | Cloudinary cloud name                            | `your-cloud`                               |
| CLOUDINARY_API_KEY    | String | Cloudinary API key                               | `123456789`                                |
| CLOUDINARY_API_SECRET | String | Cloudinary API secret                            | `secret_key`                               |
| EMAIL_HOST            | String | SMTP host for email                              | `smtp.gmail.com`                           |
| EMAIL_PORT            | Number | SMTP port                                        | `587`                                      |
| EMAIL_USER            | String | Email account                                    | `email@gmail.com`                          |
| EMAIL_PASSWORD        | String | Email app password                               | `16-char-password`                         |
| ESEWA_MERCHANT_CODE   | String | eSewa merchant code                              | `MERCHANT123`                              |
| ESEWA_SECRET_KEY      | String | eSewa secret key                                 | `secret_key`                               |
| OTP_EXPIRY_TIME       | Number | OTP validity in minutes                          | `10`                                       |

---

## 💾 Database Configuration

### MongoDB Connection Setup

#### Option 1: MongoDB Atlas (Cloud)

```javascript
// config/db.js
const mongoose = require("mongoose");

const connectToDB = async () => {
  try {
    if (!process.env.DB_CONNECT) {
      throw new Error("DB_CONNECT is not defined in environment variables");
    }

    await mongoose.connect(process.env.DB_CONNECT);
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ Error connecting to MongoDB:", error.message);
    process.exit(1);
  }
};

module.exports = connectToDB;
```

#### Connection String Format

```
mongodb+srv://username:password@cluster0.mongodb.net/jumlaya?retryWrites=true&w=majority
```

#### MongoDB Atlas Setup Steps

1. Go to https://www.mongodb.com/cloud/atlas
2. Create account and new project
3. Create cluster
4. Create database user with username & password
5. Add your IP to whitelist (0.0.0.0/0 for development)
6. Get connection string and replace credentials

### Collections (Models)

**Nine Core Collections:**

| Collection | Purpose                  | Key Fields                         |
| ---------- | ------------------------ | ---------------------------------- |
| users      | User accounts & profiles | email, password, phone, addresses  |
| products   | Product catalog          | name, price, stock, category       |
| categories | Product categories       | name, slug, image                  |
| carts      | Shopping carts           | userId, items, cartTotal           |
| orders     | Purchase orders          | orderId, userId, items, status     |
| reviews    | Product reviews          | productId, userId, rating, comment |
| coupons    | Discount codes           | code, discountType, validFrom      |
| addresses  | Delivery addresses       | userId, street, city, zipCode      |
| wishlist   | Saved products           | userId, products                   |

---

## 🔒 Security Configuration

### Applied Security Measures

#### 1. **Helmet.js** - HTTP Headers Security

```javascript
// app.js
app.use(helmet({ contentSecurityPolicy: false }));
```

**Protection:**

- X-Frame-Options: Prevents clickjacking
- Strict-Transport-Security: Forces HTTPS
- X-Content-Type-Options: Prevents MIME sniffing
- X-XSS-Protection: Browser XSS filtering

#### 2. **CORS** - Cross-Origin Resource Sharing

```javascript
// app.js
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : ["http://localhost:5173", "http://localhost:3000"];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin))
        return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
```

**Configuration Details:**

- Origins: Whitelist allowed domains
- Credentials: Allow cookies (true)
- Methods: Default (GET, POST, PUT, DELETE, OPTIONS)

#### 3. **Rate Limiting** - DoS Protection

```javascript
// app.js
app.use(
  "/api",
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Max 100 requests per window
    standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false, // Disable `X-RateLimit-*` headers
  })
);
```

**Configuration Details:**

- Window: 15 minutes
- Max Requests: 100 per window
- Applied to: `/api` routes only
- Returns: Rate limit info in response headers

#### 4. **MongoDB Sanitization** - Injection Prevention

```javascript
// app.js
app.use(mongoSanitize());
```

**Protection:** Strips out `$` and `.` characters to prevent NoSQL injection

#### 5. **XSS Protection** - XSS Attack Prevention

```javascript
// middlewares/sanitize.js
const xss = require("xss");

const sanitizeInput = (req, res, next) => {
  // Sanitize all string inputs
  Object.keys(req.body).forEach((key) => {
    if (typeof req.body[key] === "string") {
      req.body[key] = xss(req.body[key]);
    }
  });
  next();
};

module.exports = sanitizeInput;
```

#### 6. **JWT Authentication**

```javascript
// middlewares/auth.middleware.js
const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: "Invalid token" });
  }
};

module.exports = verifyToken;
```

#### 7. **Password Encryption** - bcryptjs

```javascript
// User Registration Example
const bcrypt = require("bcryptjs");

const hashedPassword = await bcrypt.hash(password, 10);
const user = new User({ email, password: hashedPassword });
await user.save();

// Login Verification
const isPasswordValid = await bcrypt.compare(password, user.password);
```

---

## 🚀 API Server Configuration

### Server Setup (server.js)

```javascript
require("dotenv").config();
const http = require("http");
const app = require("./app");
const connectToDB = require("./config/db");

const PORT = process.env.PORT || 4001;

// Connect to DB then start server
connectToDB()
  .then(() => {
    const server = http.createServer(app);
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 API Base URL: http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
  });
```

### Express App Setup (app.js)

#### Body Parsers (10mb limit)

```javascript
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
```

#### Static Files

```javascript
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
```

- Serves files from `/uploads` directory
- Accessible at: `http://localhost:4001/uploads/products/image.jpg`

#### Logging (Morgan)

```javascript
app.use(morgan(process.env.NODE_ENV === "development" ? "dev" : "combined"));
```

**Formats:**

- Development: `dev` (concise, colored)
- Production: `combined` (comprehensive)

#### Health Check Endpoints

```javascript
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "JUMLAYA API running",
    environment: process.env.NODE_ENV || "development",
  });
});

app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date() });
});
```

---

## ⚙️ Middleware Configuration

### Middleware Stack Order (Critical)

```javascript
// app.js

// 1. Body Parsers (must be first)
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// 2. Security Middlewares
app.use(helmet({ contentSecurityPolicy: false }));
app.use(mongoSanitize());
app.use(sanitizeInput); // Custom XSS sanitization

// 3. CORS
app.use(cors({ origin: allowedOrigins, credentials: true }));

// 4. Rate Limiting
app.use("/api", rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// 5. Logging
app.use(morgan("dev"));

// 6. Static Files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// 7. Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
// ... other routes

// 8. Error Handling (must be last)
app.use(errorHandler);
```

### Core Middlewares

#### Authentication Middleware

```javascript
// middlewares/auth.middleware.js
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};
module.exports = verifyToken;
```

#### Authorization Middleware

```javascript
// middlewares/authorize.middleware.js
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user.role || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    next();
  };
};
module.exports = authorize;
```

**Roles:** admin, vendor, user

#### Validation Middleware

```javascript
// middlewares/validation.middleware.js
const { validationResult } = require("express-validator");

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }
  next();
};
module.exports = validateRequest;
```

#### Error Handling Middleware

```javascript
// middlewares/error.middleware.js
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
module.exports = errorHandler;
```

#### Upload Middleware

```javascript
// middlewares/upload.middleware.js
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedMimes = ["image/jpeg", "image/png", "image/webp"];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  },
});

module.exports = upload;
```

---

## 📤 File Upload Configuration

### Cloudinary Integration

#### Configuration (config/cloudinary.js)

```javascript
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload image
const uploadImage = async (file, folder = "jumlaya") => {
  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: folder,
      resource_type: "auto",
      transformation: [
        { width: 1000, height: 1000, crop: "limit" },
        { quality: "auto" },
        { fetch_format: "auto" },
      ],
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    throw new Error(`Image upload failed: ${error.message}`);
  }
};

// Delete image
const deleteImage = async (publicId) => {
  try {
    return await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    throw new Error(`Image deletion failed: ${error.message}`);
  }
};

// Upload multiple images
const uploadMultipleImages = async (files, folder = "jumlaya") => {
  const uploadPromises = files.map((file) => uploadImage(file, folder));
  return await Promise.all(uploadPromises);
};

module.exports = { uploadImage, deleteImage, uploadMultipleImages };
```

#### Cloudinary Setup Steps

1. Go to https://cloudinary.com
2. Sign up and create account
3. Get Cloud Name, API Key, API Secret from Dashboard
4. Add to `.env` file
5. Create folders in Cloudinary: `jumlaya/products`, `jumlaya/users`, `jumlaya/categories`

#### Upload Folder Structure

```
jumlaya/
  ├── products/        # Product images
  ├── users/          # User profile pictures
  ├── categories/     # Category images
  └── temp/           # Temporary files
```

#### File Size Limits

| Type            | Size Limit |
| --------------- | ---------- |
| Product Image   | 5MB        |
| User Avatar     | 2MB        |
| Category Image  | 3MB        |
| Multiple Upload | 20MB total |

---

## 📧 Email Configuration

### Nodemailer Setup

#### Configuration (services/email.service.js)

```javascript
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true for 465, false for 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendEmail = async (to, subject, htmlContent) => {
  try {
    const mailOptions = {
      from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
    return { success: true, info };
  } catch (error) {
    console.error("Email error:", error);
    return { success: false, error: error.message };
  }
};

module.exports = sendEmail;
```

#### Gmail Setup Steps

1. Enable 2-Factor Authentication
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Use 16-char password in `.env` as `EMAIL_PASSWORD`
4. Add sender email as `EMAIL_USER`

#### Email Templates

**Registration Confirmation**

```javascript
const registrationEmail = (userName) => `
  <html>
    <body>
      <h1>Welcome to JUMLAYA!</h1>
      <p>Hi ${userName},</p>
      <p>Your account has been created successfully.</p>
      <p>You can now login and start shopping.</p>
    </body>
  </html>
`;
```

**Password Reset**

```javascript
const resetPasswordEmail = (resetLink) => `
  <html>
    <body>
      <h1>Reset Your Password</h1>
      <p>Click the link below to reset your password:</p>
      <a href="${resetLink}">Reset Password</a>
      <p>Link expires in 1 hour.</p>
    </body>
  </html>
`;
```

**Order Confirmation**

```javascript
const orderConfirmationEmail = (orderId, orderTotal) => `
  <html>
    <body>
      <h1>Order Confirmed!</h1>
      <p>Your order #${orderId} has been confirmed.</p>
      <p>Total Amount: Rs. ${orderTotal}</p>
      <p>Track your order in your account.</p>
    </body>
  </html>
`;
```

---

## 💳 Payment Gateway Configuration

### eSewa Integration

#### Configuration (services/payment.service.js)

```javascript
const axios = require("axios");

const esewaConfig = {
  merchantCode: process.env.ESEWA_MERCHANT_CODE,
  secretKey: process.env.ESEWA_SECRET_KEY,
  successUrl: process.env.ESEWA_SUCCESS_URL,
  failureUrl: process.env.ESEWA_FAILURE_URL,
};

// Generate eSewa payment form
const generateEsewaPaymentForm = (orderId, amount) => {
  const data = {
    amount: amount,
    tax_amount: 0,
    total_amount: amount,
    transaction_uuid: orderId,
    product_code: esewaConfig.merchantCode,
    product_service_charge: 0,
    product_delivery_charge: 0,
    success_url: esewaConfig.successUrl,
    failure_url: esewaConfig.failureUrl,
    signed_field_names: "total_amount,transaction_uuid,product_code",
    signature: generateSignature(amount, orderId),
  };

  return data;
};

// Generate signature
const generateSignature = (amount, transactionId) => {
  const crypto = require("crypto");
  const signatureData = `total_amount=${amount},transaction_uuid=${transactionId},product_code=${esewaConfig.merchantCode}${esewaConfig.secretKey}`;
  const signature = crypto
    .createHash("sha256")
    .update(signatureData)
    .digest("base64");
  return signature;
};

// Verify eSewa payment
const verifyEsewaPayment = async (transactionId) => {
  try {
    const response = await axios.get(
      "https://eSewa.com.np/api/epay/transaction/status/",
      {
        params: {
          product_code: esewaConfig.merchantCode,
          total_amount: amount,
          transaction_uuid: transactionId,
          signed_field_names: "total_amount,transaction_uuid,product_code",
          signature: generateSignature(amount, transactionId),
        },
      }
    );

    if (response.data.response === "Success") {
      return { success: true, data: response.data };
    } else {
      return { success: false };
    }
  } catch (error) {
    console.error("Payment verification error:", error);
    return { success: false, error: error.message };
  }
};

module.exports = { generateEsewaPaymentForm, verifyEsewaPayment };
```

#### eSewa Setup Steps

1. Register at https://merchant.esewa.com.np
2. Complete merchant verification
3. Get Merchant Code & Secret Key
4. Add credentials to `.env`
5. Test with sandbox environment first

#### Payment Flow

```
1. User adds items to cart
2. Proceeds to checkout
3. Selects eSewa payment
4. Redirected to eSewa gateway
5. User enters payment credentials
6. eSewa returns success/failure
7. Backend verifies transaction
8. Order confirmed if successful
```

---

## ⏰ Scheduled Jobs Configuration

### Node-cron Setup

#### Job Scheduler (jobs/scheduler.js)

```javascript
const cron = require("node-cron");
const cleanupExpiredCarts = require("./cleanupExpiredCarts");
const updateInventory = require("./updateInventory");
const sendAbandonedCartEmails = require("./sendAbandonedCartEmails");

// Run daily at 2 AM
const cleanupCartJob = cron.schedule("0 2 * * *", async () => {
  console.log("🧹 Running expired cart cleanup...");
  await cleanupExpiredCarts();
});

// Run every 6 hours
const inventoryJob = cron.schedule("0 */6 * * *", async () => {
  console.log("📦 Updating inventory levels...");
  await updateInventory();
});

// Run daily at 9 AM
const emailJob = cron.schedule("0 9 * * *", async () => {
  console.log("📧 Sending abandoned cart emails...");
  await sendAbandonedCartEmails();
});

module.exports = { cleanupCartJob, inventoryJob, emailJob };
```

#### Job: Cleanup Expired Carts

```javascript
// jobs/cleanupExpiredCarts.js
const Cart = require("../models/cart.model");

const cleanupExpiredCarts = async () => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const result = await Cart.deleteMany({
      createdAt: { $lt: thirtyDaysAgo },
      status: "abandoned",
    });

    console.log(`✅ Deleted ${result.deletedCount} expired carts`);
    return result;
  } catch (error) {
    console.error("❌ Cart cleanup error:", error);
  }
};

module.exports = cleanupExpiredCarts;
```

#### Job: Update Inventory

```javascript
// jobs/updateInventory.js
const Product = require("../models/product.model");
const Order = require("../models/order.model");

const updateInventory = async () => {
  try {
    // Reduce stock for shipped orders
    const shippedOrders = await Order.find({ status: "shipped" });

    for (let order of shippedOrders) {
      for (let item of order.items) {
        await Product.findByIdAndUpdate(
          item.productId,
          { $inc: { stock: -item.quantity } },
          { new: true }
        );
      }
    }

    console.log("✅ Inventory updated");
  } catch (error) {
    console.error("❌ Inventory update error:", error);
  }
};

module.exports = updateInventory;
```

#### Job: Abandoned Cart Emails

```javascript
// jobs/sendAbandonedCartEmails.js
const Cart = require("../models/cart.model");
const sendEmail = require("../services/email.service");

const sendAbandonedCartEmails = async () => {
  try {
    // Find carts abandoned for 2+ days
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    const abandonedCarts = await Cart.find({
      updatedAt: { $lt: twoDaysAgo },
      status: "abandoned",
    }).populate("userId");

    for (let cart of abandonedCarts) {
      const subject = "Your shopping cart is waiting for you!";
      const htmlContent = `
        <h1>Complete your purchase</h1>
        <p>You have ${cart.items.length} items in your cart.</p>
        <a href="https://yourdomain.com/cart">Continue Shopping</a>
      `;

      await sendEmail(cart.userId.email, subject, htmlContent);
    }

    console.log(`✅ Sent ${abandonedCarts.length} reminder emails`);
  } catch (error) {
    console.error("❌ Email job error:", error);
  }
};

module.exports = sendAbandonedCartEmails;
```

#### Cron Schedule Format

```
# ┌───────────── second (0 - 59)
# │ ┌───────────── minute (0 - 59)
# │ │ ┌───────────── hour (0 - 23)
# │ │ │ ┌───────────── day of month (1 - 31)
# │ │ │ │ ┌───────────── month (0 - 11)
# │ │ │ │ │ ┌───────────── day of week (0 - 6) (0 = Sunday)
# │ │ │ │ │ │
# │ │ │ │ │ │
# * * * * * *

# Examples:
'0 0 0 * * *'    # Every midnight
'0 */6 * * *'    # Every 6 hours
'0 9 * * 1'      # Every Monday at 9 AM
'0 */30 * * *'   # Every 30 minutes
```

---

## 🛠️ CRUD & Routes Documentation

### 1️⃣ AUTHENTICATION & USER MANAGEMENT

#### A. User Registration (POST)

**Route:** `POST /api/auth/register`
**Authentication:** ❌ Not Required
**Body:**

```json
{
  "firstname": "John",
  "lastname": "Doe",
  "username": "johndoe",
  "email": "john@example.com",
  "phone": "+977-9841234567",
  "password": "SecurePass123",
  "role": "customer"
}
```

**Validation:**

- Email must be valid format
- Username: 3-30 chars, alphanumeric + underscore
- Password: Min 8 chars, 1 uppercase, 1 lowercase, 1 number
- Phone: Valid format
  **Response (201):**

```json
{
  "success": true,
  "message": "OTP sent to your email",
  "data": {
    "email": "john@example.com",
    "verificationCodeExpires": 600000
  }
}
```

#### B. Verify OTP (POST)

**Route:** `POST /api/auth/verify-otp`
**Authentication:** ❌ Not Required
**Body:**

```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

**Validation:**

- OTP must be 6 digits
- Must not be expired (10 min window)
- Email must exist
  **Response (200):**

```json
{
  "success": true,
  "message": "Account verified successfully",
  "data": {
    "email": "john@example.com",
    "isVerified": true,
    "isActive": true
  }
}
```

#### C. User Login (POST)

**Route:** `POST /api/auth/login`
**Authentication:** ❌ Not Required
**Body:**

```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Validation:**

- Email must exist
- Password must match (bcrypt verified)
- User must be verified and active
  **Response (200):**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "firstname": "John",
      "lastname": "Doe",
      "email": "john@example.com",
      "role": "customer"
    }
  }
}
```

#### D. Get Profile (GET)

**Route:** `GET /api/users/profile`
**Authentication:** ✅ Required (Bearer Token)
**Response (200):**

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "firstname": "John",
    "lastname": "Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "phone": "+977-9841234567",
    "role": "customer",
    "isVerified": true,
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

#### E. Update Profile (PUT)

**Route:** `PUT /api/users/profile`
**Authentication:** ✅ Required
**Body:**

```json
{
  "firstname": "John",
  "lastname": "Doe",
  "phone": "+977-9841234567"
}
```

**Validation:**

- Cannot update email/username (for security)
- Phone format validation
  **Response (200):**

```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    /* updated user object */
  }
}
```

#### F. Change Password (PUT)

**Route:** `PUT /api/users/change-password`
**Authentication:** ✅ Required
**Body:**

```json
{
  "currentPassword": "OldPass123",
  "newPassword": "NewSecurePass123",
  "confirmPassword": "NewSecurePass123"
}
```

**Validation:**

- Current password must match
- New password must meet requirements
- Passwords must match
  **Response (200):**

```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

### 2️⃣ ADDRESS MANAGEMENT

#### A. Get All Addresses (GET)

**Route:** `GET /api/addresses`
**Authentication:** ✅ Required
**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "user": "507f1f77bcf86cd799439012",
      "addressLine1": "123 Main Street",
      "addressLine2": "Apt 4B",
      "city": "Kathmandu",
      "state": "Central",
      "postalCode": "44600",
      "country": "Nepal",
      "phoneNumber": "+977-9841234567",
      "isDefault": true,
      "isActive": true,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### B. Create Address (POST)

**Route:** `POST /api/addresses`
**Authentication:** ✅ Required
**Body:**

```json
{
  "addressLine1": "123 Main Street",
  "addressLine2": "Apt 4B",
  "city": "Kathmandu",
  "state": "Central",
  "postalCode": "44600",
  "country": "Nepal",
  "phoneNumber": "+977-9841234567",
  "isDefault": false
}
```

**Validation:**

- All fields required
- No duplicate addresses (checked by line1, city, state, postalCode)
- Max 5 addresses per user
- Phone format validation
  **Response (201):**

```json
{
  "success": true,
  "message": "Address added successfully",
  "data": {
    /* address object */
  }
}
```

#### C. Update Address (PUT)

**Route:** `PUT /api/addresses/:id`
**Authentication:** ✅ Required
**Response (200):**

```json
{
  "success": true,
  "message": "Address updated successfully",
  "data": {
    /* updated address */
  }
}
```

#### D. Set Default Address (PATCH)

**Route:** `PATCH /api/addresses/:id/set-default`
**Authentication:** ✅ Required
**Response (200):**

```json
{
  "success": true,
  "message": "Default address updated",
  "data": {
    /* updated address */
  }
}
```

#### E. Delete Address (DELETE)

**Route:** `DELETE /api/addresses/:id`
**Authentication:** ✅ Required
**Type:** Soft Delete (isActive: false)
**Response (200):**

```json
{
  "success": true,
  "message": "Address deleted successfully"
}
```

---

### 3️⃣ PRODUCT MANAGEMENT

#### A. Get All Products (GET)

**Route:** `GET /api/products`
**Authentication:** ❌ Not Required
**Query Parameters:**

```
GET /api/products?page=1&limit=20&sort=-price&category=507f1f77bcf86cd799439011
```

**Response (200):**

```json
{
  "success": true,
  "results": 20,
  "total": 150,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Organic Tomato",
      "slug": "organic-tomato",
      "description": "Fresh organic tomatoes from farm",
      "category": "507f1f77bcf86cd799439012",
      "price": 150,
      "originalPrice": 200,
      "discount": 25,
      "stock": 50,
      "images": [{ "url": "https://cloudinary.com/...", "isDefault": true }],
      "isOrganic": true,
      "isFeatured": false,
      "rating": 4.5,
      "totalReviews": 12,
      "sold": 45,
      "isActive": true
    }
  ]
}
```

#### B. Get Product by ID (GET)

**Route:** `GET /api/products/:id`
**Response (200):**

```json
{
  "success": true,
  "data": {
    /* full product object */
  }
}
```

#### C. Get Product by Slug (GET)

**Route:** `GET /api/products/slug/:slug`
**Response (200):**

```json
{
  "success": true,
  "data": {
    /* full product object */
  }
}
```

#### D. Search Products (GET)

**Route:** `GET /api/products/search?q=tomato`
**Response (200):**

```json
{
  "success": true,
  "data": [
    /* matching products */
  ]
}
```

#### E. Get Featured Products (GET)

**Route:** `GET /api/products/featured`
**Response (200):**

```json
{
  "success": true,
  "data": [
    /* featured products */
  ]
}
```

#### F. Get Products on Sale (GET)

**Route:** `GET /api/products/sale`
**Response (200):**

```json
{
  "success": true,
  "data": [
    /* products with discount > 0 */
  ]
}
```

#### G. Get Bestsellers (GET)

**Route:** `GET /api/products/bestsellers`
**Response (200):**

```json
{
  "success": true,
  "data": [
    /* top 10 sold products */
  ]
}
```

#### H. Get Organic Products (GET)

**Route:** `GET /api/products/organic`
**Response (200):**

```json
{
  "success": true,
  "data": [
    /* isOrganic: true products */
  ]
}
```

#### I. Admin: Create Product (POST)

**Route:** `POST /api/admin/products`
**Authentication:** ✅ Required (Admin only)
**Body:**

```json
{
  "name": "Organic Tomato",
  "description": "Fresh organic tomatoes",
  "category": "507f1f77bcf86cd799439012",
  "price": 150,
  "originalPrice": 200,
  "stock": 100,
  "isOrganic": true,
  "isFeatured": false
}
```

**Files:** Multipart form-data with images
**Validation:**

- Name, description, price required
- Price must be > 0
- Stock must be >= 0
- Category must exist
  **Response (201):**

```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    /* created product */
  }
}
```

#### J. Admin: Update Product (PUT)

**Route:** `PUT /api/admin/products/:id`
**Authentication:** ✅ Required (Admin)
**Response (200):**

```json
{
  "success": true,
  "message": "Product updated successfully",
  "data": {
    /* updated product */
  }
}
```

#### K. Admin: Delete Product (DELETE)

**Route:** `DELETE /api/admin/products/:id`
**Authentication:** ✅ Required (Admin)
**Type:** Hard delete
**Response (200):**

```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

#### L. Admin: Update Stock (PATCH)

**Route:** `PATCH /api/admin/products/:id/stock`
**Authentication:** ✅ Required (Admin)
**Body:**

```json
{
  "quantity": 50
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Stock updated successfully",
  "data": {
    /* updated product */
  }
}
```

---

### 4️⃣ CART MANAGEMENT

#### A. Get Cart (GET)

**Route:** `GET /api/cart`
**Authentication:** ✅ Required
**Response (200):**

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "user": "507f1f77bcf86cd799439012",
    "items": [
      {
        "_id": "507f1f77bcf86cd799439013",
        "product": {
          "_id": "507f1f77bcf86cd799439014",
          "name": "Organic Tomato",
          "images": [{ "url": "..." }],
          "price": 150,
          "stock": 50
        },
        "quantity": 2,
        "itemTotal": 300
      }
    ],
    "subtotal": 300,
    "discount": 0,
    "tax": 30,
    "cartTotal": 330,
    "coupon": null
  }
}
```

#### B. Add to Cart (POST)

**Route:** `POST /api/cart/add`
**Authentication:** ✅ Required
**Body:**

```json
{
  "productId": "507f1f77bcf86cd799439014",
  "quantity": 2
}
```

**Validation:**

- Product must exist and be active
- Quantity must be ≤ stock
- Quantity must be > 0
  **Response (200):**

```json
{
  "success": true,
  "message": "Item added to cart",
  "data": {
    /* updated cart */
  }
}
```

#### C. Update Cart Item (PUT)

**Route:** `PUT /api/cart/update`
**Authentication:** ✅ Required
**Body:**

```json
{
  "productId": "507f1f77bcf86cd799439014",
  "quantity": 5
}
```

**Validation:**

- Quantity must be > 0
- Cannot exceed stock
  **Response (200):**

```json
{
  "success": true,
  "message": "Cart updated",
  "data": {
    /* updated cart */
  }
}
```

#### D. Remove from Cart (DELETE)

**Route:** `DELETE /api/cart/:productId`
**Authentication:** ✅ Required
**Response (200):**

```json
{
  "success": true,
  "message": "Item removed from cart",
  "data": {
    /* updated cart */
  }
}
```

#### E. Clear Cart (DELETE)

**Route:** `DELETE /api/cart`
**Authentication:** ✅ Required
**Response (200):**

```json
{
  "success": true,
  "message": "Cart cleared",
  "data": {
    /* empty cart */
  }
}
```

#### F. Apply Coupon (POST)

**Route:** `POST /api/cart/apply-coupon`
**Authentication:** ✅ Required
**Body:**

```json
{
  "couponCode": "SAVE20"
}
```

**Validation:**

- Coupon must exist and be active
- Coupon must not be expired
- User eligibility checked
- Minimum purchase requirement met
  **Response (200):**

```json
{
  "success": true,
  "message": "Coupon applied",
  "data": {
    /* updated cart with discount */
  }
}
```

#### G. Remove Coupon (DELETE)

**Route:** `DELETE /api/cart/coupon`
**Authentication:** ✅ Required
**Response (200):**

```json
{
  "success": true,
  "message": "Coupon removed",
  "data": {
    /* updated cart */
  }
}
```

---

### 5️⃣ ORDER MANAGEMENT

#### A. Create Order (POST)

**Route:** `POST /api/orders`
**Authentication:** ✅ Required
**Body:**

```json
{
  "addressId": "507f1f77bcf86cd799439011",
  "paymentMethod": "esewa",
  "notes": "Deliver in morning"
}
```

**Validation:**

- Cart must have items
- Address must belong to user
- Payment method must be valid
  **Response (201):**

```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439020",
    "orderId": "ORD-2024-001234",
    "user": "507f1f77bcf86cd799439012",
    "items": [
      /* cart items */
    ],
    "address": {
      /* delivery address */
    },
    "subtotal": 500,
    "tax": 50,
    "total": 550,
    "paymentStatus": "pending",
    "orderStatus": "pending",
    "paymentMethod": "esewa"
  }
}
```

#### B. Get My Orders (GET)

**Route:** `GET /api/orders`
**Authentication:** ✅ Required
**Response (200):**

```json
{
  "success": true,
  "data": [
    /* user's orders */
  ]
}
```

#### C. Get Order by ID (GET)

**Route:** `GET /api/orders/:id`
**Authentication:** ✅ Required
**Response (200):**

```json
{
  "success": true,
  "data": {
    /* order details */
  }
}
```

#### D. Track Order (GET)

**Route:** `GET /api/orders/:id/track`
**Authentication:** ✅ Required
**Response (200):**

```json
{
  "success": true,
  "data": {
    "orderId": "ORD-2024-001234",
    "status": "shipped",
    "timeline": [
      { "status": "pending", "timestamp": "2024-01-15T10:30:00Z" },
      { "status": "confirmed", "timestamp": "2024-01-15T10:35:00Z" },
      { "status": "shipped", "timestamp": "2024-01-15T14:00:00Z" }
    ],
    "estimatedDelivery": "2024-01-18"
  }
}
```

#### E. Download Invoice (GET)

**Route:** `GET /api/orders/:id/invoice`
**Authentication:** ✅ Required
**Response:** PDF file

```
Returns PDF invoice as attachment
```

#### F. Cancel Order (PATCH)

**Route:** `PATCH /api/orders/:id/cancel`
**Authentication:** ✅ Required
**Body:** (optional)

```json
{
  "reason": "Changed my mind"
}
```

**Validation:**

- Order status must be "pending" or "confirmed"
- Payment not yet processed
  **Response (200):**

```json
{
  "success": true,
  "message": "Order cancelled successfully",
  "data": {
    /* updated order */
  }
}
```

#### G. Request Return (POST)

**Route:** `POST /api/orders/:id/return-request`
**Authentication:** ✅ Required
**Body:**

```json
{
  "reason": "Product defective",
  "description": "Tomato was rotten",
  "images": [
    /* base64 or URLs */
  ]
}
```

**Validation:**

- Order status must be "delivered"
- Within 7 days of delivery
  **Response (201):**

```json
{
  "success": true,
  "message": "Return request submitted",
  "data": {
    /* return request */
  }
}
```

#### H. Reorder (POST)

**Route:** `POST /api/orders/:id/reorder`
**Authentication:** ✅ Required
**Response (201):**

```json
{
  "success": true,
  "message": "Items added to cart from previous order",
  "data": {
    /* new order */
  }
}
```

---

### 6️⃣ CATEGORY MANAGEMENT

#### A. Get All Categories (GET)

**Route:** `GET /api/categories`
**Authentication:** ❌ Not Required
**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Vegetables",
      "slug": "vegetables",
      "description": "Fresh vegetables",
      "image": "https://cloudinary.com/...",
      "isActive": true,
      "order": 1
    }
  ]
}
```

#### B. Get Category Tree (GET)

**Route:** `GET /api/categories/tree`
**Response (200):**

```json
{
  "success": true,
  "data": {
    "name": "Vegetables",
    "children": [{ "name": "Leafy Vegetables" }, { "name": "Root Vegetables" }]
  }
}
```

#### C. Get Category by Slug (GET)

**Route:** `GET /api/categories/:slug`
**Response (200):**

```json
{
  "success": true,
  "data": {
    /* category with products */
  }
}
```

#### D. Get Featured Categories (GET)

**Route:** `GET /api/categories/featured`
**Response (200):**

```json
{
  "success": true,
  "data": [
    /* featured categories */
  ]
}
```

#### E. Get Popular Categories (GET)

**Route:** `GET /api/categories/popular?limit=10`
**Response (200):**

```json
{
  "success": true,
  "data": [
    /* top 10 popular categories */
  ]
}
```

---

### 7️⃣ COUPON MANAGEMENT

#### A. Validate Coupon (POST)

**Route:** `POST /api/coupons/validate`
**Authentication:** ✅ Required
**Body:**

```json
{
  "code": "SAVE20",
  "subtotal": 500
}
```

**Validation:**

- Coupon must exist
- Must be active and not expired
- User eligibility checked
- Minimum purchase met
  **Response (200):**

```json
{
  "success": true,
  "message": "Coupon applied successfully",
  "data": {
    "code": "SAVE20",
    "discount": 100,
    "discountType": "percentage",
    "description": "Save 20% on orders",
    "minPurchase": 100,
    "maxDiscount": 500
  }
}
```

#### B. Get Active Coupons (GET)

**Route:** `GET /api/coupons`
**Authentication:** ❌ Not Required
**Response (200):**

```json
{
  "success": true,
  "data": [
    /* active coupons */
  ]
}
```

#### C. Get Coupon by Code (GET)

**Route:** `GET /api/coupons/:code`
**Response (200):**

```json
{
  "success": true,
  "data": {
    /* coupon details */
  }
}
```

#### D. Admin: Create Coupon (POST)

**Route:** `POST /api/admin/coupons`
**Authentication:** ✅ Required (Admin)
**Body:**

```json
{
  "code": "SAVE20",
  "description": "Save 20% on orders",
  "discountType": "percentage",
  "discountValue": 20,
  "maxDiscount": 500,
  "minPurchase": 100,
  "startDate": "2024-01-15",
  "endDate": "2024-12-31",
  "usageLimit": 100,
  "usagePerUser": 1
}
```

**Response (201):**

```json
{
  "success": true,
  "message": "Coupon created successfully",
  "data": {
    /* created coupon */
  }
}
```

#### E. Admin: Get All Coupons (GET)

**Route:** `GET /api/admin/coupons?page=1&limit=20&status=active`
**Authentication:** ✅ Required (Admin)
**Response (200):**

```json
{
  "success": true,
  "data": {
    "coupons": [
      /* all coupons */
    ],
    "pagination": { "page": 1, "limit": 20, "total": 50, "pages": 3 }
  }
}
```

#### F. Admin: Update Coupon (PUT)

**Route:** `PUT /api/admin/coupons/:id`
**Authentication:** ✅ Required (Admin)
**Response (200):**

```json
{
  "success": true,
  "message": "Coupon updated successfully",
  "data": {
    /* updated coupon */
  }
}
```

#### G. Admin: Delete Coupon (DELETE)

**Route:** `DELETE /api/admin/coupons/:id`
**Authentication:** ✅ Required (Admin)
**Response (200):**

```json
{
  "success": true,
  "message": "Coupon deleted successfully"
}
```

---

### 8️⃣ REVIEW MANAGEMENT

#### A. Get Product Reviews (GET)

**Route:** `GET /api/reviews/product/:productId`
**Authentication:** ❌ Not Required
**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "product": "507f1f77bcf86cd799439012",
      "user": {
        "_id": "507f1f77bcf86cd799439013",
        "firstname": "John",
        "lastname": "Doe"
      },
      "rating": 5,
      "title": "Excellent quality",
      "comment": "Very fresh tomatoes",
      "images": [
        /* review images */
      ],
      "helpful": 12,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### B. Create Review (POST)

**Route:** `POST /api/reviews`
**Authentication:** ✅ Required
**Body:**

```json
{
  "product": "507f1f77bcf86cd799439012",
  "rating": 5,
  "title": "Excellent quality",
  "comment": "Very fresh tomatoes"
}
```

**Validation:**

- Rating must be 1-5
- User must have purchased product
- One review per product per user
  **Response (201):**

```json
{
  "success": true,
  "message": "Review created",
  "data": {
    /* created review */
  }
}
```

#### C. Update Review (PUT)

**Route:** `PUT /api/reviews/:id`
**Authentication:** ✅ Required
**Body:**

```json
{
  "rating": 4,
  "comment": "Good but could be fresher"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Review updated",
  "data": {
    /* updated review */
  }
}
```

#### D. Delete Review (DELETE)

**Route:** `DELETE /api/reviews/:id`
**Authentication:** ✅ Required
**Type:** Soft delete (isActive: false)
**Response (200):**

```json
{
  "success": true,
  "message": "Review deleted"
}
```

---

### 9️⃣ WISHLIST MANAGEMENT

#### A. Get Wishlist (GET)

**Route:** `GET /api/wishlist`
**Authentication:** ✅ Required
**Response (200):**

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "user": "507f1f77bcf86cd799439012",
    "items": [
      {
        "_id": "507f1f77bcf86cd799439013",
        "product": {
          "_id": "507f1f77bcf86cd799439014",
          "name": "Organic Tomato",
          "slug": "organic-tomato",
          "images": [{ "url": "..." }],
          "price": 150,
          "originalPrice": 200,
          "discount": 25,
          "stock": 50,
          "rating": 4.5
        },
        "addedAt": "2024-01-15T10:30:00Z"
      }
    ],
    "totalItems": 1
  }
}
```

#### B. Add to Wishlist (POST)

**Route:** `POST /api/wishlist/add`
**Authentication:** ✅ Required
**Body:**

```json
{
  "productId": "507f1f77bcf86cd799439014"
}
```

**Validation:**

- Product must exist and be active
- Product not already in wishlist
  **Response (201):**

```json
{
  "success": true,
  "message": "Product added to wishlist",
  "data": {
    /* updated wishlist */
  }
}
```

#### C. Remove from Wishlist (DELETE)

**Route:** `DELETE /api/wishlist/:productId`
**Authentication:** ✅ Required
**Response (200):**

```json
{
  "success": true,
  "message": "Product removed from wishlist",
  "data": {
    /* updated wishlist */
  }
}
```

#### D. Check Product in Wishlist (GET)

**Route:** `GET /api/wishlist/check/:productId`
**Authentication:** ✅ Required
**Response (200):**

```json
{
  "success": true,
  "data": {
    "inWishlist": true,
    "productId": "507f1f77bcf86cd799439014"
  }
}
```

#### E. Clear Wishlist (DELETE)

**Route:** `DELETE /api/wishlist`
**Authentication:** ✅ Required
**Response (200):**

```json
{
  "success": true,
  "message": "Wishlist cleared successfully"
}
```

---

### 🔟 PAYMENT MANAGEMENT

#### A. Initiate eSewa Payment (POST)

**Route:** `POST /api/esewa/initiate`
**Authentication:** ✅ Required
**Body:**

```json
{
  "amount": 550,
  "orderId": "ORD-2024-001234"
}
```

**Response (200):**

```json
{
  "success": true,
  "paymentUrl": "https://uat.esewa.com.np/epay/main",
  "formData": {
    "amt": 550,
    "psc": 0,
    "pdc": 0,
    "tAmt": 550,
    "pid": "ORD-2024-001234",
    "scd": "EPAYTEST",
    "su": "http://localhost:4001/api/esewa/payment-success",
    "fu": "http://localhost:4001/api/esewa/payment-failed"
  }
}
```

#### B. Verify Payment (POST)

**Route:** `POST /api/payment/verify`
**Authentication:** ✅ Required
**Body:**

```json
{
  "orderId": "ORD-2024-001234",
  "provider": "esewa",
  "payload": {
    "oid": "ORD-2024-001234",
    "amt": 550,
    "refId": "ESEWA-REF-123456"
  }
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Payment verified successfully",
  "data": {
    "orderId": "ORD-2024-001234",
    "paymentStatus": "completed",
    "transactionId": "ESEWA-REF-123456"
  }
}
```

---

### 1️⃣1️⃣ ADMIN ORDER MANAGEMENT

#### A. Get All Orders (GET)

**Route:** `GET /api/admin/orders`
**Authentication:** ✅ Required (Admin)
**Response (200):**

```json
{
  "success": true,
  "data": [
    /* all orders with user details */
  ]
}
```

#### B. Update Order Status (PUT)

**Route:** `PUT /api/admin/orders/:id/status`
**Authentication:** ✅ Required (Admin)
**Body:**

```json
{
  "status": "shipped",
  "comment": "Order dispatched"
}
```

**Valid Statuses:** pending → confirmed → shipped → delivered → returned/cancelled
**Response (200):**

```json
{
  "success": true,
  "message": "Order status updated",
  "data": {
    /* updated order */
  }
}
```

#### C. Approve Refund (POST)

**Route:** `POST /api/admin/orders/:id/approve-refund`
**Authentication:** ✅ Required (Admin)
**Validation:**

- Payment status must be "completed"
- Order status must be "returned"
  **Response (200):**

```json
{
  "success": true,
  "message": "Refund approved",
  "data": {
    /* updated order */
  }
}
```

---

### 1️⃣2️⃣ ADMIN PRODUCT MANAGEMENT

#### A. Get All Products (Admin View) (GET)

**Route:** `GET /api/admin/products`
**Authentication:** ✅ Required (Admin)
**Query Parameters:**

```
page=1&limit=20&sort=-createdAt&status=active
```

**Response (200):**

```json
{
  "success": true,
  "results": 20,
  "total": 150,
  "data": [
    /* all products with stats */
  ]
}
```

#### B. Create Product (POST)

**Route:** `POST /api/admin/products`
**Authentication:** ✅ Required (Admin)
**Body:** Multipart form-data

```json
{
  "name": "Organic Tomato",
  "description": "Fresh organic tomatoes",
  "category": "507f1f77bcf86cd799439012",
  "price": 150,
  "originalPrice": 200,
  "stock": 100,
  "isOrganic": true,
  "isFeatured": false
}
```

**Files:** images (multipart upload)
**Response (201):**

```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    /* created product */
  }
}
```

#### C. Update Product (PUT)

**Route:** `PUT /api/admin/products/:id`
**Response (200):**

```json
{
  "success": true,
  "message": "Product updated successfully",
  "data": {
    /* updated product */
  }
}
```

#### D. Delete Product (DELETE)

**Route:** `DELETE /api/admin/products/:id`
**Response (200):**

```json
{
  "success": true,
  "message": "Product deleted successfully"
}
```

#### E. Feature/Unfeature Product (PATCH)

**Route:** `PATCH /api/admin/products/:id/feature`
**Body:**

```json
{
  "isFeatured": true
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Product featured",
  "data": {
    /* updated product */
  }
}
```

#### F. Get Product Statistics (GET)

**Route:** `GET /api/admin/products/:id/stats`
**Response (200):**

```json
{
  "success": true,
  "data": {
    "productId": "507f1f77bcf86cd799439011",
    "totalSold": 145,
    "totalRevenue": 21750,
    "rating": 4.5,
    "totalReviews": 32,
    "viewCount": 2541
  }
}
```

---

## 🔗 API Routes Summary Table

| Method | Route                      | Auth | Purpose              |
| ------ | -------------------------- | ---- | -------------------- |
| POST   | /api/auth/register         | ❌   | User registration    |
| POST   | /api/auth/verify-otp       | ❌   | Verify OTP           |
| POST   | /api/auth/login            | ❌   | User login           |
| GET    | /api/users/profile         | ✅   | Get user profile     |
| PUT    | /api/users/profile         | ✅   | Update profile       |
| PUT    | /api/users/change-password | ✅   | Change password      |
| GET    | /api/addresses             | ✅   | Get addresses        |
| POST   | /api/addresses             | ✅   | Create address       |
| PUT    | /api/addresses/:id         | ✅   | Update address       |
| DELETE | /api/addresses/:id         | ✅   | Delete address       |
| GET    | /api/products              | ❌   | Get all products     |
| GET    | /api/products/:id          | ❌   | Get product by ID    |
| GET    | /api/products/slug/:slug   | ❌   | Get by slug          |
| POST   | /api/admin/products        | ✅   | Create product       |
| PUT    | /api/admin/products/:id    | ✅   | Update product       |
| DELETE | /api/admin/products/:id    | ✅   | Delete product       |
| GET    | /api/cart                  | ✅   | Get cart             |
| POST   | /api/cart/add              | ✅   | Add to cart          |
| PUT    | /api/cart/update           | ✅   | Update cart          |
| DELETE | /api/cart/:id              | ✅   | Remove from cart     |
| POST   | /api/orders                | ✅   | Create order         |
| GET    | /api/orders                | ✅   | Get orders           |
| GET    | /api/orders/:id            | ✅   | Get order by ID      |
| PATCH  | /api/orders/:id/cancel     | ✅   | Cancel order         |
| GET    | /api/categories            | ❌   | Get categories       |
| GET    | /api/coupons               | ❌   | Get active coupons   |
| POST   | /api/coupons/validate      | ✅   | Validate coupon      |
| GET    | /api/reviews/:productId    | ❌   | Get reviews          |
| POST   | /api/reviews               | ✅   | Create review        |
| GET    | /api/wishlist              | ✅   | Get wishlist         |
| POST   | /api/wishlist/add          | ✅   | Add to wishlist      |
| DELETE | /api/wishlist/:id          | ✅   | Remove from wishlist |

---

## ⚠️ Common Error Responses

### 400 Bad Request

```json
{
  "success": false,
  "message": "Validation error or invalid input",
  "errors": [{ "field": "email", "message": "Invalid email format" }]
}
```

### 401 Unauthorized

```json
{
  "success": false,
  "message": "No token provided or invalid token"
}
```

### 403 Forbidden

```json
{
  "success": false,
  "message": "Access denied. Insufficient permissions"
}
```

### 404 Not Found

```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 500 Server Error

```json
{
  "success": false,
  "message": "Internal server error",
  "error": "Error details (development only)"
}
```

---

## 🔐 Authentication

### JWT Token Structure

**Token Location:** `Authorization: Bearer <token>`
**Token Format:**

```
Header.Payload.Signature
```

**Token Payload:**

```json
{
  "id": "507f1f77bcf86cd799439011",
  "email": "john@example.com",
  "role": "customer",
  "iat": 1673952600,
  "exp": 1674557400
}
```

### Token Expiration

- **Access Token:** 7 days
- **Refresh Token:** 30 days
- **OTP:** 10 minutes

---

### Development Mode

```bash
npm run dev
```

- Uses Nodemon for auto-restart
- Enables detailed logging
- HotReload on file changes

### Production Mode

```bash
npm start
```

- Standard Node.js execution
- Minimal logging
- Optimized performance

### Check Server Health

```bash
# Health check endpoint
curl http://localhost:4001/api/health

# Response:
{
  "status": "OK",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Common Issues & Solutions

#### Port Already in Use

```bash
# macOS/Linux: Find process using port 4001
lsof -i :4001

# Kill process
kill -9 <PID>

# Or change PORT in .env
PORT=4002
```

#### MongoDB Connection Failed

```
Solution:
1. Check DB_CONNECT URL in .env
2. Verify MongoDB is running
3. Check IP whitelist in MongoDB Atlas
4. Verify credentials
```

#### CORS Errors

```
Solution:
1. Add frontend URL to ALLOWED_ORIGINS in .env
2. Format: http://localhost:5173,https://yourdomain.com
3. Restart server
```

#### Email Not Sending

```
Solution:
1. Enable "Less secure app access" in Gmail
2. Use 16-char App Password
3. Verify EMAIL_HOST = smtp.gmail.com
4. Verify EMAIL_PORT = 587
```

---

## 📦 Dependencies Summary

| Package                | Version | Purpose                    |
| ---------------------- | ------- | -------------------------- |
| express                | ^4.21.2 | Web framework              |
| mongoose               | ^8.8.4  | MongoDB ODM                |
| jsonwebtoken           | ^9.0.2  | JWT authentication         |
| bcryptjs               | ^2.4.3  | Password hashing           |
| cors                   | ^2.8.5  | CORS handling              |
| helmet                 | ^7.1.0  | Security headers           |
| express-rate-limit     | ^6.10.0 | Rate limiting              |
| express-validator      | ^7.0.1  | Input validation           |
| multer                 | ^1.4.5  | File uploads               |
| nodemailer             | ^6.9.15 | Email sending              |
| cloudinary             | Latest  | Cloud file storage         |
| node-cron              | ^3.0.3  | Job scheduling             |
| morgan                 | ^1.10.0 | HTTP logging               |
| dotenv                 | ^16.4.5 | Environment variables      |
| axios                  | ^1.7.7  | HTTP client                |
| express-mongo-sanitize | ^2.2.0  | NoSQL injection prevention |
| xss                    | ^1.0.15 | XSS protection             |

---

## 🎯 API Base URL & Endpoints

**Base URL:** `http://localhost:4001/api`

### Route Prefix Structure

```
/api/auth          → Authentication (login, register, logout)
/api/users         → User management
/api/products      → Product catalog
/api/categories    → Product categories
/api/cart          → Shopping cart
/api/orders        → Orders management
/api/reviews       → Product reviews
/api/wishlist      → Wishlist
/api/addresses     → Delivery addresses
/api/coupons       → Discount codes
/api/admin         → Admin operations
/api/payment       → Payment processing
/api/esewa         → eSewa integration
```

---

## ✅ Deployment Checklist

- [ ] Set `NODE_ENV=production` in `.env`
- [ ] Update all URLs to production domains
- [ ] Verify all environment variables set
- [ ] Enable HTTPS in production
- [ ] Set up MongoDB backups
- [ ] Configure CloudFlare or CDN
- [ ] Set up SSL/TLS certificates
- [ ] Enable monitoring & logging
- [ ] Configure automated email alerts
- [ ] Test all payment flows
- [ ] Set up database indexes
- [ ] Enable database replication

---

## 📞 Support & Documentation

- **GitHub**: [Repository Link]
- **Issues**: Report bugs via GitHub Issues
- **Email**: support@jumlaya.com

---

**Last Updated:** January 2024
**Version:** 1.0.0
**License:** ISC
JUMLAYA-OFFICIAL/
│
├── Backend/
│   ├── config/
│   │   ├── cloudinary.js
│   │   └── db.js
│   │
│   ├── controllers/
│   │   ├── address.controller.js
│   │   ├── admin.order.controller.js
│   │   ├── admin.product.controller.js
│   │   ├── cart.controller.js
│   │   ├── category.controller.js
│   │   ├── coupon.controller.js
│   │   ├── esewa.controller.js
│   │   ├── order.admin.controller.js
│   │   ├── order.controller.js
│   │   ├── otp.controller.js
│   │   ├── payment.controller.js
│   │   ├── product.controller.js
│   │   ├── review.controller.js
│   │   ├── user.controller.js
│   │   └── wishlist.controller.js
│   │
│   ├── jobs/
│   │   ├── cleanupExpiredCarts.js
│   │   ├── scheduler.js
│   │   ├── sendAbandonedCartEmails.js
│   │   └── updateInventory.js
│   │
│   ├── middlewares/
│   │   ├── auth.middleware.js
│   │   ├── authorize.middleware.js
│   │   ├── cors.middleware.js
│   │   ├── error.middleware.js
│   │   ├── logger.middleware.js
│   │   ├── rateLimit.middleware.js
│   │   ├── sanitize.js
│   │   ├── upload.middleware.js
│   │   └── validation.middleware.js
│   │
│   ├── models/
│   │   ├── address.model.js
│   │   ├── cart.model.js
│   │   ├── category.model.js
│   │   ├── coupon.model.js
│   │   ├── order.model.js
│   │   ├── product.model.js
│   │   ├── review.model.js
│   │   ├── user.model.js
│   │   └── wishlist.model.js
│   │
│   ├── node_modules/
│   │
│   ├── routes/
│   │   ├── address.routes.js
│   │   ├── admin.order.routes.js
│   │   ├── admin.product.routes.js
│   │   ├── cart.routes.js
│   │   ├── category.routes.js
│   │   ├── coupon.routes.js
│   │   ├── esewa.routes.js
│   │   ├── order.routes.js
│   │   ├── otp.routes.js
│   │   ├── payment.routes.js
│   │   ├── product.routes.js
│   │   ├── review.routes.js
│   │   ├── user.routes.js
│   │   └── wishlist.routes.js
│   │
│   ├── services/
│   │   ├── cart.service.js
│   │   ├── coupon.service.js
│   │   ├── email.service.js
│   │   ├── inventory.service.js
│   │   ├── order.service.js
│   │   ├── payment.service.js
│   │   ├── product.service.js
│   │   └── user.service.js
│   │
│   ├── tests/
│   │   ├── cart.test.js
│   │   ├── order.test.js
│   │   ├── product.test.js
│   │   └── user.test.js
│   │
│   ├── uploads/
│   │   ├── categories/
│   │   ├── products/
│   │   └── users/
│   │
│   ├── utils/
│   │   ├── apiFeatures.js
│   │   ├── AppError.js
│   │   ├── catchAsync.js
│   │   ├── generateOrderId.js
│   │   ├── paymentProviders.js
│   │   ├── priceCalculator.js
│   │   ├── response.js
│   │   ├── sendEmail.js
│   │   ├── slugify.js
│   │   └── validator.js
│   │
│   ├── validators/
│   │   ├── address.validator.js
│   │   ├── cart.validator.js
│   │   ├── order.validator.js
│   │   ├── product.validator.js
│   │   ├── review.validator.js
│   │   └── user.validator.js
│   │
│   ├── .env
│   ├── .env.example
│   ├── .gitignore
│   ├── app.js
│   ├── FOLDER_STRUCTURE.md
│   ├── INTEGRATION_GUIDE.md
│   ├── package-lock.json
│   ├── package.json
│   ├── README.md
│   └── server.js
│
└── Frontend/
    ├── node_modules/
    │
    ├── public/
    │   └── images/
    │       └── vite.svg
    │
    ├── src/
    │   ├── api/
    │   │   ├── address.api.js
    │   │   ├── auth.api.js
    │   │   ├── axios.config.js
    │   │   ├── cart.api.js
    │   │   ├── category.api.js
    │   │   ├── coupon.api.js
    │   │   ├── order.api.js
    │   │   ├── payment.api.js
    │   │   ├── product.api.js
    │   │   ├── review.api.js
    │   │   ├── user.api.js
    │   │   └── wishlist.api.js
    │   │
    │   ├── assets/
    │   │   └── react.svg
    │   │
    │   ├── components/
    │   │   ├── auth/
    │   │   │   ├── LoginForm.jsx
    │   │   │   ├── OTPVerification.jsx
    │   │   │   └── RegisterForm.jsx
    │   │   │
    │   │   ├── cart/
    │   │   │   ├── CartItem.jsx
    │   │   │   ├── CartSummary.jsx
    │   │   │   └── EmptyCart.jsx
    │   │   │
    │   │   ├── common/
    │   │   │   ├── Badge.jsx
    │   │   │   ├── Button.jsx
    │   │   │   ├── Card.jsx
    │   │   │   ├── ErrorMessage.jsx
    │   │   │   ├── Input.jsx
    │   │   │   ├── LanguageToggle.jsx
    │   │   │   ├── LoadingSpinner.jsx
    │   │   │   ├── Modal.jsx
    │   │   │   ├── Pagination.jsx
    │   │   │   ├── Rating.jsx
    │   │   │   └── ThemeToggle.jsx
    │   │   │
    │   │   ├── layout/
    │   │   │   ├── Breadcrumb.jsx
    │   │   │   ├── Footer.jsx
    │   │   │   ├── Navbar.jsx
    │   │   │   └── Sidebar.jsx
    │   │   │
    │   │   ├── order/
    │   │   │   ├── OrderCard.jsx
    │   │   │   ├── OrderDetails.jsx
    │   │   │   └── OrderTimeline.jsx
    │   │   │
    │   │   └── product/
    │   │       ├── ProductCard.jsx
    │   │       ├── ProductFilters.jsx
    │   │       ├── ProductGrid.jsx
    │   │       ├── ProductImageGallery.jsx
    │   │       └── ProductQuickView.jsx
    │   │
    │   ├── context/
    │   │   ├── AuthContext.jsx
    │   │   ├── CartContext.jsx
    │   │   ├── LanguageContext.jsx
    │   │   ├── ThemeContext.jsx
    │   │   └── WishlistContext.jsx
    │   │
    │   ├── hooks/
    │   │   ├── useAuth.js
    │   │   ├── useCart.js
    │   │   ├── useDebounce.js
    │   │   ├── useLanguage.js
    │   │   ├── useLocalStorage.js
    │   │   ├── usePagination.js
    │   │   ├── useTheme.js
    │   │   └── useWishlist.js
    │   │
    │   ├── pages/
    │   │   ├── About.jsx
    │   │   ├── Cart.jsx
    │   │   ├── Checkout.jsx
    │   │   ├── Contact.jsx
    │   │   ├── ForgotPassword.jsx
    │   │   ├── Home.jsx
    │   │   ├── Login.jsx
    │   │   ├── NotFound.jsx
    │   │   ├── OrderDetails.jsx
    │   │   ├── Orders.jsx
    │   │   ├── ProductDetails.jsx
    │   │   ├── Products.jsx
    │   │   ├── Profile.jsx
    │   │   ├── Register.jsx
    │   │   └── Wishlist.jsx
    │   │
    │   ├── routes/
    │   │   ├── AppRoutes.jsx
    │   │   ├── ProtectedRoute.jsx
    │   │   └── PublicRoute.jsx
    │   │
    │   ├── styles/
    │   │
    │   ├── utils/
    │   │   ├── cn.js
    │   │   ├── constants.js
    │   │   ├── formatters.js
    │   │   ├── helpers.js
    │   │   ├── storage.js
    │   │   └── validators.js
    │   │
    │   ├── App.css
    │   ├── App.jsx
    │   ├── index.css
    │   └── main.jsx
    │
    ├── .env
    ├── .env.example
    ├── .gitignore
    ├── eslint.config.js
    ├── index.html
    ├── package-lock.json
    ├── package.json
    ├── postcss.config.js
    ├── README.md
    ├── tailwind.config.js
    └── vite.config.js