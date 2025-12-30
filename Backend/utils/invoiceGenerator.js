// ============================================
// Backend/utils/invoiceGenerator.js
// PROFESSIONAL PDF Invoice Generator - COMPLETE
// GREEN THEME | LEGALLY COMPLETE
// ============================================

const PDFDocument = require('pdfkit');

/**
 * Generate a professional PDF invoice with complete database data
 */
const generateInvoicePDF = (order, settings = {}) => {
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 50, bottom: 50, left: 50, right: 50 },
    info: {
      Title: `Invoice #${order.orderId}`,
      Author: settings.storeName || 'JUMLAYA',
      Subject: 'Tax Invoice'
    }
  });

  // ============================================
  // STORE SETTINGS
  // ============================================
  const store = {
    name: settings.storeName || 'JUMLAYA',
    email: settings.storeEmail || 'info@jumlaya.com',
    phone: settings.storePhone || '+977-9800000000',
    address: settings.storeAddress || 'Kathmandu, Nepal',
    website: 'www.jumlaya.com',

    currency: settings.currency || 'रु',
    taxRate: settings.taxRate || 13,

    returnPolicy:
      settings.returnPolicy ||
      'Items can be returned within 7 days of delivery. Items must be unused and in original packaging.',

    shippingPolicy:
      settings.shippingPolicy ||
      'Free shipping on orders above रु 2000. Delivery takes 3–5 working days.'
  };

  // ============================================
  // GREEN COLOR PALETTE
  // ============================================
  const colors = {
    primary: '#15803D',
    secondary: '#22C55E',
    success: '#16A34A',
    warning: '#FACC15',
    danger: '#DC2626',
    dark: '#14532D',
    medium: '#4B5563',
    light: '#ECFDF5',
    white: '#FFFFFF'
  };

  let y = 60;

  // ============================================
  // HEADER
  // ============================================
  doc.roundedRect(50, y, 80, 80, 8)
     .fillAndStroke(colors.primary, colors.primary);

  doc.fontSize(36)
     .fillColor(colors.white)
     .font('Helvetica-Bold')
     .text(store.name.charAt(0), 50, y + 20, { width: 80, align: 'center' });

  doc.fontSize(24)
     .fillColor(colors.primary)
     .font('Helvetica-Bold')
     .text(store.name, 145, y);

  doc.fontSize(9)
     .fillColor(colors.medium)
     .font('Helvetica')
     .text(store.address, 145, y + 30)
     .text(`Email: ${store.email}`, 145, y + 42)
     .text(`Phone: ${store.phone}`, 145, y + 54)
     .text(`Website: ${store.website}`, 145, y + 66);

  doc.fontSize(30)
     .fillColor(colors.primary)
     .font('Helvetica-Bold')
     .text('TAX INVOICE', 380, 60, { align: 'right', width: 165 });

  doc.fontSize(11)
     .fillColor(colors.dark)
     .text(`#${order.orderId}`, 380, 95, { align: 'right', width: 165 });

  y = 160;

  doc.moveTo(50, y).lineTo(545, y).strokeColor(colors.secondary).lineWidth(3).stroke();
  y += 25;

  // ============================================
  // INVOICE DETAILS
  // ============================================
  doc.roundedRect(50, y, 240, 110, 5).fillAndStroke(colors.light, colors.light);

  doc.fontSize(11)
     .fillColor(colors.primary)
     .font('Helvetica-Bold')
     .text('INVOICE DETAILS', 65, y + 15);

  const details = [
    ['Invoice Date:', formatDate(order.createdAt)],
    ['Payment Method:', order.paymentMethod.toUpperCase()],
    ['Payment Status:', order.paymentStatus.toUpperCase()]
  ];

  details.forEach((d, i) => {
    doc.fontSize(9)
       .fillColor(colors.medium)
       .font('Helvetica')
       .text(d[0], 65, y + 40 + i * 20);
    doc.fillColor(colors.dark)
       .font('Helvetica-Bold')
       .text(d[1], 170, y + 40 + i * 20);
  });

  // ============================================
  // BILL TO
  // ============================================
  doc.roundedRect(320, y, 225, 110, 5).fillAndStroke(colors.light, colors.light);

  doc.fontSize(11)
     .fillColor(colors.primary)
     .font('Helvetica-Bold')
     .text('BILL TO', 335, y + 15);

  doc.fontSize(11)
     .fillColor(colors.dark)
     .font('Helvetica-Bold')
     .text(order.shippingAddress.fullName, 335, y + 40);

  doc.fontSize(9)
     .fillColor(colors.medium)
     .font('Helvetica')
     .text(order.shippingAddress.addressLine1, 335, y + 58)
     .text(order.shippingAddress.city, 335, y + 70)
     .text(`Phone: ${order.shippingAddress.phone}`, 335, y + 82);

  y = 320;

  // ============================================
  // ITEMS TABLE
  // ============================================
  doc.rect(50, y, 495, 30).fillAndStroke(colors.primary, colors.primary);

  doc.fontSize(10)
     .fillColor(colors.white)
     .font('Helvetica-Bold')
     .text('ITEM', 60, y + 10)
     .text('QTY', 330, y + 10)
     .text('PRICE', 395, y + 10)
     .text('TOTAL', 465, y + 10);

  y += 40;

  order.items.forEach((item, i) => {
    if (i % 2 === 0) {
      doc.rect(50, y - 5, 495, 30).fill(colors.light);
    }

    doc.fontSize(9).fillColor(colors.dark).font('Helvetica-Bold')
       .text(item.name, 60, y, { width: 250 });

    doc.font('Helvetica')
       .text(item.quantity.toString(), 330, y)
       .text(formatPrice(item.price, store.currency), 395, y)
       .text(formatPrice(item.price * item.quantity, store.currency), 465, y);

    y += 30;
  });

  y += 15;

  // ============================================
  // TOTALS
  // ============================================
  doc.fontSize(10)
     .fillColor(colors.medium)
     .text('Subtotal:', 360, y);
  doc.fillColor(colors.dark)
     .text(formatPrice(order.itemsPrice, store.currency), 465, y);

  y += 18;
  doc.fillColor(colors.medium)
     .text(`Tax (${store.taxRate}%):`, 360, y);
  doc.fillColor(colors.dark)
     .text(formatPrice(order.taxPrice, store.currency), 465, y);

  y += 18;
  doc.fillColor(colors.medium)
     .text('Shipping:', 360, y);
  doc.fillColor(colors.success)
     .font('Helvetica-Bold')
     .text(order.shippingPrice > 0 ? formatPrice(order.shippingPrice, store.currency) : 'FREE', 465, y);

  y += 22;

