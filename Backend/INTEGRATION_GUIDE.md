# 🍃 JUMLAYA Backend - Complete Integration Guide

> **Production-Ready Node.js/Express REST API** for the JUMLAYA organic e-commerce platform with MongoDB, JWT auth, file uploads, and payment integration.

**Base URL:** `http://localhost:4001/api`  
**Version:** 2.0  
**Last Updated:** December 17, 2025

---

## 📚 Table of Contents

1. [Quick Start](#-quick-start)
2. [System Architecture](#-system-architecture)
3. [Setup & Installation](#️-setup--installation)
4. [Database Configuration](#-database-configuration)
5. [Authentication Flow](#-authentication-flow)
6. [Complete CRUD Operations](#-complete-crud-operations)
7. [API Integration Methods](#-api-integration-methods)
8. [Error Handling](#-error-handling)
9. [Security Features](#-security-features)
10. [Deployment](#-deployment)

---

## 🚀 Quick Start

### Installation & Setup

```bash
# Navigate to backend
cd Backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your configuration
nano .env

# Start development server
npm run dev

# Start production server
npm start
```

**Server runs on:** `http://localhost:4001`

---

## 🏗️ System Architecture

### Technology Stack

```
┌─────────────────────────────────────────┐
│         Frontend (React + Vite)         │
└────────────────┬────────────────────────┘
                 │ HTTP/REST API
┌────────────────▼────────────────────────┐
│ Backend (Node.js + Express v5)          │
│ ┌──────────────────────────────────────┤
│ │ • Routes (14 endpoints)              │
│ │ • Controllers (15 business logic)    │
│ │ • Services (8 abstraction layers)    │
│ │ • Middleware (9 request handlers)    │
│ │ • Validators (6 input validators)    │
│ └──────────────────────────────────────┤
├──────────────────────────────────────────┤
│ Security Layer                           │
│ ├─ JWT Authentication                    │
│ ├─ Rate Limiting                         │
│ ├─ CORS Protection                       │
│ ├─ XSS Sanitization                      │
│ └─ Input Validation                      │
├──────────────────────────────────────────┤
│ External Services                        │
│ ├─ MongoDB (Data)                        │
│ ├─ Cloudinary (Images)                   │
│ ├─ eSewa (Payments)                      │
│ ├─ Gmail SMTP (Email)                    │
│ └─ Node Scheduler (Jobs)                 │
└──────────────────────────────────────────┘
```

---

## ⚙️ Setup & Installation

### Prerequisites

```bash
# Required versions
Node.js: v18+
npm: v9+
MongoDB: 4.4+
```

### Environment Configuration

Create `.env` file:

```env
# Server Configuration
PORT=4001
NODE_ENV=development

# Database
DB_CONNECT=mongodb://localhost:27017/JUMLAYA

# JWT Tokens
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_key_min_32_chars
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d

# Email Service (Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Cloudinary (Image Upload)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Payment Gateway (eSewa)
ESEWA_MERCHANT_ID=your_merchant_id
ESEWA_SECRET=your_esewa_secret
ESEWA_SUCCESS_URL=http://localhost:3000/order/success
ESEWA_FAILURE_URL=http://localhost:3000/order/failure

# Frontend URLs
FRONTEND_URL=http://localhost:3000

# API Limits
RATE_LIMIT_WINDOW_MS=15000
RATE_LIMIT_MAX_REQUESTS=100
MAX_FILE_SIZE=5242880
```

### Install Dependencies

```bash
npm install

# Optional: Install nodemon for development
npm install -D nodemon
```

### Start Server

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start

# Run tests
npm test
```

---

## 🗄️ Database Configuration

### MongoDB Connection

**File:** `config/db.js`

```javascript
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_CONNECT, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
   
  } catch (err) {
    console.error("❌ Connection failed:", err);
    process.exit(1);
  }
};

module.exports = connectDB;
```

### Database Initialization

```bash
# Connect to MongoDB
mongo mongodb://localhost:27017/JUMLAYA

# Create indexes
db.users.createIndex({ email: 1 }, { unique: true })
db.products.createIndex({ slug: 1 }, { unique: true })
db.orders.createIndex({ user: 1 })
```

---

## 🔐 Authentication Flow

### JWT Token Structure

```javascript
// Access Token (expires in 7 days)
{
  "id": "userId",
  "email": "user@example.com",
  "role": "user|admin|vendor",
  "iat": 1702790400,
  "exp": 1703395200
}
```

### Token Usage

```javascript
// Request header
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

// Extract in middleware
const token = req.headers.authorization?.split(' ')[1];
```

### Authentication Process

```
User Registration
    │
    ├─ Validate input
    ├─ Hash password (bcrypt)
    ├─ Create user in DB
    └─ Send OTP email
         │
User Verifies OTP
    │
    ├─ Validate OTP
    ├─ Mark user as verified
    ├─ Generate JWT tokens
    └─ Return authToken + refreshToken
         │
Client Stores Token
    │
    ├─ Save to localStorage
    └─ Use in Authorization header
         │
Token Verification
    │
    ├─ Middleware verifies JWT
    ├─ Extract user info
    └─ Attach to req.user
```

---

## 🔄 Complete CRUD Operations

### 1. USER CRUD

#### 1.1 Register User (Create)

**Endpoint:** `POST /api/users/register`

```javascript
// Frontend Implementation
async function registerUser(userData) {
  try {
    const response = await fetch("http://localhost:4001/api/users/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstname: "John",
        lastname: "Doe",
        username: "johndoe",
        email: "john@example.com",
        phone: "9800000000",
        password: "SecurePass123",
      }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("❌ Registration failed:", error);
  }
}

// Backend Implementation (controllers/user.controller.js)
exports.register = catchAsync(async (req, res, next) => {
  const { firstname, lastname, email, phone, password } = req.body;

  // Validation
  if (!firstname || !email || !password) {
    return next(new AppError("Please provide required fields", 400));
  }

  // Check if user exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError("Email already registered", 400));
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Create user
  const user = await User.create({
    firstname,
    lastname,
    email,
    phone,
    password: hashedPassword,
    verificationCode: otp,
    verificationCodeExpires: Date.now() + 10 * 60 * 1000,
  });

  // Send OTP email
  await sendEmail({
    email: user.email,
    subject: "Email Verification OTP",
    template: "otp",
    data: { otp },
  });

  return successResponse(res, 201, "OTP sent to email", { email: user.email });
});
```

**cURL Request:**

```bash
curl -X POST http://localhost:4001/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstname": "John",
    "lastname": "Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "phone": "9800000000",
    "password": "SecurePass123"
  }'
```

#### 1.2 Verify OTP & Complete Registration (Update)

**Endpoint:** `POST /api/users/verify-otp`

```javascript
// Frontend
async function verifyOTP(email, otp) {
  const response = await fetch("http://localhost:4001/api/users/verify-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp }),
  });

  const data = await response.json();
  if (data.success) {
    localStorage.setItem("authToken", data.data.authToken);
    localStorage.setItem("refreshToken", data.data.refreshToken);
  }
  return data;
}

// Backend
exports.verifyOTP = catchAsync(async (req, res, next) => {
  const { email, otp } = req.body;

  const user = await User.findOne({
    email,
    verificationCode: otp,
    verificationCodeExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError("Invalid or expired OTP", 400));
  }

  // Mark user as verified
  user.isVerified = true;
  user.verificationCode = undefined;
  user.verificationCodeExpires = undefined;
  await user.save();

  // Generate tokens
  const authToken = jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  const refreshToken = jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "30d" }
  );

  return successResponse(res, 200, "Email verified", {
    user: { id: user._id, email: user.email, firstname: user.firstname },
    authToken,
    refreshToken,
  });
});
```

#### 1.3 Login (Read + Create Session)

**Endpoint:** `POST /api/users/login`

```javascript
// Frontend
async function loginUser(email, password) {
  const response = await fetch("http://localhost:4001/api/users/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();
  if (data.success) {
    localStorage.setItem("authToken", data.data.authToken);
    localStorage.setItem("user", JSON.stringify(data.data.user));
  }
  return data;
}

// Backend
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Find user
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return next(new AppError("Invalid credentials", 401));
  }

  // Check if verified
  if (!user.isVerified) {
    return next(new AppError("Please verify email first", 400));
  }

  // Generate tokens
  const authToken = jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return successResponse(res, 200, "Login successful", {
    user: { id: user._id, email: user.email, firstname: user.firstname },
    authToken,
  });
});
```

#### 1.4 Get User Profile (Read)

**Endpoint:** `GET /api/users/profile` (Protected)

```javascript
// Frontend
async function getUserProfile(token) {
  const response = await fetch("http://localhost:4001/api/users/profile", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  return response.json();
}

// Backend
exports.getProfile = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id)
    .populate("addresses")
    .select("-password");

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  return successResponse(res, 200, "Profile fetched", user);
});
```

#### 1.5 Update User Profile (Update)

**Endpoint:** `PUT /api/users/profile` (Protected)

```javascript
// Frontend
async function updateProfile(token, profileData) {
  const response = await fetch("http://localhost:4001/api/users/profile", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      firstname: "Jane",
      phone: "9810000000",
    }),
  });

  return response.json();
}

