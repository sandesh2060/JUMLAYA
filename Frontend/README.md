Folder structure : JUMLAYA 

-----------------------------------------------------------------------------------------------------------

JUMLAYA-OFFICIAL/
├── 📂 Backend/
│   ├── 📂 config/
│   │   ├── 📄 cloudinary.js
│   │   └── 📄 db.js
│   │
│   ├── 📂 controllers/
│   │   ├── 📂 admin/
│   │   │   ├── 📄 admin.dashboard.controller.js
│   │   │   ├── 📄 admin.order.controller.js
│   │   │   ├── 📄 admin.product.controller.js
│   │   │   ├── 📄 admin.rider.controller.js
│   │   │   ├── 📄 admin.settings.controller.js
│   │   │   └── 📄 admin.user.controller.js
│   │   │
│   │   ├── 📂 rider/ 
│   │   │   ├── 📄 rider.controller.js
│   │   │   ├── 📄 rider.notification.controller.js
│   │   │   └── 📄 rider.order.controller.js
│   │   │
│   │   ├── 📄 address.controller.js
│   │   ├── 📄 auditLog.controller.js
│   │   ├── 📄 cart.controller.js
│   │   ├── 📄 category.controller.js
│   │   ├── 📄 coupon.controller.js
│   │   ├── 📄 esewa.controller.js
│   │   ├── 📄 notification.controller.js
│   │   ├── 📄 order.controller.js
│   │   ├── 📄 otp.controller.js
│   │   ├── 📄 password.controller.js
│   │   ├── 📄 payment.controller.js
│   │   ├── 📄 product.controller.js
│   │   ├── 📄 publicSettings.controller.js
│   │   ├── 📄 review.controller.js
│   │   ├── 📄 user.controller.js
│   │   └── 📄 wishlist.controller.js
│   │
│   ├── 📂 jobs/
│   │   ├── 📄 cleanupExpiredCarts.js
│   │   ├── 📄 scheduler.js
│   │   ├── 📄 sendAbandonedCartEmails.js
│   │   └── 📄 updateInventory.js
│   │
│   ├── 📂 middlewares/
│   │   ├── 📄 auditLogger.middleware.js
│   │   ├── 📄 auth.middleware.js
│   │   ├── 📄 authorize.middleware.js
│   │   ├── 📄 cors.middleware.js
│   │   ├── 📄 error.middleware.js
│   │   ├── 📄 logger.middleware.js
│   │   ├── 📄 rateLimit.middleware.js
│   │   ├── 📄 rider.middleware.js
│   │   ├── 📄 sanitize.js
│   │   ├── 📄 upload.middleware.js
│   │   └── 📄 validate.middleware.js
│   │
│   ├── 📂 models/
│   │   ├── 📄 address.model.js
│   │   ├── 📄 ads.model.js
│   │   ├── 📄 auditLog.model.js
│   │   ├── 📄 cart.model.js
│   │   ├── 📄 category.model.js
│   │   ├── 📄 ContactForm.model.js
│   │   ├── 📄 coupon.model.js
│   │   ├── 📄 notification.model.js
│   │   ├── 📄 order.model.js
│   │   ├── 📄 product.model.js
│   │   ├── 📄 review.model.js
│   │   ├── 📄 rider.model.js
│   │   ├── 📄 settings.model.js
│   │   ├── 📄 user.model.js
│   │   └── 📄 wishlist.model.js
│   │
│   ├── 📂 routes/
│   │   ├── 📄 address.routes.js
│   │   ├── 📄 admin.dashboard.routes.js
│   │   ├── 📄 admin.order.routes.js
│   │   ├── 📄 admin.product.routes.js
│   │   ├── 📄 admin.rider.routes.js
│   │   ├── 📄 admin.settings.routes.js
│   │   ├── 📄 admin.user.routes.js
│   │   ├── 📄 ads.routes.js
│   │   ├── 📄 auditLog.routes.js
│   │   ├── 📄 cart.routes.js
│   │   ├── 📄 category.routes.js
│   │   ├── 📄 contact.routes.js
│   │   ├── 📄 coupon.routes.js
│   │   ├── 📄 esewa.routes.js
│   │   ├── 📄 notification.routes.js
│   │   ├── 📄 order.routes.js
│   │   ├── 📄 otp.routes.js
│   │   ├── 📄 password.routes.js
│   │   ├── 📄 payment.routes.js
│   │   ├── 📄 product.review.routes.js
│   │   ├── 📄 product.routes.js
│   │   ├── 📄 publicSettings.routes.js
│   │   ├── 📄 review.routes.js
│   │   ├── 📄 rider.notification.routes.js
│   │   ├── 📄 rider.order.routes.js
│   │   ├── 📄 rider.routes.js
│   │   ├── 📄 settings.routes.js
│   │   ├── 📄 user.routes.js
│   │   └── 📄 wishlist.routes.js
│   │
│   ├── 📂 scripts/
│   │   ├── 📄 checkOrders.js
│   │   ├── 📄 createRiderProfile.js
│   │   └── 📄 seedProducts.js
│   │
│   ├── 📂 services/
│   │   ├── 📄 cart.service.js
│   │   ├── 📄 coupon.service.js
│   │   ├── 📄 email.service.js
│   │   ├── 📄 inventory.service.js
│   │   ├── 📄 notification.service.js
│   │   ├── 📄 order.service.js
│   │   ├── 📄 payment.service.js
│   │   ├── 📄 product.service.js
│   │   ├── 📄 rider.service.js
│   │   ├── 📄 user.service.js
│   │   └── 📄 websocket.service.js
│   │
│   ├── 📂 tests/
│   │   ├── 📄 cart.test.js
│   │   ├── 📄 order.test.js
│   │   ├── 📄 product.test.js
│   │   └── 📄 user.test.js
│   │
│   ├── 📂 uploads/
│   │   ├── 📂 avatars/
│   │   ├── 📂 categories/
│   │   ├── 📂 logos/
│   │   ├── 📂 products/
│   │   └── 📂 users/
│   │
│   ├── 📂 utils/
│   │   ├── 📄 apiFeatures.js
│   │   ├── 📄 AppError.js
│   │   ├── 📄 catchAsync.js
│   │   ├── 📄 generateOrderId.js
│   │   ├── 📄 geolocationService.js
│   │   ├── 📄 helpers.js
│   │   ├── 📄 imageHelpers.js
│   │   ├── 📄 invoiceGenerator.js
│   │   ├── 📄 invoiceGeneratorAdvanced.js
│   │   ├── 📄 notificationHelper.js
│   │   ├── 📄 paymentProviders.js
│   │   ├── 📄 priceCalculator.js
│   │   ├── 📄 response.js
│   │   ├── 📄 riderNotificationHelper.js
│   │   ├── 📄 security.utils.js
│   │   ├── 📄 sendEmail.js
│   │   ├── 📄 slugify.js
│   │   └── 📄 socketManager.js
│   │
│   ├── 📂 validators/
│   │   ├── 📄 address.validator.js
│   │   ├── 📄 cart.validator.js
│   │   ├── 📄 order.validator.js
│   │   ├── 📄 password.validator.js
│   │   ├── 📄 product.validator.js
│   │   ├── 📄 review.validator.js
│   │   └── 📄 user.validator.js
│   │
│   ├── 📄 .env
│   ├── 📄 .env.example
│   ├── 📄 .gitignore
│   ├── 📄 app.js
│   ├── 📄 package-lock.json
│   ├── 📄 package.json
│   └── 📄 server.js
│
├── 📂 Frontend/
│   ├── 📂 .vscode/
│   ├── 📂 dist/
│   │   ├── 📂 assets/
│   │   └── 📄 index.html
│   │
│   ├── 📂 node_modules/
│   │
│   ├── 📂 public/
│   │   ├── 📂 images/
│   │   ├── 📂 locales/
│   │   └── 📄 vite.svg
│   │
│   ├── 📂 src/
│   │   ├── 📂 admin/
│   │   │   ├── 📂 api/
│   │   │   │   ├── 📄 axios.config.js
│   │   │   │   ├── 📄 notification.api.js
│   │   │   │   ├── 📄 order.api.js
│   │   │   │   └── 📄 settings.api.js
│   │   │   │
│   │   │   ├── 📂 components/
│   │   │   │   ├── 📂 common/
│   │   │   │   │   └── 📄 DeleteConfirmDialog.jsx
│   │   │   │   │
│   │   │   │   ├── 📂 layout/
│   │   │   │   │   ├── 📄 AdminLayout.jsx
│   │   │   │   │   └── 📄 Sidebar.jsx
│   │   │   │   │
│   │   │   │   ├── 📂 notifications/
│   │   │   │   │   ├── 📄 AdminNotificationBell.jsx
│   │   │   │   │   ├── 📄 AdminNotificationDropdown.jsx
│   │   │   │   │   ├── 📄 AdminNotificationItem.jsx
│   │   │   │   │   └── 📄 AdminNotificationList.jsx
│   │   │   │   │
│   │   │   │   ├── 📂 orders/
│   │   │   │   │   └── 📄 OrderDetailModal.jsx
│   │   │   │   │
│   │   │   │   └── 📂 users/
│   │   │   │       └── 📄 RiderApprovalCard.jsx
│   │   │   │
│   │   │   ├── 📂 context/
│   │   │   │   └── 📄 NotificationContext.jsx
│   │   │   │
│   │   │   ├── 📂 hooks/
│   │   │   │   └── 📄 useNotification.js
│   │   │   │
│   │   │   └── 📂 pages/
│   │   │       ├── 📄 AdminCustomers.jsx
│   │   │       ├── 📄 AdminDashboard.jsx
│   │   │       ├── 📄 AdminNotifications.jsx
│   │   │       ├── 📄 AdminOrders.jsx
│   │   │       ├── 📄 AdminProductDetail.jsx
│   │   │       ├── 📄 AdminProductForm.jsx
│   │   │       ├── 📄 AdminProducts.jsx
│   │   │       ├── 📄 AdminSettings.jsx
│   │   │       ├── 📄 AuditLogViewer.jsx
│   │   │       ├── 📄 CustomerDetail.jsx
│   │   │       ├── 📄 OrderDetail.jsx
│   │   │       └── 📄 RiderManagement.jsx
│   │   │
│   │   ├── 📂 api/
│   │   │   ├── 📄 address.api.js
│   │   │   ├── 📄 admin.rider.api.js
│   │   │   ├── 📄 auditLog.api.js
│   │   │   ├── 📄 auth.api.js
│   │   │   ├── 📄 axios.config.js
│   │   │   ├── 📄 cart.api.js
│   │   │   ├── 📄 category.api.js
│   │   │   ├── 📄 contact.api.js
│   │   │   ├── 📄 coupon.api.js
│   │   │   ├── 📄 notification.api.js
│   │   │   ├── 📄 order.api.js
│   │   │   ├── 📄 password.api.js
│   │   │   ├── 📄 payment.api.js
│   │   │   ├── 📄 product.api.js
│   │   │   ├── 📄 publicSettings.api.js
│   │   │   ├── 📄 review.api.js
│   │   │   ├── 📄 rider.api.js
│   │   │   ├── 📄 user.api.js
│   │   │   └── 📄 wishlist.api.js
│   │   │
│   │   ├── 📂 assets/
│   │   │   ├── 📄 bipashgiri.jpg
│   │   │   ├── 📄 invoice-694b6a08fcc55ea75c9dd264.pdf
│   │   │   ├── 📄 invoice-694cdd77918d460bd5d83271.pdf
│   │   │   ├── 📄 logo.png
│   │   │   ├── 📄 manojbhandari.jpg
│   │   │   ├── 📄 react.svg
│   │   │   └── 📄 sandashasharma.jpg
│   │   │
│   │   ├── 📂 components/
│   │   │   ├── 📂 auth/
│   │   │   │   ├── 📄 LoginForm.jsx
│   │   │   │   ├── 📄 OTPVerification.jsx
│   │   │   │   └── 📄 RegisterForm.jsx
│   │   │   │
│   │   │   ├── 📂 cart/
│   │   │   │   ├── 📄 CartItem.jsx
│   │   │   │   ├── 📄 CartsSummary.jsx
│   │   │   │   └── 📄 EmptyCart.jsx
│   │   │   │
│   │   │   ├── 📂 common/
│   │   │   │   ├── 📄 Badge.jsx
│   │   │   │   ├── 📄 Button.jsx
│   │   │   │   ├── 📄 Card.jsx
│   │   │   │   ├── 📄 ErrorMessage.jsx
│   │   │   │   ├── 📄 Input.jsx
│   │   │   │   ├── 📄 LanguageToggle.jsx
│   │   │   │   ├── 📄 LoadingSpinner.jsx
│   │   │   │   ├── 📄 Modal.jsx
│   │   │   │   ├── 📄 NotificationPanel.jsx
│   │   │   │   ├── 📄 Pagination.jsx
│   │   │   │   ├── 📄 Rating.jsx
│   │   │   │   └── 📄 ThemeToggle.jsx
│   │   │   │
│   │   │   ├── 📂 layout/
│   │   │   │   ├── 📄 Breadcrumb.jsx
│   │   │   │   ├── 📄 Footer.jsx
│   │   │   │   ├── 📄 Navbar.jsx
│   │   │   │   └── 📄 Sidebar.jsx
│   │   │   │
│   │   │   ├── 📂 map/
│   │   │   │   ├── 📄 DeliveryAreaSelector.jsx
│   │   │   │   ├── 📄 LocationPicker.jsx
│   │   │   │   ├── 📄 LocationSearch.jsx
│   │   │   │   ├── 📄 MapPicker.jsx
│   │   │   │   ├── 📄 MapView.jsx
│   │   │   │   └── 📄 OrderTrackingMap.jsx
│   │   │   │
│   │   │   ├── 📂 notifications/
│   │   │   │   ├── 📄 NotificationBell.jsx
│   │   │   │   ├── 📄 NotificationDropdown.jsx
│   │   │   │   ├── 📄 NotificationItem.jsx
│   │   │   │   └── 📄 NotificationList.jsx
│   │   │   │
│   │   │   ├── 📂 orders/
│   │   │   │   ├── 📄 OrderCard.jsx
│   │   │   │   ├── 📄 OrderDetails.jsx
│   │   │   │   └── 📄 OrderTimeline.jsx
│   │   │   │
│   │   │   └── 📂 product/
│   │   │       ├── 📄 ProductCard.jsx
│   │   │       ├── 📄 ProductFilters.jsx
│   │   │       ├── 📄 ProductGrid.jsx
│   │   │       ├── 📄 ProductImageGallery.jsx
│   │   │       ├── 📄 ProductQuickView.jsx
│   │   │       ├── 📄 ReviewForm.jsx
│   │   │       ├── 📄 ReviewItem.jsx
│   │   │       └── 📄 ReviewList.jsx
│   │   │
│   │   ├── 📂 config/
│   │   │   └── 📄 api.js
│   │   │
│   │   ├── 📂 context/
│   │   │   ├── 📄 AuthContext.jsx
│   │   │   ├── 📄 CartContext.jsx
│   │   │   ├── 📄 LanguageContext.jsx
│   │   │   ├── 📄 NotificationContext.jsx
│   │   │   ├── 📄 SecurityProvider.jsx
│   │   │   ├── 📄 StoreContext.jsx
│   │   │   ├── 📄 ThemeContext.jsx
│   │   │   └── 📄 WishlistContext.jsx
│   │   │
│   │   ├── 📂 hooks/
│   │   │   ├── 📄 useAuditLogger.js
│   │   │   ├── 📄 useAuth.js
│   │   │   ├── 📄 useCart.js
│   │   │   ├── 📄 useDebounce.js
│   │   │   ├── 📄 useLanguage.js
│   │   │   ├── 📄 useLocalStorage.js
│   │   │   ├── 📄 useNotification.js
│   │   │   ├── 📄 usePagination.js
│   │   │   ├── 📄 useRealTimeNotifications.js
│   │   │   ├── 📄 useTheme.js
│   │   │   ├── 📄 useWebSocket.js
│   │   │   └── 📄 useWishlist.js
│   │   │
│   │   ├── 📂 lib/
│   │   │   └── 📄 utils.js
│   │   │
│   │   ├── 📂 pages/
│   │   │   ├── 📄 About.jsx
│   │   │   ├── 📄 Cart.jsx
│   │   │   ├── 📄 Checkout.jsx
│   │   │   ├── 📄 Contact.jsx
│   │   │   ├── 📄 ForgotPassword.jsx
│   │   │   ├── 📄 Home.jsx
│   │   │   ├── 📄 Login.jsx
│   │   │   ├── 📄 NotFound.jsx
│   │   │   ├── 📄 Notifications.jsx
│   │   │   ├── 📄 OrderDetailsPage.jsx
│   │   │   ├── 📄 Orders.jsx
│   │   │   ├── 📄 OrderSuccess.jsx
│   │   │   ├── 📄 ProductDetails.jsx
│   │   │   ├── 📄 Products.jsx
│   │   │   ├── 📄 Profile.jsx
│   │   │   ├── 📄 ProfileSettings.jsx
│   │   │   ├── 📄 Register.jsx
│   │   │   ├── 📄 ResetPassword.jsx
│   │   │   └── 📄 Wishlist.jsx
│   │   │
│   │   ├── 📂 rider/
│   │   │   ├── 📂 components/
│   │   │   │   ├── 📂 notifications/
│   │   │   │   │   ├── 📄 DeliveryNotificationCard.jsx
│   │   │   │   │   ├── 📄 OrderNotificationCard.jsx
│   │   │   │   │   ├── 📄 RiderNotificationBell.jsx
│   │   │   │   │   └── 📄 RiderNotificationList.jsx
│   │   │   │   │
│   │   │   │   ├── 📄 NavigationMap.jsx
│   │   │   │   ├── 📄 OrderCard.jsx
│   │   │   │   ├── 📄 RiderLayout.jsx
│   │   │   │   └── 📄 StatusToggle.jsx
│   │   │   │
│   │   │   ├── 📂 pages/
│   │   │   │   ├── 📄 RiderDashboard.jsx
│   │   │   │   ├── 📄 RiderEarnings.jsx
│   │   │   │   ├── 📄 RiderNavigation.jsx
│   │   │   │   ├── 📄 RiderNotifications.jsx
│   │   │   │   ├── 📄 RiderOrderDetails.jsx
│   │   │   │   ├── 📄 RiderOrders.jsx
│   │   │   │   └── 📄 RiderProfile.jsx
│   │   │   │
│   │   │   └── 📂 utils/
│   │   │       └── 📄 dataUtils.js
│   │   │
│   │   ├── 📂 routes/
│   │   │   ├── 📄 AdminRoute.jsx
│   │   │   ├── 📄 AdminRouteGuard.jsx
│   │   │   ├── 📄 AppRoutes.jsx
│   │   │   ├── 📄 ProtectedRoute.jsx
│   │   │   ├── 📄 PublicRoute.jsx
│   │   │   └── 📄 RiderRoute.jsx
│   │   │
│   │   ├── 📂 styles/
│   │   │   └── 📄 cn.js
│   │   │
│   │   ├── 📂 utils/
│   │   │   ├── 📄 constants.js
│   │   │   ├── 📄 formatters.js
│   │   │   ├── 📄 geolocationService.js
│   │   │   ├── 📄 helpers.js
│   │   │   ├── 📄 imageHelpers.js
│   │   │   ├── 📄 notificationSounds.js
│   │   │   ├── 📄 notificationUtils.js
│   │   │   ├── 📄 socketClient.js
│   │   │   ├── 📄 storage.js
│   │   │   └── 📄 validators.js
│   │   │
│   │   ├── 📄 App.css
│   │   ├── 📄 App.jsx
│   │   ├── 📄 i18n.js
│   │   ├── 📄 index.css
│   │   └── 📄 main.jsx
│   │
│   ├── 📄 .env
│   ├── 📄 .env.example
│   ├── 📄 .gitignore
│   ├── 📄 components.json
│   ├── 📄 eslint.config.js
│   ├── 📄 index.html
│   ├── 📄 jsconfig.json
│   ├── 📄 package-lock.json
│   ├── 📄 package.json
│   ├── 📄 postcss.config.js
│   ├── 📄 README.md
│   ├── 📄 tailwind.config.js
│   └── 📄 vite.config.js
│
├── 📄 .gitignore
├── 📄 FOLDER_STRUCTURE.md
├── 📄 INTEGRATION_GUIDE.md
├── 📄 package-lock.json
└── 📄 README.md


