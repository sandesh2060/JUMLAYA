const Rider = require('../models/rider.model');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.attachRider = catchAsync(async (req, res, next) => {
  // Find rider by user ID
  const rider = await Rider.findOne({ user: req.user._id });
  
  if (!rider) {
    return next(new AppError('Rider profile not found', 404));
  }
  
  req.rider = rider;
  next();
});