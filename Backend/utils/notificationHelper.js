// ============================================
// Backend/utils/notificationHelper.js
// ✅ FIXED - Email sending with proper error handling
// ============================================

const Notification = require('../models/notification.model');
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
        console.error('Email error details:', emailError);
        // Don't fail the notification if email fails
        // Notification is still created in the database
      }
    } else {
      if (!data.email) {
        console.log('⚠️ No email provided for notification:', data.titleKey || data.title);
      }
    }
    
    return notification;
  } catch (error) {
    console.error('❌ Error creating notification:', error);
    throw error; // Re-throw to let caller handle
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
        .divider {
          height: 1px;
          background: #e5e7eb;
          margin: 24px 0;
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
          <p style="margin-top: 16px; font-size: 12px;">
            You received this email because you have an account with JUMLAYA.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// ============================================
// ORDER NOTIFICATIONS
// ============================================

/**
 * Notify user when order is placed
 */
const notifyOrderPlaced = async (userId, order) => {
  const User = require('../models/user.model');
  const user = await User.findById(userId);
  
  if (!user) {
    console.error('❌ User not found for notification:', userId);
    return null;
  }
  
  console.log('📧 Creating order placed notification for:', user.email);
  
  return createNotification({
    recipient: userId,
    recipientType: 'customer',
    type: 'order_placed',
    titleKey: 'notifications.orders.placed.title',
    messageKey: 'notifications.orders.placed.message',
    messageParams: {
      orderId: order.orderId,
      total: order.totalPrice
    },
    title: '🎉 Order Placed Successfully!',
    message: `Your order #${order.orderId} has been placed successfully. Total: NPR ${order.totalPrice}. We'll notify you once it's confirmed.`,
    relatedOrder: order._id,
    priority: 'high',
    actionUrl: `/orders/${order._id}`,
    email: user.email,
    emailSubject: `Order Confirmation - ${order.orderId}`,
    emailHtml: generateOrderPlacedEmail(order, user)
  }, true); // Enable email sending
};

/**
 * Notify user when order is confirmed
 */
const notifyOrderConfirmed = async (userId, order) => {
  const User = require('../models/user.model');
  const user = await User.findById(userId);
  
  if (!user) return null;
  
  return createNotification({
    recipient: userId,
    recipientType: 'customer',
    type: 'order_confirmed',
    titleKey: 'notifications.orders.confirmed.title',
    messageKey: 'notifications.orders.confirmed.message',
    messageParams: {
      orderId: order.orderId
    },
    title: '✅ Order Confirmed',
    message: `Your order #${order.orderId} has been confirmed and is being prepared for shipping.`,
    relatedOrder: order._id,
    priority: 'high',
    actionUrl: `/orders/${order._id}`,
    email: user.email,
    emailSubject: `Order Confirmed - ${order.orderId}`,
    emailHtml: generateOrderConfirmedEmail(order, user)
  }, true);
};

/**
 * Notify user when order is shipped
 */
const notifyOrderShipped = async (userId, order) => {
  const User = require('../models/user.model');
  const user = await User.findById(userId);
  
  if (!user) return null;
  
  return createNotification({
    recipient: userId,
    recipientType: 'customer',
    type: 'order_shipped',
    titleKey: 'notifications.orders.shipped.title',
    messageKey: 'notifications.orders.shipped.message',
    messageParams: {
      orderId: order.orderId
    },
    title: '📦 Order Shipped',
    message: `Your order #${order.orderId} has been shipped! Track your package for delivery updates.`,
    relatedOrder: order._id,
    priority: 'high',
    actionUrl: `/orders/${order._id}/track`,
    email: user.email,
    emailSubject: `Order Shipped - ${order.orderId}`,
    emailHtml: generateOrderShippedEmail(order, user)
  }, true);
};

/**
 * Notify user when order is delivered
 */
const notifyOrderDelivered = async (userId, order) => {
  const User = require('../models/user.model');
  const user = await User.findById(userId);
  
  if (!user) return null;
  
  return createNotification({
    recipient: userId,
    recipientType: 'customer',
    type: 'order_delivered',
    titleKey: 'notifications.orders.delivered.title',
    messageKey: 'notifications.orders.delivered.message',
    messageParams: {
      orderId: order.orderId
    },
    title: '🎊 Order Delivered',
    message: `Your order #${order.orderId} has been delivered! Thank you for shopping with us.`,
    relatedOrder: order._id,
    priority: 'high',
    actionUrl: `/orders/${order._id}`,
    email: user.email,
    emailSubject: `Order Delivered - ${order.orderId}`,
    emailHtml: generateOrderDeliveredEmail(order, user)
  }, true);
};

/**
 * Notify user when order is cancelled
 */
const notifyOrderCancelled = async (userId, order, reason = '') => {
  const User = require('../models/user.model');
  const user = await User.findById(userId);
  
  if (!user) return null;
  
  return createNotification({
    recipient: userId,
    recipientType: 'customer',
    type: 'order_cancelled',
    titleKey: 'notifications.orders.cancelled.title',
    messageKey: 'notifications.orders.cancelled.message',
    messageParams: {
      orderId: order.orderId,
      reason: reason || 'If you have any questions, please contact support.'
    },
    title: '❌ Order Cancelled',
    message: `Your order #${order.orderId} has been cancelled. ${reason || 'If you have any questions, please contact support.'}`,
    relatedOrder: order._id,
    priority: 'medium',
    actionUrl: `/orders/${order._id}`,
    email: user.email,
    emailSubject: `Order Cancelled - ${order.orderId}`,
    emailHtml: generateOrderCancelledEmail(order, user, reason)
  }, true);
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
          <h2 style="color: #111827; margin-top: 0;">Thank you for your order, ${user.fullName || user.firstname}!</h2>
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
  notifyOrderPlaced,
  notifyOrderConfirmed,
  notifyOrderShipped,
  notifyOrderDelivered,
  notifyOrderCancelled
};