// Backend
exports.updateProfile = catchAsync(async (req, res, next) => {
  const { firstname, lastname, phone } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { firstname, lastname, phone },
    { new: true, runValidators: true }
  );

  return successResponse(res, 200, "Profile updated", user);
});
```

#### 1.6 Delete User Account (Delete)

**Endpoint:** `DELETE /api/users/account` (Protected)

```javascript
// Frontend
async function deleteAccount(token) {
  const response = await fetch("http://localhost:4001/api/users/account", {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.json();
}

// Backend
exports.deleteAccount = catchAsync(async (req, res, next) => {
  // Soft delete - mark as inactive
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { isActive: false },
    { new: true }
  );

  return successResponse(res, 200, "Account deleted", { user });
});
```

---

### 2. PRODUCT CRUD

#### 2.1 Create Product (Admin)

**Endpoint:** `POST /api/admin/products` (Protected - Admin Only)

```javascript
// Frontend - FormData for file upload
async function createProduct(token, productData, imageFiles) {
  const formData = new FormData();
  formData.append("name", productData.name);
  formData.append("description", productData.description);
  formData.append("price", productData.price);
  formData.append("stock", productData.stock);
  formData.append("category", productData.category);
  formData.append("productType", productData.productType);

  // Add images
  imageFiles.forEach((file) => {
    formData.append("images", file);
  });

  const response = await fetch("http://localhost:4001/api/admin/products", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      // Don't set Content-Type, browser will set it with boundary
    },
    body: formData,
  });

  return response.json();
}

