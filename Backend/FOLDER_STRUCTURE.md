# JUMLAYA Backend - Folder Structure & Architecture

## 📁 Complete Backend Structure

```
Backend/
│
├── config/                           # Configuration Files (2 files)
│   ├── cloudinary.js                # Cloudinary image service setup
│   └── db.js                        # MongoDB connection configuration
│
├── controllers/                      # Business Logic & Request Handlers (15 files)
│   ├── user.controller.js           # User auth, profile, registration
│   ├── product.controller.js        # Product queries, search, filters
│   ├── admin.product.controller.js  # Admin: create, update, delete products
│   ├── cart.controller.js           # Cart operations (add, remove, update)
│   ├── order.controller.js          # User order management
│   ├── order.admin.controller.js    # Admin order operations
│   ├── admin.order.controller.js    # Admin order management (alternate)
│   ├── address.controller.js        # Address CRUD operations
│   ├── category.controller.js       # Category management
│   ├── coupon.controller.js         # Coupon/discount handling
│   ├── review.controller.js         # Product reviews
│   ├── payment.controller.js        # Payment processing
│   ├── esewa.controller.js          # eSewa payment integration
│   ├── otp.controller.js            # OTP verification
│   └── wishlist.controller.js       # Wishlist management
│
├── jobs/                            # Background Jobs & Schedulers (4 files)
│   ├── scheduler.js                 # Job scheduler setup
│   ├── cleanupExpiredCarts.js       # Auto-cleanup expired shopping carts
│   ├── sendAbandonedCartEmails.js   # Send abandoned cart notifications
│   └── updateInventory.js           # Automatic inventory updates
│
├── middlewares/                     # Request Processing Middleware (9 files)
│   ├── auth.middleware.js           # JWT token verification
│   ├── authorize.middleware.js      # Role-based access control
│   ├── cors.middleware.js           # Cross-Origin Resource Sharing
│   ├── error.middleware.js          # Global error handler
│   ├── logger.middleware.js         # Request/response logging
│   ├── rateLimit.middleware.js      # Rate limiting for API protection
│   ├── sanitize.js                  # XSS & injection prevention
│   ├── upload.middleware.js         # Multer file upload configuration
│   └── validation.middleware.js     # Input validation
│
├── models/                          # MongoDB Schemas (9 files)
│   ├── user.model.js                # User schema with auth fields
│   ├── product.model.js             # Product details & inventory
│   ├── order.model.js               # Order tracking & history
│   ├── category.model.js            # Product categories
│   ├── review.model.js              # Product reviews & ratings
│   ├── address.model.js             # User addresses
│   ├── cart.model.js                # Shopping cart data
│   ├── coupon.model.js              # Discount coupons
│   └── wishlist.model.js            # User wishlists
│
├── routes/                          # API Endpoint Definitions (14 files)
│   ├── user.routes.js               # /api/users - auth, profile
│   ├── product.routes.js            # /api/products - product queries
│   ├── admin.product.routes.js      # /api/admin/products - product management
│   ├── cart.routes.js               # /api/cart - cart operations
│   ├── order.routes.js              # /api/orders - user orders
│   ├── admin.order.routes.js        # /api/admin/orders - order management
│   ├── address.routes.js            # /api/addresses - address CRUD
│   ├── category.routes.js           # /api/categories - category management
│   ├── coupon.routes.js             # /api/coupons - coupon operations
│   ├── review.routes.js             # /api/reviews - product reviews
│   ├── payment.routes.js            # /api/payment - payment processing
│   ├── esewa.routes.js              # /api/esewa - eSewa callbacks
│   ├── otp.routes.js                # /api/otp - OTP handling
│   └── wishlist.routes.js           # /api/wishlist - wishlist management
│
├── services/                        # Business Logic Layer (8 files)
│   ├── user.service.js              # User operations (signup, login, profile)
│   ├── product.service.js           # Product queries & filters
│   ├── cart.service.js              # Cart calculations & operations
│   ├── coupon.service.js            # Coupon validation & application
│   ├── email.service.js             # Email sending (nodemailer)
│   ├── inventory.service.js         # Stock management & updates
│   ├── order.service.js             # Order processing & tracking
│   └── payment.service.js           # Payment provider integration
│
├── tests/                           # Unit & Integration Tests (4 files)
│   ├── cart.test.js                 # Cart functionality tests
│   ├── order.test.js                # Order processing tests
│   ├── product.test.js              # Product query tests
│   └── user.test.js                 # User auth tests
│
├── uploads/                         # File Storage Directories
│   ├── products/                    # Product images
│   ├── categories/                  # Category images
│   └── users/                       # User avatars/profiles
│
├── utils/                           # Utility Functions (10 files)
│   ├── apiFeatures.js               # Query builder (pagination, sorting, filters)
│   ├── AppError.js                  # Custom error class
│   ├── catchAsync.js                # Async error wrapper
│   ├── generateOrderId.js           # Order ID generator
│   ├── paymentProviders.js          # Payment method handlers
│   ├── priceCalculator.js           # Price computation logic
│   ├── response.js                  # Response formatter
│   ├── sendEmail.js                 # Email dispatcher
│   ├── slugify.js                   # URL slug generator
│   └── validator.js                 # Custom validators
│
├── validators/                      # Request Validators (6 files)
│   ├── user.validator.js            # User input validation
│   ├── product.validator.js         # Product data validation
│   ├── order.validator.js           # Order validation
│   ├── address.validator.js         # Address validation
│   ├── cart.validator.js            # Cart item validation
│   └── review.validator.js          # Review validation
│
├── .env                             # Environment variables (local)
├── .env.example                     # Environment template
├── .gitignore                       # Git ignore rules
├── app.js                           # Express app configuration
├── server.js                        # Server entry point (PORT 4001)
├── package.json                     # Dependencies & scripts
├── README.md                        # API documentation
└── node_modules/                    # Installed dependencies (auto-generated)
```

