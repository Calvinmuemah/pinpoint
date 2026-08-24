const redditScraper = require('./reddit.scraper');
const twitterScraper = require('./twitter.scraper');
const tripadvisorScraper = require('./tripadvisor.scraper');
const facebookScraper = require('./facebook.scraper');
const instagramScraper = require('./instagram.scraper');
const webScraper = require('./web.scraper');

const scrapers = {
  Reddit: redditScraper,
  Twitter: twitterScraper,
  TripAdvisor: tripadvisorScraper,
  Facebook: facebookScraper,
  Instagram: instagramScraper,
  WebSearch: webScraper,
};

/**
 * Harvests real live posts across enabled social and web platforms
 */
const harvestObservations = async (
  keywords = [],
  enabledSources = ['Reddit', 'Twitter', 'TripAdvisor', 'Facebook', 'Instagram', 'WebSearch']
) => {
  console.log(`🌐 [Live Harvest Pipeline] Scraping ${enabledSources.join(', ')} for ${keywords.length} keywords...`);
  
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

  console.log(`✅ [Live Harvest Pipeline] Total real observations collected: ${allObservations.length}`);
  return allObservations;
};

module.exports = {
  scrapers,
  harvestObservations,
};