// Backend
exports.createProduct = catchAsync(async (req, res, next) => {
  const { name, description, price, stock, category, productType } = req.body;

  // Validate input
  if (!name || !price || !stock) {
    return next(new AppError("Missing required fields", 400));
  }

  // Generate slug
  const slug = slugify(name);

  // Upload images to Cloudinary
  const images = [];
  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      const result = await cloudinary.uploader.upload(file.path);
      images.push({
        url: result.secure_url,
        publicId: result.public_id,
        alt: name,
      });
    }
  }

  // Create product
  const product = await Product.create({
    name,
    slug,
    description,
    price,
    stock,
    category,
    productType,
    images,
    vendor: req.user.id,
  });

  return successResponse(res, 201, "Product created", product);
});
```

**cURL with File Upload:**

```bash
curl -X POST http://localhost:4001/api/admin/products \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "name=Organic Green Tea" \
  -F "description=Premium organic green tea from Nepal" \
  -F "price=599" \
  -F "stock=100" \
  -F "category=63d5f4c2e1a2b3c4d5e6f7g8" \
  -F "productType=herb" \
  -F "images=@/path/to/image1.jpg" \
  -F "images=@/path/to/image2.jpg"
```

#### 2.2 Get All Products (Read - Public)

**Endpoint:** `GET /api/products`

```javascript
// Frontend
async function getProducts(page = 1, limit = 12, filters = {}) {
  const queryString = new URLSearchParams({
    page,
    limit,
    search: filters.search || "",
    category: filters.category || "",
    minPrice: filters.minPrice || "",
    maxPrice: filters.maxPrice || "",
    sort: filters.sort || "-createdAt",
  }).toString();

  const response = await fetch(
    `http://localhost:4001/api/products?${queryString}`
  );
  return response.json();
}