-----------------------------------------------------------------------------------------------------------



# 🚀 Live Location Setup - Complete Guide

## What Happens When Rider Accepts an Order

1. **Rider accepts order** → Order status changes to `confirmed` or `preparing`
2. **Rider goes to Navigation page** → System automatically detects active order
3. **Map loads** → Shows route from rider's location to pickup/delivery
4. **Rider clicks "Start Navigation"** → Real-time GPS tracking begins
5. **Location updates every 5 seconds** → Sent to server & broadcast to customer
6. **Rider arrives** → Confirms arrival → Order proceeds to next step

---

## 📦 STEP 1: Backend Setup (20 minutes)

### 1.1 Environment Variables
Add to `Backend/.env`:
```bash
ROUTING_PROVIDER=osrm
SOCKET_PORT=4001
LOCATION_UPDATE_INTERVAL=5000
MAX_LOCATION_HISTORY=50
ARRIVAL_THRESHOLD_METERS=100
```

### 1.2 Update Rider Model
**File:** `Backend/models/rider.model.js`

Use the **"Updated Rider Model with Live Location"** artifact (already provided earlier).

### 1.3 Create Location Controller
**File:** `Backend/controllers/rider/rider.location.controller.js` (NEW)

Copy from **"Backend: Location Controller"** artifact.

