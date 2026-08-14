const cron = require('node-cron');
const { runLeadProcessingCycle } = require('./lead-processing.job');

let scheduledTask = null;
let isJobRunning = false;

/**
 * Initializes and starts the 24/7 background cron job
 */
const startScheduler = () => {
  // Default: Run every 15 minutes ('*/15 * * * *')
  // In development, can be configured via CRON_SCHEDULE in .env
  const cronExpression = process.env.CRON_SCHEDULE || '*/15 * * * *';

  if (!cron.validate(cronExpression)) {
    console.error(`❌ [Cron Scheduler] Invalid cron expression: "${cronExpression}"`);
    return;
  }

  console.log(`⏰ [Cron Scheduler] Initialized 24/7 Automated Scraper & AI Agent (Schedule: "${cronExpression}")`);

  scheduledTask = cron.schedule(cronExpression, async () => {
    if (isJobRunning) {
      console.log('⚠️ [Cron Scheduler] Previous cycle is still active. Skipping tick.');
      return;
    }

    isJobRunning = true;
    try {
      await runLeadProcessingCycle();
    } catch (err) {
      console.error('❌ [Cron Scheduler Error]:', err.message);
    } finally {
      isJobRunning = false;
    }
  });

  return scheduledTask;
};

const stopScheduler = () => {
  if (scheduledTask) {
    scheduledTask.stop();
    console.log('🛑 [Cron Scheduler] Background lead harvesting job stopped.');
  }
};

const triggerManualRun = async () => {
  if (isJobRunning) {
    return { status: 'busy', message: 'A cycle is currently running' };
  }

  isJobRunning = true;
  try {
    const stats = await runLeadProcessingCycle();
    return { status: 'completed', ...stats };
  } finally {
    isJobRunning = false;
  }
};

module.exports = {
  startScheduler,
  stopScheduler,
  triggerManualRun,
};
