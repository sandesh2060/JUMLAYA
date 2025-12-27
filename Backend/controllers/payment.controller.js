const Order = require('../models/order.model');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { verifyEsewa, verifyKhalti } = require('../utils/paymentProviders');
const { successResponse } = require('../utils/response');

exports.verifyPayment = catchAsync(async (req, res, next) => {
  const { orderId, provider, payload } = req.body;

  const order = await Order.findOne({ orderId });
  if (!order) return next(new AppError('Order not found', 404));

  let verified = false;

  if (provider === 'esewa') {
    verified = await verifyEsewa(payload);
  }

  if (provider === 'khalti') {
    verified = await verifyKhalti(payload);
  }

  if (!verified) {
    order.paymentStatus = 'failed';
    await order.save();
    return next(new AppError('Payment verification failed', 400));
  }

  order.markAsPaid(payload.transactionId || payload.refId);
  order.updateStatus('confirmed', 'Payment verified', null);
  await order.save();

  return successResponse(res, order, 'Payment verified successfully');
});
