const { harvestObservations } = require('../src/scrapers');
const { startScheduler, stopScheduler, triggerManualRun } = require('../src/jobs/cron-scheduler');

describe('Hybrid Automated Scraper & AI Agent Pipeline Test Suite', () => {
  jest.setTimeout(45000);

  it('1. Scraper Aggregator harvests observations across all 6 live platforms', async () => {
    const keywords = ['Mombasa luxury resort'];
    const sources = ['Reddit', 'Twitter', 'TripAdvisor', 'Facebook', 'Instagram', 'WebSearch'];

    const observations = await harvestObservations(keywords, sources);

    expect(observations).toBeDefined();
    expect(Array.isArray(observations)).toBe(true);
    expect(observations.length).toBeGreaterThan(0);

    const first = observations[0];
    expect(first.source).toBeDefined();
    expect(first.text).toBeDefined();
    expect(first.url).toBeDefined();
  });

  it('2. Cron Scheduler starts, triggers manual run, and stops cleanly', async () => {
    const task = startScheduler();
    expect(task).toBeDefined();

    const manualResult = await triggerManualRun();
    expect(['completed', 'busy']).toContain(manualResult.status);

    stopScheduler();
  });
});