### 1.4 Create OR Update Rider Order Controller
**File:** `Backend/controllers/rider/rider.order.controller.js`

```javascript
// If file exists, ADD these functions
// If file doesn't exist, create it with:

const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/AppError');
const Order = require('../../models/order.model');
const Rider = require('../../models/rider.model');

/**
 * Get rider's active orders
 */
exports.getActiveOrders = catchAsync(async (req, res, next) => {
  const riderId = req.user._id;

  const rider = await Rider.findOne({ user: riderId });
  
  if (!rider) {
    return next(new AppError('Rider profile not found', 404));
  }

  const activeOrders = await Order.find({
    rider: rider._id,
    status: { $in: ['confirmed', 'preparing', 'picked_up', 'out_for_delivery'] }
  })
  .populate('user', 'firstname lastname phone')
  .populate('restaurant', 'name location')
  .populate('deliveryAddress')
  .sort({ createdAt: -1 })
  .limit(5);

  res.status(200).json({
    status: 'success',
    results: activeOrders.length,
    data: activeOrders
  });
});

/**
 * Get specific order details
 */
exports.getOrderDetails = catchAsync(async (req, res, next) => {
  const { orderId } = req.params;
  const riderId = req.user._id;

  const rider = await Rider.findOne({ user: riderId });
  
  if (!rider) {
    return next(new AppError('Rider profile not found', 404));
  }

  const order = await Order.findOne({
    _id: orderId,
    rider: rider._id
  })
  .populate('user', 'firstname lastname phone avatar')
  .populate('restaurant', 'name phone location address')
  .populate('deliveryAddress')
  .populate('items.product', 'name price images');

  if (!order) {
    return next(new AppError('Order not found or access denied', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { order }
  });
});
```

