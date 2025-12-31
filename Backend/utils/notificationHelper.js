// ============================================
// Backend/utils/notificationHelper.js
// ✅ COMPLETE & PRODUCTION READY
// Handles notifications for customers, admins, and riders
// ============================================

const Notification = require('../models/notification.model');
const User = require('../models/user.model');
const sendEmail = require('./sendEmail');

/**
 * Create a notification and optionally send email
 */
const createNotification = async (data, sendEmailNotification = true) => {
  try {
    // Create in-app notification
    const notification = await Notification.createNotification({
      recipient: data.recipient,
      recipientType: data.recipientType || 'customer',
      type: data.type,
      titleKey: data.titleKey,
      messageKey: data.messageKey,
      messageParams: data.messageParams || {},
      title: data.title,
      message: data.message,
      relatedOrder: data.relatedOrder || null,
      relatedUser: data.relatedUser || null,
      relatedProduct: data.relatedProduct || null,
      metadata: data.metadata || {},
      priority: data.priority || 'medium',
      actionUrl: data.actionUrl
    });
    
    console.log('✅ Notification created:', data.titleKey || data.title, 'for user:', data.recipient);
    
    // Send email notification if enabled and email is provided
    if (sendEmailNotification && data.email) {
      try {
        console.log('📧 Attempting to send email to:', data.email);
        
        await sendEmail({
          to: data.email,
          subject: data.emailSubject || data.title,
          html: data.emailHtml || generateDefaultEmailTemplate(data)
        });
        
        await notification.markEmailSent();
        console.log('✅ Email sent successfully for notification:', data.titleKey || data.title);
      } catch (emailError) {
        console.error('❌ Email send failed:', emailError.message);
        // Don't fail the notification if email fails
      }
    }
    
    return notification;
  } catch (error) {
    console.error('❌ Error creating notification:', error);
    throw error;
  }
};

/**
 * ✅ Notify all admins about an event
 */
const notifyAllAdmins = async (type, title, message, metadata = {}) => {
  try {
    // Find all active admin users
    const admins = await User.find({ 
      role: 'admin', 
      isActive: true 
    }).select('_id email firstname lastname');

    if (!admins || admins.length === 0) {
      console.log('⚠️ No admin users found to notify');
      return [];
    }

    console.log(`📢 Notifying ${admins.length} admin(s) about: ${title}`);

    // Create notification for each admin
    const notifications = await Promise.all(
      admins.map(admin => 
        createNotification({
          recipient: admin._id,
          recipientType: 'admin',
          type: type,
          title: title,
          message: message,
          ...metadata,
          email: admin.email,
          emailSubject: `[ADMIN] ${title}`,
          priority: metadata.priority || 'high'
        }, true) // Enable email for admins
      )
    );

    console.log(`✅ Admin notifications created: ${notifications.length}`);
    return notifications;
  } catch (error) {
    console.error('❌ Error notifying admins:', error);
    return [];
  }
};

/**
 * Generate default email template
 */
