const cron = require("node-cron");
const { processRecurringPayments } = require("../controllers/paymentController");

const scheduleDailyPayments = () => {
  cron.schedule("0 10 * * *", processRecurringPayments, {
    scheduled: true,
    timezone: "Asia/Kolkata",
  });
};

module.exports = scheduleDailyPayments;
