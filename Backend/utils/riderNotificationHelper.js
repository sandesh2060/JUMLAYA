// ============================================
// Backend/utils/riderNotificationHelper.js
// ✅ PRODUCTION READY - Rider Notifications
// ============================================

const Notification = require('../models/notification.model');
const User = require('../models/user.model');
const Rider = require('../models/rider.model');
const sendEmail = require('./sendEmail');

/**
 * ✅ Notify ALL active riders about new delivery order
 */
const notifyRidersNewDelivery = async (order) => {
  try {
    console.log('📢 Notifying all active riders about new delivery order:', order.orderId);

    // Find all active and verified riders
    const activeRiders = await Rider.find({
      status: 'active',
      'verification.isVerified': true
    }).populate('user', 'email name firstname lastname');

    if (!activeRiders || activeRiders.length === 0) {
      console.log('⚠️ No active riders found to notify');
      return [];
    }

    console.log(`📬 Found ${activeRiders.length} active rider(s) to notify`);

    // Populate order details
    await order.populate('user', 'name email phone');
    await order.populate('items.product', 'name images');

    // Calculate delivery distance (if available)
    const deliveryInfo = {
      orderId: order.orderId,
      orderNumber: order.orderId,
      customerName: order.user?.name || 'Customer',
      customerPhone: order.user?.phone || order.shippingAddress?.phone || 'N/A',
      deliveryAddress: formatAddress(order.shippingAddress),
      itemsCount: order.items?.length || 0,
      totalAmount: order.totalPrice || 0,
      shippingFee: order.shippingPrice || 50,
      paymentMethod: order.paymentMethod || 'COD',
      distance: order.deliveryDistance || 'N/A',
      estimatedTime: order.estimatedDeliveryTime || '30-45 mins'
    };

    // Create notifications and send emails for each rider
    const notifications = await Promise.all(
      activeRiders.map(async (rider) => {
        try {
          // Create in-app notification
          const notification = await Notification.create({
            recipient: rider.user._id,
            recipientType: 'rider',
            type: 'new_delivery_available',
            title: '🚚 New Delivery Available!',
            message: `Order #${order.orderId} ready for pickup. Delivery to ${order.shippingAddress.city}. Earn NPR ${order.shippingPrice || 50}`,
            data: {
              orderId: order._id,
              orderNumber: order.orderId,
              ...deliveryInfo
            },
            priority: 'high',
            actionUrl: `/rider/orders/${order._id}`
          });

          // Send email notification
          const riderEmail = rider.user.email;
          const riderName = rider.user.firstname || rider.user.name || 'Rider';

          if (riderEmail) {
            try {
              await sendEmail({
                to: riderEmail,
                subject: `🚚 New Delivery Available - Order #${order.orderId}`,
                html: generateRiderDeliveryEmail(riderName, order, deliveryInfo)
              });
              
              await notification.updateOne({ emailSentAt: new Date() });
              console.log(`✅ Email sent to rider: ${riderEmail}`);
            } catch (emailError) {
              console.error(`❌ Failed to send email to ${riderEmail}:`, emailError.message);
            }
          }

          console.log(`✅ Notification created for rider: ${rider.riderCode}`);
          return notification;
        } catch (error) {
          console.error(`❌ Failed to notify rider ${rider.riderCode}:`, error.message);
          return null;
        }
      })
    );

    const successfulNotifications = notifications.filter(n => n !== null);
    console.log(`✅ Successfully notified ${successfulNotifications.length}/${activeRiders.length} riders`);

    return successfulNotifications;
  } catch (error) {
    console.error('❌ Error notifying riders about new delivery:', error);
    throw error;
  }
};

/**
 * ✅ Notify specific rider about order assignment
 */
