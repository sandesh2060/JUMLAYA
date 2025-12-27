// ============================================
// admin.user.controller.js
// Path: Backend/controllers/admin/admin.user.controller.js
// ============================================
const User = require('../../models/user.model');
const Order = require('../../models/order.model');

// ============================================
// GET ALL USERS (Admin)
// ============================================
exports.getAllUsers = async (req, res) => {
  try {
    console.log('👥 Admin fetching all users with params:', req.query);

    const {
      page = 1,
      limit = 10,
      search,
      role,
      status,
      sortBy = '-createdAt'
    } = req.query;

    // Build query
    const query = {};

    // Search filter
    if (search) {
      query.$or = [
        { firstname: { $regex: search, $options: 'i' } },
        { lastname: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    // Role filter
    if (role && role !== 'all') {
      query.role = role;
    }

    // Status filter (isBlocked)
    if (status === 'blocked') {
      query.isBlocked = true;
    } else if (status === 'active') {
      query.isBlocked = { $ne: true };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Determine sort order
    const sortOrder = {};
    if (sortBy.startsWith('-')) {
      sortOrder[sortBy.substring(1)] = -1;
    } else {
      sortOrder[sortBy] = 1;
    }

    // Fetch users
    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password -refreshToken')
        .sort(sortOrder)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      User.countDocuments(query)
    ]);

    // Get order counts for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const orderCount = await Order.countDocuments({ user: user._id });
        const totalSpent = await Order.aggregate([
          { $match: { user: user._id, orderStatus: { $ne: 'cancelled' } } },
          { $group: { _id: null, total: { $sum: '$total' } } }
        ]);

        return {
          ...user,
          orderCount,
          totalSpent: totalSpent[0]?.total || 0
        };
      })
    );

    console.log('✅ Users fetched:', users.length, 'Total:', total);

    res.json({
      success: true,
      message: 'Users retrieved successfully',
      users: usersWithStats,
      total,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      limit: parseInt(limit)
    });

  } catch (error) {
    console.error('❌ Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
};

// ============================================
// GET SINGLE USER (Admin)
// ============================================
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('👥 Fetching user:', id);

    const user = await User.findById(id)
      .select('-password -refreshToken')
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's orders
    const orders = await Order.find({ user: id })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Get user stats
    const totalOrders = await Order.countDocuments({ user: id });
    const totalSpent = await Order.aggregate([
      { $match: { user: user._id, orderStatus: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);

    console.log('✅ User fetched:', user.email);

    res.json({
      success: true,
      message: 'User retrieved successfully',
      user: {
        ...user,
        totalOrders,
        totalSpent: totalSpent[0]?.total || 0,
        recentOrders: orders
      }
    });

  } catch (error) {
    console.error('❌ Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      error: error.message
    });
  }
};

// ============================================
// UPDATE USER (Admin)
// ============================================
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('👥 Updating user:', id);

    // Don't allow password update through this endpoint
    delete req.body.password;
    delete req.body.refreshToken;

    const user = await User.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).select('-password -refreshToken');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('✅ User updated:', user.email);

    res.json({
      success: true,
      message: 'User updated successfully',
      user
    });

  } catch (error) {
    console.error('❌ Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: error.message
    });
  }
};

// ============================================
// DELETE USER (Admin)
// ============================================
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('👥 Deleting user:', id);

    // Don't allow admin to delete themselves
    if (id === req.user.id || id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('✅ User deleted:', user.email);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message
    });
  }
};

// ============================================
// TOGGLE USER BLOCK STATUS (Admin)
// ============================================
exports.toggleBlockUser = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('👥 Toggling block status for user:', id);

    // Don't allow admin to block themselves
    if (id === req.user.id || id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot block your own account'
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    console.log('✅ User block status toggled:', user.isBlocked);

    res.json({
      success: true,
      message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`,
      user: {
        _id: user._id,
        email: user.email,
        isBlocked: user.isBlocked
      }
    });

  } catch (error) {
    console.error('❌ Error toggling block status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user status',
      error: error.message
    });
  }
};

// ============================================
// GET USER'S ORDERS (Admin)
// ============================================
exports.getUserOrders = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;

    console.log('👥 Fetching orders for user:', id);

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [orders, total] = await Promise.all([
      Order.find({ user: id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('items.product', 'name images price')
        .lean(),
      Order.countDocuments({ user: id })
    ]);

    console.log('✅ User orders fetched:', orders.length);

    res.json({
      success: true,
      message: 'User orders retrieved successfully',
      orders,
      total,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit))
    });

  } catch (error) {
    console.error('❌ Error fetching user orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user orders',
      error: error.message
    });
  }
};

// ============================================
// GET USER STATISTICS (Admin)
// ============================================
exports.getUserStats = async (req, res) => {
  try {
    console.log('📊 Fetching user statistics...');

    const totalUsers = await User.countDocuments({ role: { $ne: 'admin' } });
    const blockedUsers = await User.countDocuments({ isBlocked: true });
    const activeUsers = totalUsers - blockedUsers;

    const newUsersThisMonth = await User.countDocuments({
      role: { $ne: 'admin' },
      createdAt: {
        $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      }
    });

    console.log('✅ User stats fetched');

    res.json({
      success: true,
      message: 'User statistics retrieved successfully',
      stats: {
        totalUsers,
        activeUsers,
        blockedUsers,
        newUsersThisMonth
      }
    });

  } catch (error) {
    console.error('❌ Error fetching user stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user statistics',
      error: error.message
    });
  }
};