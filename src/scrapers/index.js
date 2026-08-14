const redditScraper = require('./reddit.scraper');
const twitterScraper = require('./twitter.scraper');
const tripadvisorScraper = require('./tripadvisor.scraper');
const webScraper = require('./web.scraper');

const scrapers = {
  Reddit: redditScraper,
  Twitter: twitterScraper,
  TripAdvisor: tripadvisorScraper,
  WebSearch: webScraper,
};

/**
 * Harvests raw posts across multiple platforms for given keywords
 */
const harvestObservations = async (keywords = [], enabledSources = ['Reddit', 'Twitter', 'TripAdvisor', 'WebSearch']) => {
  console.log(`🌐 [Harvest Pipeline] Scraping ${enabledSources.join(', ')} for ${keywords.length} keywords...`);
  
  const allObservations = [];

  for (const sourceName of enabledSources) {
    const scraper = scrapers[sourceName];
    if (!scraper) continue;

    for (const kw of keywords) {
      try {
        const posts = await scraper.scrape(kw);
        allObservations.push(...posts);
      } catch (err) {
        console.error(`❌ [Scraper Error - ${sourceName}] for "${kw}":`, err.message);
      }
    }
  }

  return allObservations;
};

module.exports = {
  scrapers,
  harvestObservations,
};