const notifyRiderOrderAssigned = async (riderId, order) => {
  try {
    const rider = await Rider.findById(riderId).populate('user', 'email name firstname lastname');
    
    if (!rider) {
      console.error('❌ Rider not found:', riderId);
      return null;
    }

    await order.populate('user', 'name phone');

    const deliveryInfo = {
      orderId: order.orderId,
      customerName: order.user?.name || 'Customer',
      customerPhone: order.user?.phone || 'N/A',
      deliveryAddress: formatAddress(order.shippingAddress),
      totalAmount: order.totalPrice,
      shippingFee: order.shippingPrice || 50,
      paymentMethod: order.paymentMethod
    };

    // Create notification
    const notification = await Notification.create({
      recipient: rider.user._id,
      recipientType: 'rider',
      type: 'order_assigned',
      title: '✅ Order Assigned to You!',
      message: `You've been assigned order #${order.orderId}. Please proceed to pickup location.`,
      data: {
        orderId: order._id,
        orderNumber: order.orderId,
        ...deliveryInfo
      },
      priority: 'high',
      actionUrl: `/rider/orders/${order._id}`
    });

    // Send email
    const riderEmail = rider.user.email;
    const riderName = rider.user.firstname || rider.user.name || 'Rider';

    if (riderEmail) {
      await sendEmail({
        to: riderEmail,
        subject: `✅ Order Assigned - #${order.orderId}`,
        html: generateRiderAssignmentEmail(riderName, order, deliveryInfo)
      });
      
      await notification.updateOne({ emailSentAt: new Date() });
    }

    console.log(`✅ Rider ${rider.riderCode} notified about order assignment`);
    return notification;
  } catch (error) {
    console.error('❌ Error notifying rider about assignment:', error);
    throw error;
  }
};

/**
 * ✅ Notify rider about earnings
 */
const notifyRiderEarnings = async (riderId, order) => {
  try {
    const rider = await Rider.findById(riderId).populate('user', 'email name firstname lastname');
    
    if (!rider) return null;

    const earningsAmount = order.shippingPrice || 50;

    const notification = await Notification.create({
      recipient: rider.user._id,
      recipientType: 'rider',
      type: 'earnings_added',
      title: '💰 Earnings Added!',
      message: `You earned NPR ${earningsAmount} from order #${order.orderId}. Great job!`,
      data: {
        orderId: order._id,
        orderNumber: order.orderId,
        amount: earningsAmount
      },
      priority: 'medium',
      actionUrl: '/rider/earnings'
    });

    console.log(`✅ Earnings notification sent to rider: ${rider.riderCode}`);
    return notification;
  } catch (error) {
    console.error('❌ Error notifying rider about earnings:', error);
    return null;
  }
};

/**
 * ✅ Notify rider about order cancellation
 */
const notifyRiderOrderCancelled = async (riderId, order, reason = '') => {
  try {
    const rider = await Rider.findById(riderId).populate('user', 'email name firstname lastname');
    
    if (!rider) return null;

    const notification = await Notification.create({
      recipient: rider.user._id,
      recipientType: 'rider',
      type: 'order_cancelled',
      title: '❌ Order Cancelled',
      message: `Order #${order.orderId} has been cancelled. ${reason || 'Please check for new orders.'}`,
      data: {
        orderId: order._id,
        orderNumber: order.orderId,
        reason: reason
      },
      priority: 'high',
      actionUrl: '/rider/orders'
    });

    // Send email
    const riderEmail = rider.user.email;
    if (riderEmail) {
      await sendEmail({
        to: riderEmail,
        subject: `❌ Order Cancelled - #${order.orderId}`,
        html: generateRiderCancellationEmail(rider.user.firstname || rider.user.name, order, reason)
      });
    }

    console.log(`✅ Cancellation notification sent to rider: ${rider.riderCode}`);
    return notification;
  } catch (error) {
    console.error('❌ Error notifying rider about cancellation:', error);
    return null;
  }
};

// ============================================
// EMAIL TEMPLATES FOR RIDERS
// ============================================

/**
 * Generate email for new delivery notification
 */
