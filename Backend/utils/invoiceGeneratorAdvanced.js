// ============================================
// Backend/utils/invoiceGeneratorAdvanced.js
// ENHANCED: PDF Invoice with QR Code Support
// ============================================

const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');

/**
 * Generate professional PDF invoice with QR code
 * @param {Object} order - Order object from database
 * @param {Object} settings - Store settings
 * @returns {PDFDocument} PDF document stream
 */
const generateInvoicePDFWithQR = async (order, settings = {}) => {
  const doc = new PDFDocument({
    size: 'A4',
    margin: 50,
    info: {
      Title: `Invoice #${order.orderId}`,
      Author: settings.storeName || 'JUMLAYA',
      Subject: 'Order Invoice',
      Keywords: 'invoice, order, ecommerce'
    }
  });

  const store = {
    name: settings.storeName || 'JUMLAYA',
    email: settings.storeEmail || 'support@jumlaya.com',
    phone: settings.storePhone || '+977-XXX-XXXX',
    address: settings.storeAddress || 'Kathmandu, Nepal',
    website: 'www.jumlaya.com',
    currency: settings.currency || 'रु',
    taxRate: settings.taxRate || 13
  };

  const primaryColor = '#4F46E5';
  const secondaryColor = '#6B7280';
  const darkColor = '#111827';
  const lightGray = '#F3F4F6';

  let yPosition = 50;

  // ============================================
  // HEADER SECTION
  // ============================================
  
  // Company Logo Placeholder
  doc.roundedRect(50, yPosition, 60, 60, 5)
     .fillAndStroke(primaryColor, primaryColor);
  
  doc.fontSize(24)
     .fillColor('#FFFFFF')
     .text(store.name.charAt(0), 50, yPosition + 15, { width: 60, align: 'center' });

  // Company Info
  doc.fontSize(20)
     .fillColor(primaryColor)
     .text(store.name, 120, yPosition);
  
  doc.fontSize(9)
     .fillColor(secondaryColor)
     .text(store.address, 120, yPosition + 25)
     .text(`${store.email} | ${store.phone}`, 120, yPosition + 40)
     .text(store.website, 120, yPosition + 55);

  // Invoice Title & Number
  doc.fontSize(28)
     .fillColor(primaryColor)
     .text('INVOICE', 400, yPosition, { align: 'right' });
  
  doc.fontSize(10)
     .fillColor(darkColor)
     .text(`#${order.orderId}`, 400, yPosition + 35, { align: 'right' });

  // ============================================
  // QR CODE (Top Right)
  // ============================================
  
  // Generate QR code with order verification URL
  const qrData = JSON.stringify({
    orderId: order.orderId,
    total: order.totalPrice,
    date: order.createdAt,
    verifyUrl: `${store.website}/verify/${order.orderId}`
  });

  try {
    const qrCodeDataURL = await QRCode.toDataURL(qrData, {
      width: 80,
      margin: 1,
      color: {
        dark: primaryColor,
        light: '#FFFFFF'
      }
    });

    // Convert data URL to buffer
    const qrBuffer = Buffer.from(qrCodeDataURL.split(',')[1], 'base64');
    doc.image(qrBuffer, 485, yPosition, { width: 60, height: 60 });
    
    doc.fontSize(7)
       .fillColor(secondaryColor)
       .text('Scan to verify', 485, yPosition + 65, { width: 60, align: 'center' });
  } catch (error) {
    console.error('QR Code generation failed:', error);
  }

  yPosition += 90;

  // Divider
  doc.moveTo(50, yPosition)
     .lineTo(545, yPosition)
     .strokeColor(lightGray)
     .lineWidth(2)
     .stroke();

  yPosition += 30;

  // ============================================
  // INVOICE DETAILS & CUSTOMER INFO
  // ============================================

  // Left Side - Invoice Details
  doc.fontSize(10)
     .fillColor(secondaryColor)
     .text('Invoice Date:', 50, yPosition);
  doc.fillColor(darkColor)
     .text(formatDate(order.createdAt), 150, yPosition);

  yPosition += 20;

  doc.fillColor(secondaryColor)
     .text('Due Date:', 50, yPosition);
  doc.fillColor(darkColor)
     .text(formatDate(getDueDate(order.createdAt)), 150, yPosition);

  yPosition += 20;

  doc.fillColor(secondaryColor)
     .text('Payment Method:', 50, yPosition);
  doc.fillColor(darkColor)
     .text(order.paymentMethod.toUpperCase(), 150, yPosition);

  yPosition += 20;

  doc.fillColor(secondaryColor)
     .text('Payment Status:', 50, yPosition);
  
  const statusColor = getStatusColor(order.paymentStatus);
  doc.roundedRect(150, yPosition - 2, 60, 15, 3)
     .fillAndStroke(statusColor + '20', statusColor);
  doc.fillColor(statusColor)
     .text(order.paymentStatus.toUpperCase(), 150, yPosition, { width: 60, align: 'center' });

  // Right Side - Customer Details
  const rightColumnX = 320;
  yPosition = 220;

  doc.fontSize(12)
     .fillColor(primaryColor)
     .text('BILL TO:', rightColumnX, yPosition);

  yPosition += 20;

  doc.fontSize(10)
     .fillColor(darkColor)
     .font('Helvetica-Bold')
     .text(order.shippingAddress.fullName, rightColumnX, yPosition);

  yPosition += 15;

  doc.font('Helvetica')
     .fillColor(secondaryColor)
     .text(order.shippingAddress.addressLine1, rightColumnX, yPosition, { width: 200 });
  
  if (order.shippingAddress.addressLine2) {
    yPosition += 12;
    doc.text(order.shippingAddress.addressLine2, rightColumnX, yPosition, { width: 200 });
  }

  yPosition += 15;
  doc.text(`${order.shippingAddress.city}, ${order.shippingAddress.state}`, rightColumnX, yPosition);

  yPosition += 15;
  doc.text(order.shippingAddress.postalCode, rightColumnX, yPosition);

  yPosition += 20;
  doc.text(`Phone: ${order.shippingAddress.phone}`, rightColumnX, yPosition);

  if (order.shippingAddress.email) {
    yPosition += 15;
    doc.text(`Email: ${order.shippingAddress.email}`, rightColumnX, yPosition);
  }

  yPosition = 380;

  // ============================================
  // ITEMS TABLE
  // ============================================

  const tableTop = yPosition;
  const itemX = 50;
  const qtyX = 320;
  const priceX = 390;
  const amountX = 480;

  // Header
  doc.rect(50, tableTop, 495, 25)
     .fillAndStroke(primaryColor, primaryColor);

  doc.fontSize(10)
     .fillColor('#FFFFFF')
     .font('Helvetica-Bold')
     .text('ITEM', itemX + 10, tableTop + 8)
     .text('QTY', qtyX + 10, tableTop + 8)
     .text('PRICE', priceX + 10, tableTop + 8)
     .text('AMOUNT', amountX + 10, tableTop + 8, { align: 'right', width: 55 });

  yPosition = tableTop + 35;

  // Items
  doc.font('Helvetica').fillColor(darkColor);

  order.items.forEach((item, index) => {
    if (index % 2 === 0) {
      doc.rect(50, yPosition - 5, 495, 30)
         .fillAndStroke(lightGray, lightGray);
    }

    doc.fontSize(10)
       .fillColor(darkColor)
       .text(item.name, itemX + 10, yPosition, { width: 250, ellipsis: true });

    if (item.sku) {
      doc.fontSize(8)
         .fillColor(secondaryColor)
         .text(`SKU: ${item.sku}`, itemX + 10, yPosition + 12);
    }

    doc.fontSize(10)
       .fillColor(darkColor)
       .text(item.quantity.toString(), qtyX + 10, yPosition, { align: 'center', width: 50 })
       .text(formatPrice(item.price, store.currency), priceX + 10, yPosition)
       .text(formatPrice(item.price * item.quantity, store.currency), amountX + 10, yPosition, { align: 'right', width: 55 });

    yPosition += 30;

    if (yPosition > 700) {
      doc.addPage();
      yPosition = 50;
    }
  });

  doc.moveTo(50, yPosition + 5)
     .lineTo(545, yPosition + 5)
     .strokeColor(primaryColor)
     .lineWidth(2)
     .stroke();

  yPosition += 30;

  // ============================================
  // TOTALS SECTION
  // ============================================

  const totalsX = 350;

  doc.fontSize(10)
     .fillColor(secondaryColor)
     .text('Subtotal:', totalsX, yPosition);
  doc.fillColor(darkColor)
     .text(formatPrice(order.itemsPrice, store.currency), totalsX + 100, yPosition, { align: 'right', width: 95 });

  yPosition += 20;

  doc.fillColor(secondaryColor)
     .text(`Tax (${store.taxRate}%):`, totalsX, yPosition);
  doc.fillColor(darkColor)
     .text(formatPrice(order.taxPrice, store.currency), totalsX + 100, yPosition, { align: 'right', width: 95 });

  yPosition += 20;

  doc.fillColor(secondaryColor)
     .text('Shipping:', totalsX, yPosition);
  doc.fillColor(darkColor)
     .text(order.shippingPrice > 0 ? formatPrice(order.shippingPrice, store.currency) : 'FREE', totalsX + 100, yPosition, { align: 'right', width: 95 });

  yPosition += 20;

  if (order.discountAmount > 0) {
    doc.fillColor(secondaryColor)
       .text('Discount:', totalsX, yPosition);
    doc.fillColor('#DC2626')
       .text(`-${formatPrice(order.discountAmount, store.currency)}`, totalsX + 100, yPosition, { align: 'right', width: 95 });
    yPosition += 20;
  }

  doc.moveTo(totalsX, yPosition)
     .lineTo(545, yPosition)
     .strokeColor(primaryColor)
     .lineWidth(1)
     .stroke();

  yPosition += 15;

  doc.fontSize(14)
     .fillColor(primaryColor)
     .font('Helvetica-Bold')
     .text('TOTAL:', totalsX, yPosition);
  doc.fontSize(16)
     .text(formatPrice(order.totalPrice, store.currency), totalsX + 100, yPosition, { align: 'right', width: 95 });

  yPosition += 50;

  // ============================================
  // NOTES & TERMS
  // ============================================

  if (order.notes || order.couponCode) {
    doc.fontSize(10)
       .font('Helvetica-Bold')
       .fillColor(primaryColor)
       .text('NOTES:', 50, yPosition);

    yPosition += 15;

    doc.font('Helvetica')
       .fontSize(9)
       .fillColor(secondaryColor);

    if (order.couponCode) {
      doc.text(`Coupon Applied: ${order.couponCode}`, 50, yPosition);
      yPosition += 15;
    }

    if (order.notes) {
      doc.text(order.notes, 50, yPosition, { width: 495 });
      yPosition += 30;
    }
  }

  yPosition += 20;

  doc.fontSize(10)
     .font('Helvetica-Bold')
     .fillColor(primaryColor)
     .text('TERMS & CONDITIONS:', 50, yPosition);

  yPosition += 15;

  const terms = [
    'Payment is due within 7 days of invoice date.',
    'Please include invoice number with payment.',
    'For questions, contact our support team.',
    'Thank you for your business!'
  ];

  doc.font('Helvetica')
     .fontSize(8)
     .fillColor(secondaryColor);

  terms.forEach(term => {
    doc.text(`• ${term}`, 50, yPosition);
    yPosition += 12;
  });

  // ============================================
  // FOOTER
  // ============================================

  const footerY = 780;
  doc.rect(0, footerY, 595, 50)
     .fillAndStroke(primaryColor, primaryColor);

  doc.fontSize(9)
     .fillColor('#FFFFFF')
     .text(`Generated on ${formatDate(new Date())} | ${store.name} | ${store.website}`, 50, footerY + 20, { align: 'center', width: 495 });

  return doc;
};

// Helper functions (same as before)
const formatDate = (date) => {
  const d = new Date(date);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
};

const getDueDate = (date) => {
  const d = new Date(date);
  d.setDate(d.getDate() + 7);
  return d;
};

const formatPrice = (amount, currency = 'रु') => {
  return `${currency} ${amount.toLocaleString('en-NP', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const getStatusColor = (status) => {
  const colors = {
    'Pending': '#F59E0B',
    'Paid': '#10B981',
    'Failed': '#EF4444',
    'Refunded': '#6B7280'
  };
  return colors[status] || '#6B7280';
};

module.exports = { generateInvoicePDFWithQR };