### 1.5 Create Routing Service
**File:** `Backend/services/routing.service.js` (NEW)

Copy from **"Backend: Routing Service with Multiple Providers"** artifact.

### 1.6 Create Location Validator
**File:** `Backend/validators/location.validator.js` (NEW)

Copy from **"Backend: Location Validator"** artifact.

### 1.7 Create/Update Routes

**File:** `Backend/routes/rider.location.routes.js` (NEW)
Copy from **"Backend: Rider Location Routes"** artifact.

**File:** `Backend/routes/rider.order.routes.js` (NEW or UPDATE)
```javascript
const express = require('express');
const router = express.Router();
const riderOrderController = require('../controllers/rider/rider.order.controller');
const { protect } = require('../middlewares/auth.middleware');
const { restrictTo } = require('../middlewares/authorize.middleware');

router.use(protect);
router.use(restrictTo('rider'));

// Add these routes
router.get('/active', riderOrderController.getActiveOrders);
router.get('/:orderId', riderOrderController.getOrderDetails);

module.exports = router;
```

### 1.8 Register Routes in app.js
**File:** `Backend/app.js`

Add these lines:
```javascript
const riderLocationRoutes = require('./routes/rider.location.routes');
const riderOrderRoutes = require('./routes/rider.order.routes');

// Register routes
app.use('/api/rider/location', riderLocationRoutes);
app.use('/api/rider/orders', riderOrderRoutes);
```

