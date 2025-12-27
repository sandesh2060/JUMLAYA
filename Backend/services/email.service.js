// ============================================
// FILE #12: services/email.service.js
// ============================================
const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  async sendEmail(options) {
    try {
      const mailOptions = {
        from: `JUMLAYA <${process.env.EMAIL_USER}>`,
        to: options.to,
        subject: options.subject,
        html: options.html
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email sent to ${options.to}`);
    } catch (error) {
      console.error('❌ Email send error:', error);
    }
  }

  async sendOrderConfirmation(order) {
    await order.populate('user', 'fullName email');
    
    const html = `
      <h2>Order Confirmation</h2>
      <p>Dear ${order.user.fullName},</p>
      <p>Thank you for your order!</p>
      <h3>Order Details:</h3>
      <p><strong>Order ID:</strong> ${order.orderId}</p>
      <p><strong>Total:</strong> NPR ${order.total}</p>
      <p><strong>Payment Method:</strong> ${order.paymentMethod.toUpperCase()}</p>
      <p><strong>Shipping Address:</strong><br>
      ${order.shippingAddress.addressLine1}<br>
      ${order.shippingAddress.city}, ${order.shippingAddress.state}</p>
      <p>We'll send you another email when your order ships.</p>
      <p>Best regards,<br>JUMLAYA Team</p>
    `;

    await this.sendEmail({
      to: order.user.email,
      subject: `Order Confirmation - ${order.orderId}`,
      html: html
    });
  }

  async sendOrderCancellation(order) {
    await order.populate('user', 'fullName email');
    
    const html = `
      <h2>Order Cancelled</h2>
      <p>Dear ${order.user.fullName},</p>
      <p>Your order <strong>${order.orderId}</strong> has been cancelled.</p>
      ${order.cancellationReason ? `<p><strong>Reason:</strong> ${order.cancellationReason}</p>` : ''}
      <p>If you have any questions, please contact us.</p>
      <p>Best regards,<br>JUMLAYA Team</p>
    `;

    await this.sendEmail({
      to: order.user.email,
      subject: `Order Cancelled - ${order.orderId}`,
      html: html
    });
  }

  async sendOrderStatusUpdate(order, newStatus) {
    await order.populate('user', 'fullName email');
    
    const html = `
      <h2>Order Status Update</h2>
      <p>Dear ${order.user.fullName},</p>
      <p>Your order <strong>${order.orderId}</strong> status: <strong>${newStatus}</strong></p>
      ${order.trackingNumber ? `<p><strong>Tracking:</strong> ${order.trackingNumber}</p>` : ''}
      <p>Best regards,<br>JUMLAYA Team</p>
    `;

    await this.sendEmail({
      to: order.user.email,
      subject: `Order ${newStatus} - ${order.orderId}`,
      html: html
    });
  }

  async sendAbandonedCartEmail(cart) {
    await cart.populate('user', 'fullName email');
    await cart.populate('items.product', 'name images price');

    const itemsList = cart.items.map(item => 
      `<li>${item.product.name} - NPR ${item.price} x ${item.quantity}</li>`
    ).join('');

    const html = `
      <h2>You left items in your cart!</h2>
      <p>Hi ${cart.user.fullName},</p>
      <p>We noticed you left these items in your cart:</p>
      <ul>${itemsList}</ul>
      <p><strong>Total:</strong> NPR ${cart.total}</p>
      <p><a href="${process.env.FRONTEND_URL}/cart">Complete your purchase now!</a></p>
      <p>Best regards,<br>JUMLAYA Team</p>
    `;

    await this.sendEmail({
      to: cart.user.email,
      subject: 'Complete Your Purchase - Items Waiting in Cart',
      html: html
    });
  }
}

module.exports = new EmailService();
