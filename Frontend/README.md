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


