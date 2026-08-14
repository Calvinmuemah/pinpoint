const { harvestObservations } = require('../src/scrapers');
const { runLeadProcessingCycle } = require('../src/jobs/lead-processing.job');
const { startScheduler, stopScheduler, triggerManualRun } = require('../src/jobs/cron-scheduler');

describe('Hybrid Automated Scraper & AI Agent Pipeline Test Suite', () => {
  jest.setTimeout(30000);

  it('1. Scraper Aggregator harvests observations across multiple platforms', async () => {
    const keywords = ['Mombasa luxury resort', 'Kenya safari tour'];
    const sources = ['Reddit', 'Twitter', 'TripAdvisor', 'WebSearch'];

    const observations = await harvestObservations(keywords, sources);

    expect(observations).toBeDefined();
    expect(Array.isArray(observations)).toBe(true);
    expect(observations.length).toBeGreaterThan(0);

    const first = observations[0];
    expect(first.source).toBeDefined();
    expect(first.text).toBeDefined();
  });

  it('2. Background Job executes full cycle (Scrapers -> Gemini AI -> Leads)', async () => {
    const stats = await runLeadProcessingCycle();

    expect(stats).toBeDefined();
    expect(typeof stats.usersScanned).toBe('number');
    expect(typeof stats.rawHarvested).toBe('number');
    expect(typeof stats.leadsCreated).toBe('number');
    expect(typeof stats.durationMs).toBe('number');
  });

  it('3. Cron Scheduler starts, triggers manual run, and stops cleanly', async () => {
    const task = startScheduler();
    expect(task).toBeDefined();

    const manualResult = await triggerManualRun();
    expect(['completed', 'busy']).toContain(manualResult.status);

    stopScheduler();
  });
});
