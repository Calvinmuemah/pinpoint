const BaseScraper = require('./base.scraper');

class RedditScraper extends BaseScraper {
  constructor() {
    super('Reddit');
  }

  /**
   * Scrapes real live Reddit discussions and inquiries
   */
  async scrape(keyword) {
    console.log(`📡 [Reddit Live Scraper] Harvesting real discussions for: "${keyword}"...`);
    const searchTerms = [
      `reddit travel ${keyword} recommendations`,
      `reddit kenya ${keyword} safari hotel quote`,
    ];
    return await this.liveHarvest(searchTerms, 4);
  }
}

module.exports = new RedditScraper();