### 1.9 Update Geolocation Service
**File:** `Backend/utils/geolocationService.js`

Add these functions:
```javascript
const routingService = require('../services/routing.service');

exports.getOptimalRoute = async (origin, destination) => {
  return await routingService.getRoute(origin, destination);
};

exports.calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const toRad = (deg) => deg * (Math.PI / 180);
```

### 1.10 Update WebSocket Service
**File:** `Backend/services/websocket.service.js`

Add these functions:
```javascript
const broadcastRiderLocation = async (data) => {
  const { riderId, orderId, location, heading, speed, timestamp } = data;
  io.to(`order:${orderId}`).emit('rider:location:update', {
    riderId, orderId, location, heading, speed, timestamp
  });
};

const notifyRiderProximity = async (orderId, distance) => {
  io.to(`order:${orderId}`).emit('rider:proximity', {
    distance,
    message: distance < 0.5 ? 'Rider is arriving soon!' : `Rider is ${distance.toFixed(1)} km away`,
    timestamp: new Date()
  });
};

// Export
module.exports = {
  // ... existing exports ...
  broadcastRiderLocation,
  notifyRiderProximity
};
```

### 1.11 Update Order Model
**File:** `Backend/models/order.model.js`

Add this to your schema:
```javascript
tracking: {
  lastUpdate: Date,
  currentDistance: Number,
  pickupArrivalTime: Date,
  deliveryArrivalTime: Date,
  pickupLocation: {
    type: { type: String, enum: ['Point'] },
    coordinates: [Number]
  },
  deliveryLocation: {
    type: { type: String, enum: ['Point'] },
    coordinates: [Number]
  }
}
```

