// ==========================================
// controllers/address.controller.js
// ==========================================
const Address = require('../models/address.model');
const User = require('../models/user.model');
const AppError = require('../utils/AppError');

// Helper function for success response
const sendSuccess = (res, status, message, data = {}) => {
  res.status(status).json({ success: true, message, data });
};

// ==========================================
// HELPER: Check for duplicate address
// ==========================================
const checkDuplicateAddress = async (userId, addressData, excludeId = null) => {
  const query = {
    user: userId,
    isActive: true,
    addressLine1: addressData.addressLine1,
    city: addressData.city,
    state: addressData.state,
    postalCode: addressData.postalCode
  };

  // If updating, exclude current address from check
  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  const existingAddress = await Address.findOne(query);
  return existingAddress;
};

// ==========================================
// GET ALL USER ADDRESSES
// ==========================================
exports.getAddresses = async (req, res, next) => {
  try {
    const addresses = await Address.getUserAddresses(req.user.id);
    
    sendSuccess(res, 200, 'Addresses retrieved successfully', {
      count: addresses.length,
      addresses
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// GET SINGLE ADDRESS BY ID
// ==========================================
exports.getAddress = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const address = await Address.findOne({
      _id: id,
      user: req.user.id,
      isActive: true
    });
    
    if (!address) {
      return next(new AppError('Address not found', 404));
    }
    
    sendSuccess(res, 200, 'Address retrieved successfully', address);
  } catch (error) {
    next(error);
  }
};

// ==========================================
// GET DEFAULT ADDRESS
// ==========================================
exports.getDefaultAddress = async (req, res, next) => {
  try {
    const address = await Address.getDefaultAddress(req.user.id);
    
    if (!address) {
      return next(new AppError('No default address found', 404));
    }
    
    sendSuccess(res, 200, 'Default address retrieved', address);
  } catch (error) {
    next(error);
  }
};

// ==========================================
// CREATE NEW ADDRESS
// ==========================================
exports.createAddress = async (req, res, next) => {
  try {
    const {
      addressType,
      label,
      fullName,
      phone,
      alternatePhone,
      email,
      addressLine1,
      addressLine2,
      landmark,
      city,
      state,
      postalCode,
      country,
      coordinates,
      isDefault,
      deliveryInstructions
    } = req.body;


    // ✅ CHECK FOR DUPLICATE ADDRESS
    const duplicateAddress = await checkDuplicateAddress(req.user.id, {
      addressLine1,
      city,
      state,
      postalCode
    });

    if (duplicateAddress) {
      return next(new AppError('This address already exists in your address book', 400));
    }

    // Create address with user ID
    const address = await Address.create({
      user: req.user.id,
      addressType,
      label,
      fullName,
      phone,
      alternatePhone,
      email,
      addressLine1,
      addressLine2,
      landmark,
      city,
      state,
      postalCode,
      country: country || 'Nepal',
      coordinates,
      isDefault: isDefault || false,
      deliveryInstructions
    });

    // Update user's addresses array
    await User.findByIdAndUpdate(
      req.user.id,
      { $addToSet: { addresses: address._id } },
      { new: true }
    );


    sendSuccess(res, 201, 'Address created successfully', address);
  } catch (error) {
    console.error('❌ Error in createAddress:', error);
    next(error);
  }
};

// ==========================================
// UPDATE ADDRESS
// ==========================================
exports.updateAddress = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    let address = await Address.findOne({
      _id: id,
      user: req.user.id,
      isActive: true
    });
    
    if (!address) {
      return next(new AppError('Address not found', 404));
    }

    // ✅ CHECK FOR DUPLICATE IF ADDRESS DETAILS ARE BEING CHANGED
    if (req.body.addressLine1 || req.body.city || req.body.state || req.body.postalCode) {
      const addressToCheck = {
        addressLine1: req.body.addressLine1 || address.addressLine1,
        city: req.body.city || address.city,
        state: req.body.state || address.state,
        postalCode: req.body.postalCode || address.postalCode
      };

      const duplicateAddress = await checkDuplicateAddress(req.user.id, addressToCheck, id);

      if (duplicateAddress) {
        return next(new AppError('This address already exists in your address book', 400));
      }
    }

    const allowedUpdates = [
      'addressType', 'label', 'fullName', 'phone', 'alternatePhone',
      'email', 'addressLine1', 'addressLine2', 'landmark', 'city',
      'state', 'postalCode', 'country', 'coordinates', 'isDefault',
      'deliveryInstructions'
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        address[field] = req.body[field];
      }
    });

    await address.save();

    sendSuccess(res, 200, 'Address updated successfully', address);
  } catch (error) {
    next(error);
  }
};

