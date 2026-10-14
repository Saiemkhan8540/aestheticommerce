const cron = require("node-cron");
const { runBadgeAutomation } = require("../services/badgeAutomationService");

/**
 * Initializes the Badge Automation Cron Job.
 * Runs every day at midnight (00:00).
 */
const initBadgeCron = () => {
  // Schedule: Minute Hour DayOfMonth Month DayOfWeek
  // 0 0 * * * = Midnight every day
   // runBadgeAutomation(); // Immediate run on server start
  cron.schedule("0 0 * * *", async () => { 
    try {
      await runBadgeAutomation();
    } catch (error) {
      console.error("[CRON ERROR] Failed to execute Badge Automation:", error);
    }
  }, {
    scheduled: true,
    timezone: "UTC"
  });

  console.log("---  Badge Automation Cron Job Initialized (Midnight Daily) ---");
};

module.exports = { initBadgeCron };
