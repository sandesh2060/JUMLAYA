const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // 16-char Gmail App Password
  },
});

const sendEmail = async ({ email, to, subject, text, html }) => {
  try {
    // Use 'email' if provided, otherwise fall back to 'to'
    const recipient = email || to;
    
    if (!recipient) {
      throw new Error('No recipient email address provided');
    }

    const info = await transporter.sendMail({
      from: `"Jumlaya Web Support" <${process.env.EMAIL_USER}>`,
      to: recipient,
      subject,
      text,
      html,
    });

    console.log("Email sent:", info.response);
    return true;
  } catch (error) {
    console.error("Email sending failed:", error);
    throw error; // Re-throw so controller can catch it
  }
};

module.exports = sendEmail;