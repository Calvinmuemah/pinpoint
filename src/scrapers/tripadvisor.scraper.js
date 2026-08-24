const BaseScraper = require('./base.scraper');

class TripAdvisorScraper extends BaseScraper {
  constructor() {
    super('TripAdvisor');
  }

  /**
   * Scrapes real live TripAdvisor travel forum threads
   */
  async scrape(keyword) {
    console.log(`📡 [TripAdvisor Live Scraper] Harvesting real forum threads for: "${keyword}"...`);
    const searchTerms = [
      `tripadvisor showtopic ${keyword} hotel recommendations`,
      `tripadvisor forum ${keyword} safari packages cost`,
    ];
    return await this.liveHarvest(searchTerms, 4);
  }
}

module.exports = new TripAdvisorScraper();