// Backend
exports.getAllProducts = catchAsync(async (req, res, next) => {
  const {
    page = 1,
    limit = 12,
    search,
    category,
    minPrice,
    maxPrice,
    sort,
  } = req.query;

  // Build query
  let query = { isActive: true };

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  if (category) query.category = category;
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = minPrice;
    if (maxPrice) query.price.$lte = maxPrice;
  }

  // Execute query
  const skip = (page - 1) * limit;
  const products = await Product.find(query)
    .populate("category", "name")
    .sort(sort || "-createdAt")
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Product.countDocuments(query);

  return successResponse(res, 200, "Products fetched", {
    products,
    pagination: {
      current: parseInt(page),
      total: Math.ceil(total / limit),
      count: total,
    },
  });
});
```

#### 2.3 Get Single Product (Read)

**Endpoint:** `GET /api/products/:id`

```javascript
// Frontend
async function getProductById(productId) {
  const response = await fetch(
    `http://localhost:4001/api/products/${productId}`
  );
  const data = await response.json();

  // Increment view count
  await fetch(`http://localhost:4001/api/products/${productId}/view`, {
    method: "POST",
  });

  return data;
}

// Backend
exports.getProductById = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id)
    .populate("category")
    .populate("reviews");

  if (!product) {
    return next(new AppError("Product not found", 404));
  }

  return successResponse(res, 200, "Product fetched", product);
});
```

#### 2.4 Update Product (Admin)

**Endpoint:** `PATCH /api/admin/products/:id` (Protected - Admin Only)

```javascript
// Frontend
async function updateProduct(token, productId, updateData) {
  const response = await fetch(
    `http://localhost:4001/api/admin/products/${productId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        price: 699,
        stock: 50,
        description: "Updated description",
      }),
    }
  );

  return response.json();
}

// Backend
exports.updateProduct = catchAsync(async (req, res, next) => {
  const { price, stock, description, isFeatured } = req.body;

  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { price, stock, description, isFeatured },
    { new: true, runValidators: true }
  );

  if (!product) {
    return next(new AppError("Product not found", 404));
  }

  return successResponse(res, 200, "Product updated", product);
});
```

#### 2.5 Delete Product (Admin)

**Endpoint:** `DELETE /api/admin/products/:id` (Protected - Admin Only)

```javascript
// Frontend
async function deleteProduct(token, productId) {
  const response = await fetch(
    `http://localhost:4001/api/admin/products/${productId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.json();
}

// Backend
exports.deleteProduct = catchAsync(async (req, res, next) => {
  // Soft delete
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );

  if (!product) {
    return next(new AppError("Product not found", 404));
  }

  return successResponse(res, 200, "Product deleted", product);
});
```

---

### 3. CART CRUD

#### 3.1 Add to Cart (Create)

**Endpoint:** `POST /api/cart/add` (Protected)

```javascript
// Frontend
async function addToCart(token, productId, quantity) {
  const response = await fetch("http://localhost:4001/api/cart/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ productId, quantity }),
  });

  return response.json();
}