---

## 🎨 STEP 2: Frontend Setup (30 minutes)

### 2.1 Install Dependencies
```bash
cd Frontend
npm install react-leaflet leaflet socket.io-client
```

### 2.2 Add Leaflet CSS
**File:** `Frontend/index.html`

Add in `<head>` section:
```html
<link 
  rel="stylesheet" 
  href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
  integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
  crossorigin=""
/>
```

### 2.3 Create Environment Files

**File:** `Frontend/.env`
```bash
VITE_API_URL=http://localhost:4001/api
VITE_SOCKET_URL=http://localhost:4001
VITE_DEFAULT_LAT=27.7172
VITE_DEFAULT_LNG=85.3240
VITE_ENABLE_LIVE_TRACKING=true
VITE_MAP_PROVIDER=openstreetmap
```

### 2.4 Create Location API Client
**File:** `Frontend/src/api/rider.location.api.js` (NEW)

```javascript
import axios from './axios.config';

const BASE_URL = '/rider/location';

export const riderLocationApi = {
  updateLocation: async (locationData) => {
    const response = await axios.post(`${BASE_URL}/update`, locationData);
    return response.data;
  },

  getRoute: async (orderId) => {
    const response = await axios.get(`${BASE_URL}/route/${orderId}`);
    return response.data;
  },

  markArrival: async (arrivalData) => {
    const response = await axios.post(`${BASE_URL}/arrival`, arrivalData);
    return response.data;
  },

  toggleStatus: async (isOnline) => {
    const response = await axios.patch(`${BASE_URL}/status`, { isOnline });
    return response.data;
  },
};

export default riderLocationApi;
```