const generateRiderDeliveryEmail = (riderName, order, deliveryInfo) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
          line-height: 1.6; 
          color: #1f2937;
          margin: 0;
          padding: 0;
          background-color: #f3f4f6;
        }
        .container { 
          max-width: 600px; 
          margin: 20px auto; 
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header { 
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); 
          color: white; 
          padding: 40px 30px; 
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 700;
        }
        .badge {
          display: inline-block;
          background: rgba(255, 255, 255, 0.2);
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 14px;
          margin-top: 12px;
          font-weight: 600;
        }
        .content { 
          padding: 40px 30px;
        }
        .greeting {
          font-size: 20px;
          color: #111827;
          margin-bottom: 16px;
          font-weight: 600;
        }
        .order-card {
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          border: 2px solid #3b82f6;
          border-radius: 12px;
          padding: 24px;
          margin: 24px 0;
        }
        .order-id {
          font-size: 24px;
          color: #1e40af;
          font-weight: 700;
          margin-bottom: 16px;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid rgba(59, 130, 246, 0.2);
        }
        .info-row:last-child {
          border-bottom: none;
        }
        .info-label {
          color: #6b7280;
          font-weight: 500;
        }
        .info-value {
          color: #111827;
          font-weight: 600;
        }
        .earnings-box {
          background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
          border: 2px solid #22c55e;
          border-radius: 12px;
          padding: 20px;
          text-align: center;
          margin: 24px 0;
        }
        .earnings-amount {
          font-size: 32px;
          color: #15803d;
          font-weight: 700;
          margin: 8px 0;
        }
        .address-box {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 16px;
          margin: 16px 0;
        }
        .button { 
          display: inline-block; 
          width: 100%;
          padding: 16px 32px; 
          background: #3b82f6; 
          color: white !important; 
          text-decoration: none; 
          border-radius: 10px; 
          margin-top: 24px;
          font-weight: 700;
          font-size: 16px;
          text-align: center;
          box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3);
        }
        .footer { 
          text-align: center; 
          padding: 30px;
          background: #f9fafb;
          border-top: 1px solid #e5e7eb;
        }
        .footer p {
          margin: 5px 0;
          color: #6b7280;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚚 New Delivery Order</h1>
          <div class="badge">⚡ Act Fast - First Come First Serve</div>
        </div>
        
        <div class="content">
          <div class="greeting">Hello ${riderName}! 👋</div>
          <p style="color: #4b5563; font-size: 16px;">
            A new delivery order is available in your area. Accept it now to start earning!
          </p>
          
          <div class="order-card">
            <div class="order-id">Order #${deliveryInfo.orderId}</div>
            
            <div class="info-row">
              <span class="info-label">📦 Items</span>
              <span class="info-value">${deliveryInfo.itemsCount} items</span>
            </div>
            
            <div class="info-row">
              <span class="info-label">👤 Customer</span>
              <span class="info-value">${deliveryInfo.customerName}</span>
            </div>
            
            <div class="info-row">
              <span class="info-label">📞 Contact</span>
              <span class="info-value">${deliveryInfo.customerPhone}</span>
            </div>
            
            <div class="info-row">
              <span class="info-label">💳 Payment</span>
              <span class="info-value">${deliveryInfo.paymentMethod}</span>
            </div>
            
            <div class="info-row">
              <span class="info-label">📍 Distance</span>
              <span class="info-value">${deliveryInfo.distance}</span>
            </div>
            
            <div class="info-row">
              <span class="info-label">⏱️ Est. Time</span>
              <span class="info-value">${deliveryInfo.estimatedTime}</span>
            </div>
          </div>
          
          <div class="earnings-box">
            <div style="color: #15803d; font-size: 14px; font-weight: 600;">💰 YOUR EARNINGS</div>
            <div class="earnings-amount">NPR ${deliveryInfo.shippingFee}</div>
            <div style="color: #15803d; font-size: 14px;">Plus potential tips!</div>
          </div>
          
          <div style="background: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <strong style="color: #92400e;">📍 Delivery Location:</strong>
            <div class="address-box" style="margin-top: 8px; background: white;">
              ${deliveryInfo.deliveryAddress}
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 32px;">
            <a href="${frontendUrl}/rider/orders/${order._id}" class="button">
              ✅ Accept Order Now
            </a>
          </div>
          
          <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; margin-top: 24px; border-radius: 4px;">
            <strong style="color: #991b1b;">⚠️ Important:</strong>
            <p style="margin: 8px 0 0 0; color: #7f1d1d; font-size: 14px;">
              Orders are assigned on a first-come, first-served basis. Accept quickly to secure this delivery!
            </p>
          </div>
        </div>
        
        <div class="footer">
          <p><strong>🌿 JUMLAYA Delivery</strong></p>
          <p>Delivering Fresh & Organic Products</p>
          <p style="margin-top: 12px; font-size: 12px;">
            This is an automated notification. Please do not reply to this email.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Generate email for order assignment
 */
const generateRiderAssignmentEmail = (riderName, order, deliveryInfo) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
          line-height: 1.6; 
          color: #1f2937;
          margin: 0;
          padding: 0;
          background-color: #f3f4f6;
        }
        .container { 
          max-width: 600px; 
          margin: 20px auto; 
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header { 
          background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); 
          color: white; 
          padding: 40px 30px; 
          text-align: center;
        }
        .content { padding: 40px 30px; }
        .button { 
          display: inline-block; 
          width: 100%;
          padding: 16px 32px; 
          background: #22c55e; 
          color: white !important; 
          text-decoration: none; 
          border-radius: 10px; 
          text-align: center;
          font-weight: 700;
          font-size: 16px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 28px;">✅ Order Assigned!</h1>
        </div>
        <div class="content">
          <h2 style="color: #111827; margin-top: 0;">Hi ${riderName}!</h2>
          <p style="font-size: 16px; color: #4b5563;">
            Great news! Order <strong>#${deliveryInfo.orderId}</strong> has been assigned to you.
          </p>
          
          <div style="background: #f0fdf4; border: 2px solid #22c55e; border-radius: 12px; padding: 24px; margin: 24px 0;">
            <p style="margin: 8px 0;"><strong>Customer:</strong> ${deliveryInfo.customerName}</p>
            <p style="margin: 8px 0;"><strong>Phone:</strong> ${deliveryInfo.customerPhone}</p>
            <p style="margin: 8px 0;"><strong>Payment:</strong> ${deliveryInfo.paymentMethod}</p>
            <p style="margin: 8px 0;"><strong>Your Earnings:</strong> NPR ${deliveryInfo.shippingFee}</p>
          </div>
          
          <div style="background: #fef3c7; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <strong>📍 Pickup & Delivery:</strong>
            <p style="margin: 8px 0 0 0;">${deliveryInfo.deliveryAddress}</p>
          </div>
          
          <a href="${frontendUrl}/rider/orders/${order._id}" class="button">
            View Order Details
          </a>
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Generate email for order cancellation
 */
const generateRiderCancellationEmail = (riderName, order, reason) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { 
          font-family: Arial, sans-serif;
          line-height: 1.6; 
          color: #333;
          margin: 0;
          padding: 0;
        }
        .container { 
          max-width: 600px; 
          margin: 20px auto; 
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header { 
          background: #ef4444; 
          color: white; 
          padding: 30px; 
          text-align: center;
        }
        .content { padding: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">❌ Order Cancelled</h1>
        </div>
        <div class="content">
          <p>Hi ${riderName},</p>
          <p>Order <strong>#${order.orderId}</strong> has been cancelled.</p>
          ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
          <p>Please check your dashboard for new delivery opportunities.</p>
          <p>Best regards,<br>JUMLAYA Team</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Format shipping address for display
 */
const formatAddress = (address) => {
  if (!address) return 'Address not available';
  
  const parts = [
    address.addressLine1,
    address.addressLine2,
    address.city,
    address.state,
    address.postalCode
  ].filter(Boolean);
  
  return parts.join(', ');
};

module.exports = {
  notifyRidersNewDelivery,
  notifyRiderOrderAssigned,
  notifyRiderEarnings,
  notifyRiderOrderCancelled
};