// Backend
exports.addToCart = catchAsync(async (req, res, next) => {
  const { productId, quantity } = req.body;

  // Get product
  const product = await Product.findById(productId);
  if (!product) {
    return next(new AppError("Product not found", 404));
  }

  // Check stock
  if (quantity > product.stock) {
    return next(new AppError("Insufficient stock", 400));
  }

  // Get or create cart
  let cart = await Cart.findOne({ user: req.user.id });
  if (!cart) {
    cart = new Cart({
      user: req.user.id,
      items: [],
    });
  }

  // Check if item exists in cart
  const itemIndex = cart.items.findIndex(
    (i) => i.product.toString() === productId
  );

  if (itemIndex > -1) {
    // Update quantity
    cart.items[itemIndex].quantity += quantity;
  } else {
    // Add new item
    cart.items.push({
      product: productId,
      quantity,
      priceSnapshot: product.price,
    });
  }

  await cart.save();

  return successResponse(res, 200, "Item added to cart", cart);
});
```

#### 3.2 Get Cart (Read)

**Endpoint:** `GET /api/cart` (Protected)

```javascript
// Frontend
async function getCart(token) {
  const response = await fetch("http://localhost:4001/api/cart", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.json();
}

// Backend
exports.getCart = catchAsync(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user.id }).populate(
    "items.product",
    "name price images"
  );

  if (!cart) {
    return successResponse(res, 200, "Cart is empty", { items: [], total: 0 });
  }

  return successResponse(res, 200, "Cart fetched", cart);
});
```

#### 3.3 Update Cart Item (Update)

**Endpoint:** `PATCH /api/cart/update/:itemId` (Protected)

```javascript
// Frontend
async function updateCartItem(token, itemId, quantity) {
  const response = await fetch(
    `http://localhost:4001/api/cart/update/${itemId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ quantity }),
    }
  );

  return response.json();
}

// Backend
exports.updateCartItem = catchAsync(async (req, res, next) => {
  const { quantity } = req.body;

  const cart = await Cart.findOne({
    user: req.user.id,
    "items._id": req.params.itemId,
  });

  if (!cart) {
    return next(new AppError("Cart item not found", 404));
  }

  // Update quantity
  cart.items.find(
    (item) => item._id.toString() === req.params.itemId
  ).quantity = quantity;
  await cart.save();

  return successResponse(res, 200, "Cart updated", cart);
});
```

#### 3.4 Remove from Cart (Delete)

**Endpoint:** `DELETE /api/cart/remove/:itemId` (Protected)

```javascript
// Frontend
async function removeFromCart(token, itemId) {
  const response = await fetch(
    `http://localhost:4001/api/cart/remove/${itemId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.json();
}

// Backend
exports.removeFromCart = catchAsync(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user.id });

  if (!cart) {
    return next(new AppError("Cart not found", 404));
  }

  // Remove item
  cart.items = cart.items.filter(
    (item) => item._id.toString() !== req.params.itemId
  );
  await cart.save();

  return successResponse(res, 200, "Item removed", cart);
});
```

#### 3.5 Clear Cart (Delete All)

**Endpoint:** `DELETE /api/cart/clear` (Protected)

```javascript
// Frontend
async function clearCart(token) {
  const response = await fetch("http://localhost:4001/api/cart/clear", {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.json();
}

// Backend
exports.clearCart = catchAsync(async (req, res, next) => {
  const cart = await Cart.findOneAndUpdate(
    { user: req.user.id },
    { items: [] },
    { new: true }
  );

  return successResponse(res, 200, "Cart cleared", cart);
});
```

---

### 4. ORDER CRUD

#### 4.1 Create Order (Create)

**Endpoint:** `POST /api/orders` (Protected)

```javascript
// Frontend
async function createOrder(token, orderData) {
  const response = await fetch("http://localhost:4001/api/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      items: [
        { productId: "prod123", quantity: 2 },
        { productId: "prod456", quantity: 1 },
      ],
      shippingAddressId: "addr123",
      paymentMethod: "esewa",
    }),
  });

  return response.json();
}