### 2.5 Update Rider API
**File:** `Frontend/src/api/rider.api.js`

Add these methods:
```javascript
import riderLocationApi from './rider.location.api';

export const riderApi = {
  // ... existing methods ...
  
  // Location methods
  updateLocation: riderLocationApi.updateLocation,
  getRoute: riderLocationApi.getRoute,
  markArrival: riderLocationApi.markArrival,
  toggleStatus: riderLocationApi.toggleStatus,
  
  // Order methods
  getActiveOrders: async () => {
    const response = await axios.get('/rider/orders/active');
    return response.data;
  },
  
  getOrderDetails: async (orderId) => {
    const response = await axios.get(`/rider/orders/${orderId}`);
    return response.data;
  },
};
```

### 2.6 Replace Navigation Page
**File:** `Frontend/src/rider/pages/RiderNavigation.jsx`

Replace your entire file with the **"RiderNavigation.jsx - Complete with Order Tracking"** artifact.

### 2.7 Create Navigation Component
**File:** `Frontend/src/rider/components/RiderNavigationEnhanced.jsx` (NEW)

Copy the **"RiderNavigationEnhanced.jsx - Full Implementation"** artifact.

### 2.8 Update Routes (if needed)
**File:** `Frontend/src/routes/AppRoutes.jsx`

Make sure you have this route:
```javascript
<Route 
  path="/rider/navigation" 
  element={
    <RiderRoute>
      <RiderNavigation />
    </RiderRoute>
  } 
/>
```

---

## ✅ STEP 3: Testing (15 minutes)

### 3.1 Start Servers
```bash
# Terminal 1 - Backend
cd Backend
npm start

# Terminal 2 - Frontend
cd Frontend
npm run dev
```

### 3.2 Test Flow

**1. Login as Rider**
- Go to login page
- Login with rider credentials

**2. Accept an Order**
- Go to `/rider/orders`
- Accept an available order
- Note the order ID

**3. Navigate**
- Click on "Navigation" in sidebar
- You should see the map load automatically
- Browser will ask for location permission → Click "Allow"

