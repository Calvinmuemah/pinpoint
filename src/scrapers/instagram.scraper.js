const BaseScraper = require('./base.scraper');

class InstagramScraper extends BaseScraper {
  constructor() {
    super('Instagram');
  }

  /**
   * Scrapes real live Instagram travel inquiries, tours, and destination posts
   */
  async scrape(keyword) {
    console.log(`📡 [Instagram Live Scraper] Harvesting real posts for: "${keyword}"...`);
    const searchTerms = [
      `instagram ${keyword} safari tour booking luxury resort`,
      `instagram kenya travel ${keyword} holiday guide`,
    ];
    return await this.liveHarvest(searchTerms, 4);
  }
}

module.exports = new InstagramScraper();