// Backend
exports.createOrder = catchAsync(async (req, res, next) => {
  const { items, shippingAddressId, paymentMethod } = req.body;

  // Validate address
  const address = await Address.findById(shippingAddressId);
  if (!address) {
    return next(new AppError("Address not found", 404));
  }

  // Calculate total
  let total = 0;
  const orderItems = [];

  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (!product) {
      return next(new AppError("Product not found", 404));
    }

    const itemTotal = product.price * item.quantity;
    total += itemTotal;

    orderItems.push({
      product: item.productId,
      quantity: item.quantity,
      priceSnapshot: product.price,
    });

    // Update stock
    product.stock -= item.quantity;
    await product.save();
  }

  // Generate order ID
  const orderId = generateOrderId();

  // Create order
  const order = await Order.create({
    user: req.user.id,
    orderId,
    items: orderItems,
    shippingAddress: shippingAddressId,
    totalPrice: total,
    paymentMethod,
    status: "pending",
  });

  // Clear user's cart
  await Cart.findOneAndUpdate({ user: req.user.id }, { items: [] });

  return successResponse(res, 201, "Order created", order);
});
```

#### 4.2 Get User Orders (Read)

**Endpoint:** `GET /api/orders` (Protected)

```javascript
// Frontend
async function getUserOrders(token, page = 1) {
  const response = await fetch(
    `http://localhost:4001/api/orders?page=${page}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.json();
}

// Backend
exports.getUserOrders = catchAsync(async (req, res, next) => {
  const orders = await Order.find({ user: req.user.id })
    .populate("items.product", "name images")
    .sort("-createdAt");

  return successResponse(res, 200, "Orders fetched", orders);
});
```

#### 4.3 Get Single Order (Read)

**Endpoint:** `GET /api/orders/:id` (Protected)

```javascript
// Frontend
async function getOrderDetail(token, orderId) {
  const response = await fetch(`http://localhost:4001/api/orders/${orderId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.json();
}

// Backend
exports.getOrderById = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id)
    .populate("items.product")
    .populate("shippingAddress");

  if (!order) {
    return next(new AppError("Order not found", 404));
  }

  // Check authorization
  if (order.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(new AppError("Not authorized", 403));
  }

  return successResponse(res, 200, "Order fetched", order);
});
```

#### 4.4 Cancel Order (Update/Delete)

**Endpoint:** `POST /api/orders/:id/cancel` (Protected)

```javascript
// Frontend
async function cancelOrder(token, orderId) {
  const response = await fetch(
    `http://localhost:4001/api/orders/${orderId}/cancel`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.json();
}

// Backend
exports.cancelOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new AppError("Order not found", 404));
  }

  // Only pending orders can be cancelled
  if (order.status !== "pending") {
    return next(new AppError("Cannot cancel non-pending order", 400));
  }

  // Restore stock
  for (const item of order.items) {
    const product = await Product.findById(item.product);
    product.stock += item.quantity;
    await product.save();
  }

  // Update order
  order.status = "cancelled";
  await order.save();

  return successResponse(res, 200, "Order cancelled", order);
});
```

---

### 5. ADDRESS CRUD

#### 5.1 Create Address (Create)

**Endpoint:** `POST /api/users/addresses` (Protected)

```javascript
// Frontend
async function createAddress(token, addressData) {
  const response = await fetch("http://localhost:4001/api/users/addresses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      label: "Home",
      street: "123 Main Street",
      city: "Kathmandu",
      state: "Bagmati",
      zip: "44600",
      country: "Nepal",
      phone: "9800000000",
    }),
  });

  return response.json();
}

// Backend
exports.createAddress = catchAsync(async (req, res, next) => {
  const { label, street, city, state, zip, country, phone } = req.body;

  const address = await Address.create({
    user: req.user.id,
    label,
    street,
    city,
    state,
    zip,
    country,
    phone,
  });

  return successResponse(res, 201, "Address created", address);
});
```

#### 5.2 Get All Addresses (Read)

**Endpoint:** `GET /api/users/addresses` (Protected)

```javascript
// Frontend
async function getAddresses(token) {
  const response = await fetch("http://localhost:4001/api/users/addresses", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.json();
}

// Backend
exports.getAddresses = catchAsync(async (req, res, next) => {
  const addresses = await Address.find({ user: req.user.id, isActive: true });

  return successResponse(res, 200, "Addresses fetched", addresses);
});
```

#### 5.3 Update Address (Update)

**Endpoint:** `PATCH /api/users/addresses/:id` (Protected)

```javascript
// Frontend
async function updateAddress(token, addressId, updateData) {
  const response = await fetch(
    `http://localhost:4001/api/users/addresses/${addressId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        city: "Pokhara",
        street: "456 New Avenue",
      }),
    }
  );

  return response.json();
}

// Backend
exports.updateAddress = catchAsync(async (req, res, next) => {
  const address = await Address.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!address) {
    return next(new AppError("Address not found", 404));
  }

  return successResponse(res, 200, "Address updated", address);
});
```

#### 5.4 Delete Address (Delete)

**Endpoint:** `DELETE /api/users/addresses/:id` (Protected)

```javascript
// Frontend
async function deleteAddress(token, addressId) {
  const response = await fetch(
    `http://localhost:4001/api/users/addresses/${addressId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.json();
}

// Backend
exports.deleteAddress = catchAsync(async (req, res, next) => {
  // Soft delete
  const address = await Address.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );

  if (!address) {
    return next(new AppError("Address not found", 404));
  }

  return successResponse(res, 200, "Address deleted", address);
});
```

---

## 📡 API Integration Methods

### Method 1: Using Fetch API

```javascript
// GET request
const response = await fetch("http://localhost:4001/api/products", {
  method: "GET",
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
const data = await response.json();

// POST request
const response = await fetch("http://localhost:4001/api/cart/add", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({ productId, quantity }),
});
```

### Method 2: Using Axios

```javascript
// Setup instance
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:4001/api",
});