const generateDefaultEmailTemplate = (data) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6; 
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f3f4f6;
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
          background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); 
          color: white; 
          padding: 40px 30px; 
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 32px;
          font-weight: 700;
        }
        .header p {
          margin: 10px 0 0 0;
          font-size: 16px;
          opacity: 0.9;
        }
        .content { 
          background: #ffffff; 
          padding: 40px 30px;
        }
        .content h2 {
          color: #111827;
          font-size: 24px;
          margin-top: 0;
          margin-bottom: 16px;
        }
        .content p {
          color: #4b5563;
          font-size: 16px;
          line-height: 1.6;
          margin-bottom: 16px;
        }
        .button { 
          display: inline-block; 
          padding: 14px 32px; 
          background: #22c55e; 
          color: white !important; 
          text-decoration: none; 
          border-radius: 8px; 
          margin-top: 24px;
          font-weight: 600;
          font-size: 16px;
          transition: background 0.2s;
        }
        .button:hover {
          background: #16a34a;
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
          <h1>🌿 JUMLAYA</h1>
          <p>Fresh & Organic Products</p>
        </div>
        <div class="content">
          <h2>${data.title}</h2>
          <p>${data.message}</p>
          ${data.actionUrl ? `
            <div style="text-align: center;">
              <a href="${frontendUrl}${data.actionUrl}" class="button">View Details</a>
            </div>
          ` : ''}
        </div>
        <div class="footer">
          <p><strong>© ${new Date().getFullYear()} JUMLAYA</strong></p>
          <p>Fresh & Organic Products Delivered to Your Doorstep</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// ============================================
// ORDER NOTIFICATIONS (CUSTOMER + ADMIN)
// ============================================

/**
 * ✅ Notify user AND admins when order is placed
 */
const notifyOrderPlaced = async (userId, order) => {
  const user = await User.findById(userId);
  
  if (!user) {
    console.error('❌ User not found for notification:', userId);
    return null;
  }
  
  console.log('📧 Creating order placed notification for customer:', user.email);
  
  // Notify customer
  const customerNotification = await createNotification({
    recipient: userId,
    recipientType: 'customer',
    type: 'order_placed',
    title: '🎉 Order Placed Successfully!',
    message: `Your order #${order.orderId} has been placed successfully. Total: NPR ${order.totalPrice}. We'll notify you once it's confirmed.`,
    relatedOrder: order._id,
    priority: 'high',
    actionUrl: `/orders/${order._id}`,
    email: user.email,
    emailSubject: `Order Confirmation - ${order.orderId}`,
    emailHtml: generateOrderPlacedEmail(order, user)
  }, true);

  // ✅ Notify all admins
  await notifyAllAdmins(
    'order_placed',
    '🛒 New Order Received!',
    `New order #${order.orderId} placed by ${user.firstname || user.name}. Total: NPR ${order.totalPrice}`,
    {
      relatedOrder: order._id,
      relatedUser: userId,
      actionUrl: `/admin/orders/${order._id}`,
      metadata: {
        orderId: order.orderId,
        customerName: user.firstname || user.name,
        totalAmount: order.totalPrice,
        itemsCount: order.items.length
      },
      priority: 'high'
    }
  );

  return customerNotification;
};

/**
 * ✅ Notify user AND admins when order is confirmed
 */
const notifyOrderConfirmed = async (userId, order) => {
  const user = await User.findById(userId);
  if (!user) return null;
  
  // Notify customer
  const customerNotification = await createNotification({
    recipient: userId,
    recipientType: 'customer',
    type: 'order_confirmed',
    title: '✅ Order Confirmed',
    message: `Your order #${order.orderId} has been confirmed and is being prepared for shipping.`,
    relatedOrder: order._id,
    priority: 'high',
    actionUrl: `/orders/${order._id}`,
    email: user.email,
    emailSubject: `Order Confirmed - ${order.orderId}`,
    emailHtml: generateOrderConfirmedEmail(order, user)
  }, true);

  // Notify admins
  await notifyAllAdmins(
    'order_confirmed',
    '✅ Order Confirmed',
    `Order #${order.orderId} has been confirmed.`,
    {
      relatedOrder: order._id,
      actionUrl: `/admin/orders/${order._id}`,
      metadata: { orderId: order.orderId, status: 'Confirmed' }
    }
  );

  return customerNotification;
};

/**
 * ✅ Notify user AND admins when order is shipped
 */
const notifyOrderShipped = async (userId, order) => {
  const user = await User.findById(userId);
  if (!user) return null;
  
  // Notify customer
  const customerNotification = await createNotification({
    recipient: userId,
    recipientType: 'customer',
    type: 'order_shipped',
    title: '📦 Order Shipped',
    message: `Your order #${order.orderId} has been shipped! Track your package for delivery updates.`,
    relatedOrder: order._id,
    priority: 'high',
    actionUrl: `/orders/${order._id}/track`,
    email: user.email,
    emailSubject: `Order Shipped - ${order.orderId}`,
    emailHtml: generateOrderShippedEmail(order, user)
  }, true);

  // Notify admins
  await notifyAllAdmins(
    'order_shipped',
    '📦 Order Shipped',
    `Order #${order.orderId} has been shipped. ${order.trackingNumber ? `Tracking: ${order.trackingNumber}` : ''}`,
    {
      relatedOrder: order._id,
      actionUrl: `/admin/orders/${order._id}`,
      metadata: { 
        orderId: order.orderId, 
        status: 'Shipped',
        trackingNumber: order.trackingNumber 
      }
    }
  );

  return customerNotification;
};

/**
 * ✅ Notify when order is out for delivery
 */
const notifyOrderOutForDelivery = async (userId, order) => {
  const user = await User.findById(userId);
  if (!user) return null;
  
  // Notify customer
  const customerNotification = await createNotification({
    recipient: userId,
    recipientType: 'customer',
    type: 'order_out_for_delivery',
    title: '🚚 Out for Delivery',
    message: `Your order #${order.orderId} is out for delivery! It will arrive soon.`,
    relatedOrder: order._id,
    priority: 'high',
    actionUrl: `/orders/${order._id}`,
    email: user.email,
    emailSubject: `Out for Delivery - ${order.orderId}`
  }, true);

  // Notify admins
  await notifyAllAdmins(
    'order_out_for_delivery',
    '🚚 Order Out for Delivery',
    `Order #${order.orderId} is out for delivery.`,
    {
      relatedOrder: order._id,
      actionUrl: `/admin/orders/${order._id}`,
      metadata: { orderId: order.orderId, status: 'Out for Delivery' }
    }
  );

  return customerNotification;
};

/**
 * ✅ Notify user AND admins when order is delivered
 */
const notifyOrderDelivered = async (userId, order) => {
  const user = await User.findById(userId);
  if (!user) return null;
  
  // Notify customer
  const customerNotification = await createNotification({
    recipient: userId,
    recipientType: 'customer',
    type: 'order_delivered',
    title: '🎊 Order Delivered',
    message: `Your order #${order.orderId} has been delivered! Thank you for shopping with us.`,
    relatedOrder: order._id,
    priority: 'high',
    actionUrl: `/orders/${order._id}`,
    email: user.email,
    emailSubject: `Order Delivered - ${order.orderId}`,
    emailHtml: generateOrderDeliveredEmail(order, user)
  }, true);

  // Notify admins
  await notifyAllAdmins(
    'order_delivered',
    '🎊 Order Delivered Successfully',
    `Order #${order.orderId} has been delivered to customer.`,
    {
      relatedOrder: order._id,
      actionUrl: `/admin/orders/${order._id}`,
      metadata: { orderId: order.orderId, status: 'Delivered' }
    }
  );

  return customerNotification;
};

/**
 * ✅ Notify user AND admins when order is cancelled
 */
const notifyOrderCancelled = async (userId, order, reason = '') => {
  const user = await User.findById(userId);
  if (!user) return null;
  
  // Notify customer
  const customerNotification = await createNotification({
    recipient: userId,
    recipientType: 'customer',
    type: 'order_cancelled',
    title: '❌ Order Cancelled',
    message: `Your order #${order.orderId} has been cancelled. ${reason || 'If you have any questions, please contact support.'}`,
    relatedOrder: order._id,
    priority: 'medium',
    actionUrl: `/orders/${order._id}`,
    email: user.email,
    emailSubject: `Order Cancelled - ${order.orderId}`,
    emailHtml: generateOrderCancelledEmail(order, user, reason)
  }, true);

  // Notify admins
  await notifyAllAdmins(
    'order_cancelled',
    '❌ Order Cancelled',
    `Order #${order.orderId} was cancelled. ${reason ? `Reason: ${reason}` : ''}`,
    {
      relatedOrder: order._id,
      actionUrl: `/admin/orders/${order._id}`,
      metadata: { 
        orderId: order.orderId, 
        status: 'Cancelled',
        reason: reason 
      },
      priority: 'high'
    }
  );

  return customerNotification;
};

/**
 * ✅ Notify when order is returned
 */
const notifyOrderReturned = async (userId, order) => {
  const user = await User.findById(userId);
  if (!user) return null;
  
  // Notify customer
  const customerNotification = await createNotification({
    recipient: userId,
    recipientType: 'customer',
    type: 'order_returned',
    title: '🔄 Order Return Initiated',
    message: `Your return request for order #${order.orderId} has been received. We'll process it shortly.`,
    relatedOrder: order._id,
    priority: 'medium',
    actionUrl: `/orders/${order._id}`,
    email: user.email,
    emailSubject: `Return Request - ${order.orderId}`
  }, true);

  // Notify admins
  await notifyAllAdmins(
    'order_returned',
    '🔄 Order Return Request',
    `Return requested for order #${order.orderId}. Please review.`,
    {
      relatedOrder: order._id,
      actionUrl: `/admin/orders/${order._id}`,
      metadata: { orderId: order.orderId, status: 'Returned' },
      priority: 'high'
    }
  );

  return customerNotification;
};

/**
 * ✅ Notify when payment is received
 */
const notifyPaymentReceived = async (userId, order) => {
  const user = await User.findById(userId);
  if (!user) return null;
  
  // Notify customer
  const customerNotification = await createNotification({
    recipient: userId,
    recipientType: 'customer',
    type: 'payment_received',
    title: '💳 Payment Confirmed',
    message: `Your payment of NPR ${order.totalPrice} for order #${order.orderId} has been confirmed.`,
    relatedOrder: order._id,
    priority: 'high',
    actionUrl: `/orders/${order._id}`,
    email: user.email,
    emailSubject: `Payment Confirmed - ${order.orderId}`
  }, true);

  // Notify admins
  await notifyAllAdmins(
    'payment_received',
    '💰 Payment Received',
    `Payment of NPR ${order.totalPrice} received for order #${order.orderId} via ${order.paymentMethod}.`,
    {
      relatedOrder: order._id,
      actionUrl: `/admin/orders/${order._id}`,
      metadata: { 
        orderId: order.orderId,
        amount: order.totalPrice,
        paymentMethod: order.paymentMethod
      }
    }
  );

  return customerNotification;
};

/**
 * ✅ Notify admins when rider accepts order
 */
const notifyRiderAcceptedOrder = async (order, rider) => {
  await notifyAllAdmins(
    'rider_assigned',
    '🏍️ Rider Accepted Order',
    `Rider ${rider.firstname || rider.name} ${rider.lastname || ''} accepted order #${order.orderId} for delivery.`,
    {
      relatedOrder: order._id,
      relatedUser: rider._id,
      actionUrl: `/admin/orders/${order._id}`,
      metadata: { 
        orderId: order.orderId,
        riderName: `${rider.firstname || rider.name} ${rider.lastname || ''}`,
        riderCode: rider.riderProfile?.riderCode
      },
      priority: 'medium'
    }
  );
};

// ============================================
// EMAIL TEMPLATES
// ============================================

const generateOrderPlacedEmail = (order, user) => {
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
          color: #333;
          margin: 0;
          padding: 0;
          background-color: #f3f4f6;
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
          background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); 
          color: white; 
          padding: 40px 30px; 
          text-align: center;
        }
        .content { 
          padding: 40px 30px;
        }
        .order-details { 
          background: #f9fafb; 
          padding: 24px; 
          border-radius: 8px; 
          margin: 24px 0;
          border: 1px solid #e5e7eb;
        }
        .order-item { 
          display: flex; 
          justify-content: space-between; 
          padding: 12px 0; 
          border-bottom: 1px solid #e5e7eb;
        }
        .order-item:last-child {
          border-bottom: none;
        }
        .total { 
          font-size: 20px; 
          font-weight: bold; 
          color: #22c55e; 
          margin-top: 20px; 
          padding-top: 20px; 
          border-top: 2px solid #22c55e;
          display: flex;
          justify-content: space-between;
        }
        .button { 
          display: inline-block; 
          padding: 14px 32px; 
          background: #22c55e; 
          color: white !important; 
          text-decoration: none; 
          border-radius: 8px; 
          margin-top: 24px;
          font-weight: 600;
        }
        .footer { 
          text-align: center; 
          padding: 30px;
          background: #f9fafb;
          color: #6b7280;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 32px;">🌿 JUMLAYA</h1>
          <p style="margin: 10px 0 0; opacity: 0.9;">Order Confirmation</p>
        </div>
        <div class="content">
          <h2 style="color: #111827; margin-top: 0;">Thank you for your order, ${user.fullName || user.firstname || user.name}!</h2>
          <p style="color: #4b5563;">Your order has been received and is being processed.</p>
          
          <div class="order-details">
            <h3 style="margin-top: 0; color: #111827;">Order Details</h3>
            <p style="margin: 8px 0;"><strong>Order ID:</strong> ${order.orderId}</p>
            <p style="margin: 8px 0;"><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
            <p style="margin: 8px 0;"><strong>Payment Method:</strong> ${order.paymentMethod}</p>
            
            <div style="margin: 20px 0;">
              <h4 style="margin-bottom: 12px; color: #111827;">Items:</h4>
              ${order.items.map(item => `
                <div class="order-item">
                  <span>${item.productName || item.name} × ${item.quantity}</span>
                  <span style="font-weight: 600;">NPR ${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              `).join('')}
            </div>
            
            <div class="total">
              <span>Total:</span>
              <span>NPR ${order.totalPrice.toFixed(2)}</span>
            </div>
          </div>
          
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
            <h4 style="margin-top: 0; color: #111827;">Shipping Address:</h4>
            <p style="margin: 4px 0; color: #4b5563;">${order.shippingAddress.fullName}</p>
            <p style="margin: 4px 0; color: #4b5563;">${order.shippingAddress.addressLine1}</p>
            ${order.shippingAddress.addressLine2 ? `<p style="margin: 4px 0; color: #4b5563;">${order.shippingAddress.addressLine2}</p>` : ''}
            <p style="margin: 4px 0; color: #4b5563;">${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}</p>
          </div>
          
          <div style="text-align: center;">
            <a href="${frontendUrl}/orders/${order._id}" class="button">Track Your Order</a>
          </div>
        </div>
        <div class="footer">
          <p style="margin: 5px 0;"><strong>© ${new Date().getFullYear()} JUMLAYA</strong></p>
          <p style="margin: 5px 0;">Fresh & Organic Products Delivered</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const generateOrderConfirmedEmail = (order, user) => {
  return generateDefaultEmailTemplate({
    title: '✅ Order Confirmed',
    message: `Great news! Your order #${order.orderId} has been confirmed and is being prepared for shipping. We'll notify you once it's on its way.`,
    actionUrl: `/orders/${order._id}`
  });
};

const generateOrderShippedEmail = (order, user) => {
  return generateDefaultEmailTemplate({
    title: '📦 Order Shipped',
    message: `Your order #${order.orderId} is on its way! ${order.trackingNumber ? `Tracking Number: ${order.trackingNumber}` : 'Track your order for delivery updates.'}`,
    actionUrl: `/orders/${order._id}/track`
  });
};

const generateOrderDeliveredEmail = (order, user) => {
  return generateDefaultEmailTemplate({
    title: '🎊 Order Delivered',
    message: `Your order #${order.orderId} has been successfully delivered! We hope you enjoy your organic products. Please consider leaving a review!`,
    actionUrl: `/orders/${order._id}`
  });
};

const generateOrderCancelledEmail = (order, user, reason) => {
  return generateDefaultEmailTemplate({
    title: '❌ Order Cancelled',
    message: `Your order #${order.orderId} has been cancelled. ${reason ? `Reason: ${reason}` : ''} If you have any questions, please contact our support team.`,
    actionUrl: `/orders/${order._id}`
  });
};

module.exports = {
  createNotification,
  notifyAllAdmins,
  notifyOrderPlaced,
  notifyOrderConfirmed,
  notifyOrderShipped,
  notifyOrderOutForDelivery,
  notifyOrderDelivered,
  notifyOrderCancelled,
  notifyOrderReturned,
  notifyPaymentReceived,
  notifyRiderAcceptedOrder
};