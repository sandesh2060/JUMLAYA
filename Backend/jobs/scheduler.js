const cron = require('node-cron');
const cleanupExpiredCarts = require('./jobs/cleanupExpiredCarts');
const sendAbandonedCartEmails = require('./jobs/sendAbandonedCartEmails');
const updateInventory = require('./jobs/updateInventory');

// Clean up expired carts daily at 2 AM
cron.schedule('0 2 * * *', async () => {
  console.log('⏰ Running scheduled cart cleanup...');
  await cleanupExpiredCarts();
});

// Send abandoned cart emails daily at 10 AM
cron.schedule('0 10 * * *', async () => {
  console.log('⏰ Running abandoned cart email job...');
  await sendAbandonedCartEmails(1); // 1 day inactive
});

// Update inventory every 6 hours
cron.schedule('0 */6 * * *', async () => {
  console.log('⏰ Running inventory sync...');
  await updateInventory();
});

console.log('✅ Background jobs scheduled');