**4. Start Tracking**
- Click "Start Navigation"
- Map should show:
  - Your current location (blue marker with 🏍️)
  - Destination (red marker with 📍)
  - Blue line showing route
  - Distance and ETA at top

**5. Verify Updates**
- Walk around (or simulate movement)
- Location should update every 5 seconds
- Distance and ETA should recalculate

**6. Test Arrival**
- Get within 100 meters of destination
- "Confirm Arrival" button should appear
- Click it to mark arrival

### 3.3 Check Database
Open MongoDB Compass or Atlas:
```
riders collection → Find your rider → Should have:
- currentLocation.coordinates: [lng, lat]
- heading: number
- speed: number
- lastLocationUpdate: recent timestamp
- locationHistory: array of recent points
```

### 3.4 Test API Endpoints

**Get Active Orders:**
```bash
GET http://localhost:4001/api/rider/orders/active
Headers: { Authorization: "Bearer YOUR_RIDER_TOKEN" }
```

**Update Location:**
```bash
POST http://localhost:4001/api/rider/location/update
Headers: { 
  Authorization: "Bearer YOUR_RIDER_TOKEN",
  Content-Type: "application/json"
}
Body: {
  "latitude": 27.7172,
  "longitude": 85.3240,
  "heading": 45,
  "speed": 30
}
```

---

## 🐛 Troubleshooting

### Issue: "No active orders" even after accepting
**Solution:** Check that:
1. Order status is one of: `confirmed`, `preparing`, `picked_up`, `out_for_delivery`
2. Order has `rider` field set to your rider ID
3. Backend route `/api/rider/orders/active` is registered

### Issue: Map not loading
**Solution:**
1. Check Leaflet CSS is loaded (inspect page, look for leaflet styles)
2. Verify map container has height: check browser dev tools
3. Check console for errors

### Issue: "Geolocation not supported"
**Solution:**
1. Use HTTPS in production (required for geolocation)
2. In development, use `localhost` (not IP address)
3. Check browser settings allow location

### Issue: Location not updating
**Solution:**
1. Check browser console for errors
2. Verify location permission is granted
3. Check network tab - should see POST requests every 5 seconds to `/api/rider/location/update`
4. Check rider is authenticated (token is valid)

### Issue: Route not displaying
**Solution:**
1. Check `ROUTING_PROVIDER=osrm` in `.env`
2. Check internet connection (OSRM is hosted online)
3. Check browser console for API errors
4. Fallback: straight line will be drawn if routing fails

---

## 🚀 Production Deployment

### Backend Deployment
1. Set environment variables in hosting platform (Railway, Render, etc.)
2. Ensure MongoDB is accessible
3. Enable CORS for your frontend domain
4. Use HTTPS (required for geolocation)

### Frontend Deployment
1. Update `VITE_API_URL` in `.env.production`
2. Build: `npm run build`
3. Deploy dist folder to Vercel/Netlify
4. Ensure HTTPS is enabled

### Post-Deployment Checklist
- [ ] Test location permission in production
- [ ] Verify WebSocket connection works
- [ ] Test full order acceptance → navigation flow
- [ ] Monitor API usage (stay within OSRM limits)
- [ ] Consider upgrading to Mapbox for production (better UX)

---

## 📊 Feature Summary

✅ **Automatic Detection** - Navigation activates when order is accepted  
✅ **Real-time GPS** - Updates every 5 seconds  
✅ **Route Calculation** - Uses OSRM (free) or other providers  
✅ **Turn-by-turn** - Step-by-step directions  
✅ **Distance & ETA** - Live calculations  
✅ **Arrival Verification** - Geofencing (100m radius)  
✅ **Location History** - Last 50 points stored  
✅ **Customer Tracking** - WebSocket broadcasts (ready for customer view)  
✅ **Dark Mode** - Fully supported  
✅ **Mobile Optimized** - Works on smartphones  

---

## 🎯 Next Steps

After basic setup works:
1. Add customer-side tracking view
2. Implement multiple stops optimization
3. Add offline map caching
4. Integrate traffic data
5. Add voice navigation
6. Implement battery monitoring
7. Add rider performance analytics

---

## 📞 Support

If you encounter issues:
1. Check this guide's troubleshooting section
2. Review browser console for errors
3. Check backend logs
4. Verify all files are created/updated
5. Test API endpoints with Postman