const BaseScraper = require('./base.scraper');

class FacebookScraper extends BaseScraper {
  constructor() {
    super('Facebook');
  }

  /**
   * Scrapes real live Facebook travel groups and inquiries
   */
  async scrape(keyword) {
    console.log(`📡 [Facebook Live Scraper] Harvesting real group discussions for: "${keyword}"...`);
    const searchTerms = [
      `facebook travel kenya ${keyword} tour safari recommendations`,
      `facebook groups ${keyword} holiday vacation packages`,
    ];
    return await this.liveHarvest(searchTerms, 4);
  }
}

module.exports = new FacebookScraper();
