const BaseScraper = require('./base.scraper');

class WebSearchScraper extends BaseScraper {
  constructor() {
    super('WebSearch');
  }

  /**
   * Scrapes real live travel discussion blogs, booking forums, and inquiry websites
   */
  async scrape(keyword) {
    console.log(`📡 [WebSearch Live Scraper] Harvesting real discussions across the web for: "${keyword}"...`);
    const searchTerms = [
      `${keyword} travel itinerary planning recommendations forum`,
      `${keyword} luxury safari lodge quotes advice`,
    ];
    return await this.liveHarvest(searchTerms, 4);
  }
}

module.exports = new WebSearchScraper();
