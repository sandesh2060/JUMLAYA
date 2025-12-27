const userModel = require("../models/user.model");
const crypto = require("crypto");

// Create User
module.exports.createUser = async (userData) => {
  try {
    const user = new userModel(userData);
    await user.save();
    return user;
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      throw new Error(`${field} already exists`);
    }
    throw new Error("Error creating user: " + error.message);
  }
};

// Find User by Email
module.exports.findUserByEmail = async (email) => {
  try {
    const user = await userModel.findOne({ email }).select("+password");
    return user;
  } catch (error) {
    throw new Error("Error finding user by email: " + error.message);
  }
};

// Find User by Username
module.exports.findUserByUsername = async (username) => {
  try {
    const user = await userModel.findOne({ username });
    return user;
  } catch (error) {
    throw new Error("Error finding user by username: " + error.message);
  }
};

// Find User by ID
module.exports.findUserById = async (userId) => {
  try {
    const user = await userModel.findById(userId);
    return user;
  } catch (error) {
    throw new Error("Error finding user by ID: " + error.message);
  }
};

// Find User by Phone
module.exports.findUserByPhone = async (phone) => {
  try {
    const user = await userModel.findOne({ phone });
    return user;
  } catch (error) {
    throw new Error("Error finding user by phone: " + error.message);
  }
};

// Update User
module.exports.updateUser = async (userId, updateData) => {
  try {
    const user = await userModel.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    );
    return user;
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      throw new Error(`${field} already exists`);
    }
    throw new Error("Error updating user: " + error.message);
  }
};

// Update User Password
module.exports.updatePassword = async (userId, newPassword) => {
  try {
    const user = await userModel.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    user.password = newPassword;
    await user.save();
    return user;
  } catch (error) {
    throw new Error("Error updating password: " + error.message);
  }
};

// Delete User (Soft Delete)
module.exports.deactivateUser = async (userId) => {
  try {
    const user = await userModel.findByIdAndUpdate(
      userId,
      { isActive: false },
      { new: true }
    );
    return user;
  } catch (error) {
    throw new Error("Error deactivating user: " + error.message);
  }
};

// Activate User
module.exports.activateUser = async (userId) => {
  try {
    const user = await userModel.findByIdAndUpdate(
      userId,
      { isActive: true },
      { new: true }
    );
    return user;
  } catch (error) {
    throw new Error("Error activating user: " + error.message);
  }
};

// Delete User Permanently
module.exports.deleteUser = async (userId) => {
  try {
    const user = await userModel.findByIdAndDelete(userId);
    return user;
  } catch (error) {
    throw new Error("Error deleting user: " + error.message);
  }
};

// Get All Users (with pagination and filters)
module.exports.getAllUsers = async (filters = {}, options = {}) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = options;

    const query = { ...filters };

    const users = await userModel
      .find(query)
      .sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .select("-password -refreshToken");

    const total = await userModel.countDocuments(query);

    return {
      users,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit),
      },
    };
  } catch (error) {
    throw new Error("Error getting all users: " + error.message);
  }
};

// Verify Email
module.exports.verifyEmail = async (hashedToken) => {
  try {
    const user = await userModel.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      throw new Error("Invalid or expired verification token");
    }

    user.isVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    return user;
  } catch (error) {
    throw new Error("Error verifying email: " + error.message);
  }
};

// Find User by Reset Token
module.exports.findUserByResetToken = async (hashedToken) => {
  try {
    const user = await userModel.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });
    return user;
  } catch (error) {
    throw new Error("Error finding user by reset token: " + error.message);
  }
};

// Update Refresh Token
module.exports.updateRefreshToken = async (userId, refreshToken) => {
  try {
    const user = await userModel.findByIdAndUpdate(
      userId,
      { refreshToken },
      { new: true }
    );
    return user;
  } catch (error) {
    throw new Error("Error updating refresh token: " + error.message);
  }
};

// Find User by Refresh Token
module.exports.findUserByRefreshToken = async (refreshToken) => {
  try {
    const user = await userModel.findOne({ refreshToken });
    return user;
  } catch (error) {
    throw new Error("Error finding user by refresh token: " + error.message);
  }
};

// Update Last Login
module.exports.updateLastLogin = async (userId) => {
  try {
    const user = await userModel.findByIdAndUpdate(
      userId,
      { lastLogin: Date.now() },
      { new: true }
    );
    return user;
  } catch (error) {
    throw new Error("Error updating last login: " + error.message);
  }
};

// Address Management

// Add Address
module.exports.addAddress = async (userId, addressData) => {
  try {
    const user = await userModel.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // If this is set as default, unset all other default addresses
    if (addressData.isDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    user.addresses.push(addressData);
    await user.save();
    return user;
  } catch (error) {
    throw new Error("Error adding address: " + error.message);
  }
};

// Update Address
module.exports.updateAddress = async (userId, addressId, updateData) => {
  try {
    const user = await userModel.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const address = user.addresses.id(addressId);
    if (!address) {
      throw new Error("Address not found");
    }

    // If setting as default, unset all other default addresses
    if (updateData.isDefault) {
      user.addresses.forEach((addr) => {
        if (addr._id.toString() !== addressId) {
          addr.isDefault = false;
        }
      });
    }

    Object.assign(address, updateData);
    await user.save();
    return user;
  } catch (error) {
    throw new Error("Error updating address: " + error.message);
  }
};

// Delete Address
module.exports.deleteAddress = async (userId, addressId) => {
  try {
    const user = await userModel.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const address = user.addresses.id(addressId);
    if (!address) {
      throw new Error("Address not found");
    }

    const wasDefault = address.isDefault;
    address.deleteOne();

    // If deleted address was default, set first remaining address as default
    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();
    return user;
  } catch (error) {
    throw new Error("Error deleting address: " + error.message);
  }
};

// Set Default Address
module.exports.setDefaultAddress = async (userId, addressId) => {
  try {
    const user = await userModel.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const address = user.addresses.id(addressId);
    if (!address) {
      throw new Error("Address not found");
    }

    // Unset all default addresses
    user.addresses.forEach((addr) => {
      addr.isDefault = false;
    });

    // Set the specified address as default
    address.isDefault = true;
    await user.save();
    return user;
  } catch (error) {
    throw new Error("Error setting default address: " + error.message);
  }
};

// Get All Addresses
module.exports.getAddresses = async (userId) => {
  try {
    const user = await userModel.findById(userId).select("addresses");
    if (!user) {
      throw new Error("User not found");
    }
    return user.addresses;
  } catch (error) {
    throw new Error("Error getting addresses: " + error.message);
  }
};