// Add token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Usage
const response = await api.get("/products");
const data = await api.post("/cart/add", { productId, quantity });
```

### Method 3: Using React Context + Fetch

```javascript
// api.js
export const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem("authToken");

  const response = await fetch(`http://localhost:4001/api${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
      ...options.headers,
    },
    ...options,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "API Error");
  }

  return data;
};

// Usage in component
import { apiCall } from "./api";

const products = await apiCall("/products?page=1&limit=12");
await apiCall("/cart/add", {
  method: "POST",
  body: JSON.stringify({ productId, quantity }),
});
```

### Method 4: Using Redux Thunks

```javascript
// store/slices/productSlice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async ({ page = 1, limit = 12 }, thunkAPI) => {
    const response = await fetch(
      `http://localhost:4001/api/products?page=${page}&limit=${limit}`
    );
    const data = await response.json();
    if (!data.success) {
      return thunkAPI.rejectWithValue(data.message);
    }
    return data.data;
  }
);

const productSlice = createSlice({
  name: "products",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.products;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default productSlice.reducer;

// Usage in component
const dispatch = useDispatch();
useEffect(() => {
  dispatch(fetchProducts({ page: 1, limit: 12 }));
}, [dispatch]);
```

---

## ⚠️ Error Handling

### Error Response Format

```json
{
  "success": false,
  "message": "Error description",
  "statusCode": 400,
  "errors": ["Detailed error 1", "Detailed error 2"]
}
```

### HTTP Status Codes

| Code    | Meaning      | Example                  |
| ------- | ------------ | ------------------------ |
| **200** | OK           | Request successful       |
| **201** | Created      | Resource created         |
| **400** | Bad Request  | Invalid input            |
| **401** | Unauthorized | Missing/invalid token    |
| **403** | Forbidden    | Insufficient permissions |
| **404** | Not Found    | Resource not found       |
| **500** | Server Error | Internal error           |

### Error Handling in Frontend

```javascript
try {
  const response = await fetch("http://localhost:4001/api/products");
  const data = await response.json();

  if (!data.success) {
    console.error("Error:", data.message);
    showErrorToast(data.message);
  } else {
  }
} catch (error) {
  console.error("Network error:", error);
  showErrorToast("Network error. Please try again.");
}
```

---

## 🔒 Security Features

### 1. JWT Authentication

- Access tokens (7 days)
- Refresh tokens (30 days)
- Role-based access control

### 2. Password Security

- Bcrypt hashing (salt rounds: 10)
- Minimum 8 characters
- Special characters required

### 3. Input Validation

- Server-side validation
- Mongoose schema validation
- Express-validator

### 4. Rate Limiting

- 100 requests per 15 minutes
- Prevents brute force attacks
- DDoS protection

### 5. XSS Protection

- Input sanitization
- HTML escaping
- Helmet.js middleware

### 6. CORS Configuration

```javascript
const corsOptions = {
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
```

---

## 🚀 Deployment

### Production Environment

```bash
# Set environment
export NODE_ENV=production

# Use process manager
npm install -g pm2

# Start app
pm2 start server.js --name "jumlaya-api"

# Setup auto-restart
pm2 startup
pm2 save
```

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 4001
CMD ["npm", "start"]
```

### MongoDB Atlas Connection

```env
DB_CONNECT=mongodb+srv://username:password@cluster.mongodb.net/jumlaya_prod
```

---

## 📝 Summary

This comprehensive backend provides:

✅ **15 Controllers** - Complete business logic  
✅ **9 Models** - Database schemas  
✅ **14 Routes** - API endpoints  
✅ **9 Middlewares** - Request processing  
✅ **8 Services** - Reusable logic  
✅ **CRUD Operations** - Full create, read, update, delete  
✅ **Authentication** - JWT-based security  
✅ **File Uploads** - Cloudinary integration  
✅ **Payment Processing** - eSewa integration  
✅ **Background Jobs** - Automated tasks  
✅ **Error Handling** - Comprehensive error responses  
✅ **Validation** - Input & business logic validation

**Ready for production deployment!** 🚀

---

**Backend Version:** 2.0  
**Last Updated:** December 17, 2025  
**Maintained By:** JUMLAYA Dev Team
