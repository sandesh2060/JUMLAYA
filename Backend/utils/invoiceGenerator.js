// ============================================
// Backend/utils/invoiceGenerator.js
// PROFESSIONAL PDF Invoice Generator - SINGLE PAGE
// GREEN THEME | OPTIMIZED LAYOUT
// ============================================

const PDFDocument = require('pdfkit');

/**
 * Generate a professional PDF invoice with complete database data
 */
const generateInvoicePDF = (order, settings = {}) => {
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 30, bottom: 30, left: 50, right: 50 },
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
      'Items can be returned within 7 days of delivery in original packaging.',
    shippingPolicy:
      settings.shippingPolicy ||
      'Free shipping on orders above रु 2000. Delivery 3–5 working days.'
  };

  // ============================================
  // GREEN COLOR PALETTE
  // ============================================
  const colors = {
    primary: '#15803D',
    secondary: '#22C55E',
    success: '#16A34A',
    dark: '#14532D',
    medium: '#4B5563',
    light: '#ECFDF5',
    white: '#FFFFFF'
  };

  let y = 40;

  // ============================================
  // HEADER - ULTRA COMPACT
  // ============================================
  doc.roundedRect(50, y, 50, 50, 5).fillAndStroke(colors.primary, colors.primary);

  doc.fontSize(24)
     .fillColor(colors.white)
     .font('Helvetica-Bold')
     .text(store.name.charAt(0), 50, y + 13, { width: 50, align: 'center' });

  doc.fontSize(18)
     .fillColor(colors.primary)
     .font('Helvetica-Bold')
     .text(store.name, 115, y + 3);

  doc.fontSize(7.5)
     .fillColor(colors.medium)
     .font('Helvetica')
     .text(`${store.address} | ${store.email} | ${store.phone}`, 115, y + 24)
     .text(store.website, 115, y + 36);

  doc.fontSize(22)
     .fillColor(colors.primary)
     .font('Helvetica-Bold')
     .text('TAX INVOICE', 400, y, { align: 'right', width: 145 });

  doc.fontSize(9)
     .fillColor(colors.dark)
     .font('Helvetica')
     .text(`#${order.orderId}`, 400, y + 28, { align: 'right', width: 145 });

  y = 105;

  doc.moveTo(50, y).lineTo(545, y).strokeColor(colors.secondary).lineWidth(2).stroke();
  y += 12;

  // ============================================
  // INVOICE DETAILS & BILL TO - ULTRA COMPACT
  // ============================================
  doc.roundedRect(50, y, 235, 70, 4).fillAndStroke(colors.light, colors.light);

  doc.fontSize(9)
     .fillColor(colors.primary)
     .font('Helvetica-Bold')
     .text('INVOICE DETAILS', 60, y + 8);

  const details = [
    ['Date:', formatDate(order.createdAt)],
    ['Payment:', order.paymentMethod.toUpperCase()],
    ['Status:', order.paymentStatus.toUpperCase()]
  ];

  details.forEach((d, i) => {
    doc.fontSize(7.5)
       .fillColor(colors.medium)
       .font('Helvetica')
       .text(d[0], 60, y + 24 + i * 14);
    doc.fillColor(colors.dark)
       .font('Helvetica-Bold')
       .text(d[1], 135, y + 24 + i * 14);
  });

  doc.roundedRect(310, y, 235, 70, 4).fillAndStroke(colors.light, colors.light);

  doc.fontSize(9)
     .fillColor(colors.primary)
     .font('Helvetica-Bold')
     .text('BILL TO', 320, y + 8);

  doc.fontSize(9)
     .fillColor(colors.dark)
     .font('Helvetica-Bold')
     .text(order.shippingAddress.fullName, 320, y + 24);

  doc.fontSize(7.5)
     .fillColor(colors.medium)
     .font('Helvetica')
     .text(order.shippingAddress.addressLine1, 320, y + 38, { width: 220, lineGap: -1 })
     .text(`${order.shippingAddress.city} | ${order.shippingAddress.phone}`, 320, y + 54);

  y = 200;

  // ============================================
  // ITEMS TABLE - OPTIMIZED
  // ============================================
  doc.rect(50, y, 495, 22).fillAndStroke(colors.primary, colors.primary);

  doc.fontSize(8.5)
     .fillColor(colors.white)
     .font('Helvetica-Bold')
     .text('ITEM', 58, y + 7)
     .text('QTY', 345, y + 7)
     .text('PRICE', 410, y + 7)
     .text('TOTAL', 480, y + 7);

  y += 26;

  const maxItems = 6; // Reduced to 6 items max
  const itemsToShow = order.items.slice(0, maxItems);

  itemsToShow.forEach((item, i) => {
    if (i % 2 === 0) {
      doc.rect(50, y - 3, 495, 22).fill(colors.light);
    }

    doc.fontSize(8)
       .fillColor(colors.dark)
       .font('Helvetica-Bold')
       .text(item.name, 58, y, { width: 275, ellipsis: true });

    doc.font('Helvetica')
       .text(item.quantity.toString(), 345, y)
       .text(formatPrice(item.price, store.currency), 410, y)
       .text(formatPrice(item.price * item.quantity, store.currency), 480, y);

    y += 22;
  });

  if (order.items.length > maxItems) {
    doc.fontSize(7.5)
       .fillColor(colors.medium)
       .font('Helvetica-Oblique')
       .text(`+ ${order.items.length - maxItems} more items`, 58, y);
    y += 22;
  }

  y += 8;

  // ============================================
  // TOTALS - COMPACT
  // ============================================
  const totalsX = 385;

  doc.fontSize(8.5)
     .fillColor(colors.medium)
     .font('Helvetica')
     .text('Subtotal:', totalsX, y);
  doc.fillColor(colors.dark)
     .text(formatPrice(order.itemsPrice, store.currency), 480, y);

  y += 14;
  doc.fillColor(colors.medium)
     .text(`Tax (${store.taxRate}%):`, totalsX, y);
  doc.fillColor(colors.dark)
     .text(formatPrice(order.taxPrice, store.currency), 480, y);

  y += 14;
  doc.fillColor(colors.medium)
     .text('Shipping:', totalsX, y);
  doc.fillColor(colors.success)
     .font('Helvetica-Bold')
     .text(order.shippingPrice > 0 ? formatPrice(order.shippingPrice, store.currency) : 'FREE', 480, y);

  y += 18;

  // Total with subtle background
  doc.roundedRect(totalsX - 8, y - 2, 160, 26, 4).fillAndStroke(colors.light, colors.secondary);

  doc.fontSize(11)
     .fillColor(colors.primary)
     .font('Helvetica-Bold')
     .text('TOTAL:', totalsX, y + 5);

  doc.fontSize(13)
     .fillColor(colors.dark)
     .text(formatPrice(order.totalPrice, store.currency), 480, y + 5);

  y += 38;

  // ============================================
  // POLICIES - COMPACT
  // ============================================
  doc.fontSize(8.5)
     .fillColor(colors.primary)
     .font('Helvetica-Bold')
     .text('RETURN POLICY', 50, y);

  doc.fontSize(7)
     .fillColor(colors.medium)
     .font('Helvetica')
     .text(store.returnPolicy, 50, y + 11, { width: 235, lineGap: 0 });

  doc.fontSize(8.5)
     .fillColor(colors.primary)
     .font('Helvetica-Bold')
     .text('SHIPPING POLICY', 310, y);

  doc.fontSize(7)
     .fillColor(colors.medium)
     .font('Helvetica')
     .text(store.shippingPolicy, 310, y + 11, { width: 235, lineGap: 0 });

  y += 45;

  // ============================================
  // FOOTER - POSITIONED BASED ON CONTENT
  // ============================================
  // Calculate footer position (ensure it doesn't overflow)
  const footerHeight = 70;
  const pageHeight = 842; // A4 height in points
  const footerY = Math.min(y + 20, pageHeight - footerHeight - 30);

  doc.rect(0, footerY, 595, footerHeight).fillAndStroke(colors.primary, colors.primary);

  doc.fontSize(12)
     .fillColor(colors.white)
     .font('Helvetica-Bold')
     .text('Thank you for shopping with us!', 50, footerY + 14, {
       width: 495,
       align: 'center'
     });

  doc.fontSize(8)
     .font('Helvetica')
     .text(`${store.email} | ${store.phone}`, 50, footerY + 34, {
       width: 495,
       align: 'center'
     });

  doc.fontSize(6.5)
     .fillColor('#FFFFFF99')
     .text(`Invoice generated on ${formatDate(new Date())}`, 50, footerY + 52, {
       width: 495,
       align: 'center'
     });

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