// ==========================================
// SET ADDRESS AS DEFAULT
// ==========================================
exports.setDefaultAddress = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const address = await Address.findOne({
      _id: id,
      user: req.user.id,
      isActive: true
    });
    
    if (!address) {
      return next(new AppError('Address not found', 404));
    }

    await address.setAsDefault();

    sendSuccess(res, 200, 'Address set as default', address);
  } catch (error) {
    next(error);
  }
};
// ==========================================
// FIXED: DELETE ADDRESS - Complete Solution
// Replace your deleteAddress function with this
// ==========================================
exports.deleteAddress = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    console.log('🗑️ Delete request for address:', id);
    console.log('👤 User ID:', req.user.id);
    
    // ✅ Find address without isActive filter
    const address = await Address.findOne({
      _id: id,
      user: req.user.id
    });
    
    if (!address) {
      console.log('❌ Address not found in database');
      return next(new AppError('Address not found', 404));
    }
    
    console.log('✅ Found address:', {
      id: address._id,
      isActive: address.isActive,
      isDefault: address.isDefault
    });

    // ✅ If already soft-deleted, return success
    if (!address.isActive) {
      console.log('⚠️ Address already deleted, removing from user array');
      
      // Still remove from user's addresses array if needed
      await User.findByIdAndUpdate(
        req.user.id,
        { $pull: { addresses: id } },
        { new: true }
      );
      
      return sendSuccess(res, 200, 'Address deleted successfully');
    }

    // ✅ Perform soft delete
    address.isActive = false;
    await address.save();
    
    console.log('✅ Soft deleted address');

    // ✅ Remove from user's addresses array
    await User.findByIdAndUpdate(
      req.user.id,
      { $pull: { addresses: id } },
      { new: true }
    );
    
    console.log('✅ Removed from user addresses array');

    // ✅ If deleted address was default, set another as default
    if (address.isDefault) {
      console.log('🔄 Deleted address was default, finding replacement...');
      
      const nextAddress = await Address.findOne({
        user: req.user.id,
        isActive: true,
        _id: { $ne: id }
      }).sort({ createdAt: -1 }); // Get most recent active address
      
      if (nextAddress) {
        await nextAddress.setAsDefault();
        console.log('✅ Set new default address:', nextAddress._id);
      } else {
        console.log('⚠️ No other active addresses to set as default');
      }
    }

    sendSuccess(res, 200, 'Address deleted successfully');
  } catch (error) {
    console.error('❌ Delete error:', error);
    
    // Handle invalid ObjectId format
    if (error.name === 'CastError') {
      return next(new AppError('Invalid address ID format', 400));
    }
    
    next(error);
  }
};
// ==========================================
// PERMANENTLY DELETE ADDRESS
// ==========================================
exports.permanentlyDeleteAddress = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const address = await Address.findOneAndDelete({
      _id: id,
      user: req.user.id
    });
    
    if (!address) {
      return next(new AppError('Address not found', 404));
    }

    // Remove from user's addresses array
    await User.findByIdAndUpdate(
      req.user.id,
      { $pull: { addresses: id } },
      { new: true }
    );


    sendSuccess(res, 200, 'Address permanently deleted');
  } catch (error) {
    next(error);
  }
};

// ==========================================
// GET RECENTLY USED ADDRESSES
// ==========================================
exports.getRecentAddresses = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 3;
    const addresses = await Address.getRecentAddresses(req.user.id, limit);
    
    sendSuccess(res, 200, 'Recent addresses retrieved', {
      count: addresses.length,
      addresses
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// MARK ADDRESS AS USED
// ==========================================
exports.markAddressAsUsed = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const address = await Address.findOne({
      _id: id,
      user: req.user.id,
      isActive: true
    });
    
    if (!address) {
      return next(new AppError('Address not found', 404));
    }

    await address.markAsUsed();

    sendSuccess(res, 200, 'Address marked as used', address);
  } catch (error) {
    next(error);
  }
};

// ==========================================
// VALIDATE NEPAL ADDRESS
// ==========================================
exports.validateNepalAddress = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const address = await Address.findOne({
      _id: id,
      user: req.user.id,
      isActive: true
    });
    
    if (!address) {
      return next(new AppError('Address not found', 404));
    }

    const isValid = address.validateNepalAddress();

    sendSuccess(res, 200, 'Address validation complete', {
      isValid,
      message: isValid ? 'Valid Nepal address' : 'Invalid province name'
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// BULK DELETE ADDRESSES
// ==========================================
exports.bulkDeleteAddresses = async (req, res, next) => {
  try {
    const { addressIds } = req.body;

    if (!addressIds || !Array.isArray(addressIds) || addressIds.length === 0) {
      return next(new AppError('Please provide address IDs to delete', 400));
    }

    // Soft delete multiple addresses
    const result = await Address.updateMany(
      {
        _id: { $in: addressIds },
        user: req.user.id,
        isActive: true
      },
      { isActive: false }
    );

    // Remove from user's addresses array
    await User.findByIdAndUpdate(
      req.user.id,
      { $pull: { addresses: { $in: addressIds } } },
      { new: true }
    );

    sendSuccess(res, 200, `${result.modifiedCount} addresses deleted successfully`, {
      deletedCount: result.modifiedCount
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// GET ADDRESS COUNT
// ==========================================
exports.getAddressCount = async (req, res, next) => {
  try {
    const count = await Address.countDocuments({
      user: req.user.id,
      isActive: true
    });

    sendSuccess(res, 200, 'Address count retrieved', { count });
  } catch (error) {
    next(error);
  }
};
