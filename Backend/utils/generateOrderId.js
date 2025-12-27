const Order = require('../models/order.model');

/**
 * Generate a unique order ID
 * Format: ORD-YYYYMMDD-XXXX
 * Example: ORD-20241225-0001
 */
const generateOrderId = async () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const dateString = `${year}${month}${day}`;

  // Find the last order of the day
  const lastOrder = await Order.findOne({
    orderId: { $regex: `^ORD-${dateString}` }
  })
    .sort({ orderId: -1 })
    .limit(1);

  let sequence = 1;
  if (lastOrder) {
    // Extract sequence number from last order ID
    const lastSequence = parseInt(lastOrder.orderId.split('-')[2]);
    sequence = lastSequence + 1;
  }

  // Format sequence with leading zeros (4 digits)
  const sequenceString = String(sequence).padStart(4, '0');

  return `ORD-${dateString}-${sequenceString}`;
};

module.exports = { generateOrderId };