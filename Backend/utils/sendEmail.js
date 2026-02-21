// const nodemailer = require("nodemailer");

// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS, // 16-char Gmail App Password
//   },
// });

// const sendEmail = async ({ email, to, subject, text, html }) => {
//   try {
//     // Use 'email' if provided, otherwise fall back to 'to'
//     const recipient = email || to;
    
//     if (!recipient) {
//       throw new Error('No recipient email address provided');
//     }

//     const info = await transporter.sendMail({
//       from: `"Jumlaya Web Support" <${process.env.EMAIL_USER}>`,
//       to: recipient,
//       subject,
//       text,
//       html,
//     });

//     console.log("Email sent:", info.response);
//     return true;
//   } catch (error) {
//     console.error("Email sending failed:", error);
//     throw error; // Re-throw so controller can catch it
//   }
// };

// module.exports = sendEmail;

// ============================================
// Backend/utils/sendEmail.js
// 🚫 EMAIL DISABLED TEMPORARILY - logs only
// ============================================

// const nodemailer = require("nodemailer");

// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

const sendEmail = async ({ email, to, subject, text, html }) => {
  const recipient = email || to;
  // 🚫 EMAIL DISABLED: Just log instead of sending
  console.log(`📧 [EMAIL DISABLED] Would send to: ${recipient} | Subject: ${subject}`);
  return true; // Always succeed so nothing breaks
};

module.exports = sendEmail;