// ============================================
// 🔍 DIAGNOSTIC VERSION - Find the Issue
// Path: Backend/controllers/admin/admin.dashboard.controller.js
// ============================================

const Order = require('../../models/order.model');
const Product = require('../../models/product.model');
const User = require('../../models/user.model');
const catchAsync = require('../../utils/catchAsync');
const { successResponse } = require('../../utils/response');

// Get dashboard statistics
exports.getStats = catchAsync(async (req, res, next) => {
  console.log('');
  console.log('═══════════════════════════════════════════');
  console.log('🔍 DIAGNOSTIC: getStats function called');
  console.log('═══════════════════════════════════════════');
  
  const now = new Date();
  const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  // ============================================
  // STEP 1: Check what roles exist in database
  // ============================================
  console.log('\n📋 STEP 1: Checking User Roles in Database');
  const allUsers = await User.find({}).select('email role').limit(10).lean();
  console.log('All users in DB:', allUsers);
  
  const roleGroups = await User.aggregate([
    { $group: { _id: '$role', count: { $sum: 1 } } }
  ]);
  console.log('Users by role:', roleGroups);

  // ============================================
  // STEP 2: Try different queries
  // ============================================
  console.log('\n📋 STEP 2: Testing Different Queries');
  
  const countUser = await User.countDocuments({ role: 'user' });
  console.log('Count with role="user":', countUser);
  
  const countCustomer = await User.countDocuments({ role: 'customer' });
  console.log('Count with role="customer":', countCustomer);
  
  const countUserCapital = await User.countDocuments({ role: 'User' });
  console.log('Count with role="User":', countUserCapital);
  
  const totalUsers = await User.countDocuments({});
  console.log('Total users (all roles):', totalUsers);

  // ============================================
  // STEP 3: Get all stats
  // ============================================
  console.log('\n📋 STEP 3: Fetching All Stats');
  
  const [
    totalRevenue,
    totalOrders,
    totalProducts,
    totalCustomers,
    lastMonthRevenue,
    lastMonthOrders
  ] = await Promise.all([
    Order.aggregate([
      {
        $match: {
          createdAt: { $gte: firstDayThisMonth },
          orderStatus: { $ne: 'Cancelled' },
          $or: [
            { paymentMethod: { $in: ['eSewa', 'Khalti'] }, paymentStatus: 'Paid' },
            { paymentMethod: 'COD', orderStatus: 'Delivered' },
            { paymentMethod: 'Card', paymentStatus: 'Paid' }
          ]
        }
      },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]),
    Order.countDocuments({ createdAt: { $gte: firstDayThisMonth } }),
    Product.countDocuments({ isActive: true }),
    User.countDocuments({ role: 'user' }), // Change this if needed based on Step 1
    Order.aggregate([
      {
        $match: {
          createdAt: { $gte: firstDayLastMonth, $lte: lastDayLastMonth },
          orderStatus: { $ne: 'Cancelled' },
          $or: [
            { paymentMethod: { $in: ['eSewa', 'Khalti'] }, paymentStatus: 'Paid' },
            { paymentMethod: 'COD', orderStatus: 'Delivered' },
            { paymentMethod: 'Card', paymentStatus: 'Paid' }
          ]
        }
      },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]),
    Order.countDocuments({
      createdAt: { $gte: firstDayLastMonth, $lte: lastDayLastMonth }
    })
  ]);

  console.log('\n📊 Raw Query Results:');
  console.log('  totalRevenue:', totalRevenue);
  console.log('  totalOrders:', totalOrders);
  console.log('  totalProducts:', totalProducts);
  console.log('  totalCustomers:', totalCustomers);
  console.log('  totalCustomers type:', typeof totalCustomers);

  // ============================================
  // STEP 4: Build stats object
  // ============================================
  const currentRevenue = totalRevenue[0]?.total || 0;
  const prevRevenue = lastMonthRevenue[0]?.total || 0;
  const revenueGrowth = prevRevenue > 0 
    ? Math.round(((currentRevenue - prevRevenue) / prevRevenue) * 100)
    : 0;

  const orderGrowth = lastMonthOrders > 0
    ? Math.round(((totalOrders - lastMonthOrders) / lastMonthOrders) * 100)
    : 0;

  // Use the count that's not zero
  const finalCustomerCount = totalCustomers || countCustomer || countUser || totalUsers;

  const stats = {
    totalRevenue: currentRevenue,
    totalOrders,
    totalProducts,
    totalCustomers: finalCustomerCount, // ✅ Use calculated value
    revenueGrowth,
    orderGrowth,
    _debug_timestamp: Date.now(), // Force cache break
    _debug_customerQueries: {
      byRoleUser: countUser,
      byRoleCustomer: countCustomer,
      allUsers: totalUsers,
      finalUsed: finalCustomerCount
    }
  };

  console.log('\n✅ Final Stats Object:');
  console.log(JSON.stringify(stats, null, 2));
  console.log('\n👥 Total Customers Value:', stats.totalCustomers);
  console.log('═══════════════════════════════════════════\n');

  return successResponse(res, { stats }, 'Dashboard stats retrieved');
});

// Get recent orders
exports.getRecentOrders = catchAsync(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 5;
  const orders = await Order.find()
    .populate('user', 'firstname lastname email')
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('orderId user totalPrice orderStatus paymentStatus createdAt')
    .lean();
  return successResponse(res, { orders }, 'Recent orders retrieved');
});

// Get top selling products
exports.getTopProducts = catchAsync(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 5;
  const products = await Product.find({ isActive: true })
    .sort({ soldCount: -1 })
    .limit(limit)
    .select('name price images soldCount stock')
    .lean();
  return successResponse(res, { products }, 'Top products retrieved');
});

// Get low stock products
exports.getLowStockProducts = catchAsync(async (req, res, next) => {
  const threshold = parseInt(req.query.threshold) || 10;
  const limit = parseInt(req.query.limit) || 10;
  const products = await Product.find({
    isActive: true,
    stock: { $lte: threshold, $gt: 0 }
  })
    .sort({ stock: 1 })
    .limit(limit)
    .select('name price images stock')
    .lean();
  return successResponse(res, { products }, 'Low stock products retrieved');
});

// Get sales chart data
exports.getSalesChart = catchAsync(async (req, res, next) => {
  const { period = 'week' } = req.query;
  let startDate;
  const now = new Date();
  
  switch(period) {
    case 'week':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }

  const salesData = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate },
        orderStatus: { $ne: 'Cancelled' }
      }
    },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        revenue: { $sum: '$totalPrice' },
        orders: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  return successResponse(res, { salesData }, 'Sales chart data retrieved');
});