// ✅ TOTAL (NO BACKGROUND)
doc.fontSize(14)
   .fillColor(colors.medium)
   .font('Helvetica-Bold')
   .text('TOTAL:', 360, y + 7);

doc.fontSize(16)
   .fillColor(colors.dark)
   .text(formatPrice(order.totalPrice, store.currency), 465, y + 7);

y += 55;


  // ============================================
  // POLICIES
  // ============================================
  doc.fontSize(11)
     .fillColor(colors.primary)
     .font('Helvetica-Bold')
     .text('RETURN POLICY', 50, y);

  doc.fontSize(9)
     .fillColor(colors.medium)
     .font('Helvetica')
     .text(store.returnPolicy, 50, y + 15, { width: 240 });

  doc.fontSize(11)
     .fillColor(colors.primary)
     .font('Helvetica-Bold')
     .text('SHIPPING POLICY', 305, y);

  doc.fontSize(9)
     .fillColor(colors.medium)
     .text(store.shippingPolicy, 305, y + 15, { width: 240 });

  // ============================================
  // FOOTER
  // ============================================
  const footerY = 750;

  doc.rect(0, footerY, 595, 92)
     .fillAndStroke(colors.primary, colors.primary);

  doc.fontSize(14)
     .fillColor(colors.white)
     .font('Helvetica-Bold')
     .text('Thank you for shopping with us!', 50, footerY + 18, {
       width: 495,
       align: 'center'
     });

  doc.fontSize(9)
     .font('Helvetica')
     .text(
       `Support: ${store.email} | ${store.phone}`,
       50,
       footerY + 42,
       { width: 495, align: 'center' }
     );

  doc.fontSize(7)
     .fillColor(colors.white + 'AA')
     .text(
       `Invoice generated on ${formatDate(new Date())}`,
       50,
       footerY + 64,
       { width: 495, align: 'center' }
     );

  return doc;
};

// ============================================
// HELPERS
// ============================================

const formatDate = (date) => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatPrice = (amount, currency) =>
  `${currency} ${amount.toLocaleString('en-NP', { minimumFractionDigits: 2 })}`;

module.exports = { generateInvoicePDF };