---

## 📊 File Statistics

| Category        | Count   | Files                                                                                                                    |
| --------------- | ------- | ------------------------------------------------------------------------------------------------------------------------ |
| **Controllers** | 15      | User, Product, Admin Product, Cart, Order, Admin Order, Address, Category, Coupon, Review, Payment, eSewa, OTP, Wishlist |
| **Models**      | 9       | User, Product, Order, Category, Review, Address, Cart, Coupon, Wishlist                                                  |
| **Routes**      | 14      | Same endpoints as controllers                                                                                            |
| **Middlewares** | 9       | Auth, Authorize, CORS, Error, Logger, RateLimit, Sanitize, Upload, Validation                                            |
| **Services**    | 8       | User, Product, Cart, Coupon, Email, Inventory, Order, Payment                                                            |
| **Utils**       | 10      | API Features, Error, Catch Async, Generate ID, Payments, Price, Response, Email, Slug, Validator                         |
| **Validators**  | 6       | User, Product, Order, Address, Cart, Review                                                                              |
| **Jobs**        | 4       | Scheduler, Cleanup Carts, Abandoned Cart Emails, Update Inventory                                                        |
| **Tests**       | 4       | Cart, Order, Product, User                                                                                               |
| **Config**      | 2       | Cloudinary, Database                                                                                                     |
| **Total**       | **81+** | Files + Configuration                                                                                                    |

---

## 🏗️ Architecture Overview

```
Request Flow:
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│  Express Middleware │ ◄── CORS, Logger, Auth, Validate
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Route Handler      │ ◄── /api/products, /api/orders, etc.
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Controller Logic   │ ◄── Business logic & request processing
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Service Layer      │ ◄── Complex operations & data processing
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Database Models    │ ◄── MongoDB queries via Mongoose
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  MongoDB            │ ◄── Data persistence
└─────────────────────┘
```

---

## 📡 API Endpoint Structure

### Route Organization

```
/api/
├── /users              → user.routes.js         (auth, profile)
├── /products           → product.routes.js      (product queries)
├── /admin/products     → admin.product.routes.js (product management)
├── /cart               → cart.routes.js         (cart operations)
├── /orders             → order.routes.js        (user orders)
├── /admin/orders       → admin.order.routes.js  (order management)
├── /addresses          → address.routes.js      (address CRUD)
├── /categories         → category.routes.js     (categories)
├── /coupons            → coupon.routes.js       (discounts)
├── /reviews            → review.routes.js       (reviews)
├── /payment            → payment.routes.js      (payments)
├── /esewa              → esewa.routes.js        (eSewa)
├── /otp                → otp.routes.js          (OTP)
└── /wishlist           → wishlist.routes.js     (wishlists)
```

---

## 🔄 Key Features

### 1. **Background Jobs** (jobs/)

- Automated cart cleanup
- Abandoned cart email notifications
- Inventory updates
- Job scheduling

### 2. **Enhanced Security** (middlewares/)

- Rate limiting
- XSS sanitization
- CORS protection
- Error handling

### 3. **File Upload** (uploads/ + Cloudinary)

- Product images
- Category images
- User avatars

### 4. **Coupon System**

- Discount calculation
- Coupon validation
- Price adjustment

### 5. **Payment Integration**

- eSewa support
- Payment verification
- Order synchronization

### 6. **Wishlist Feature**

- Save products
- User wishlists
- Quick add to cart

---

## ✅ Quick Reference

| Need               | File                             | Purpose                  |
| ------------------ | -------------------------------- | ------------------------ |
| Add new endpoint   | routes/ + controllers/           | Define route and handler |
| Database operation | models/ + services/              | Create schema and logic  |
| Input validation   | validators/                      | Validate request data    |
| Error handling     | utils/AppError.js                | Custom error creation    |
| Send email         | services/email.service.js        | Email notifications      |
| Image upload       | middlewares/upload.middleware.js | File handling            |
| Background task    | jobs/                            | Scheduled operations     |
| API response       | utils/response.js                | Consistent format        |

---

**Backend Version:** 2.0  
**Updated:** December 17, 2025  
**Total Components:** 81+ files  
**Database:** MongoDB with Mongoose ODM
