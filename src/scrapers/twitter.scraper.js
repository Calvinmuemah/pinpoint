const BaseScraper = require('./base.scraper');

class TwitterScraper extends BaseScraper {
  constructor() {
    super('Twitter');
  }

  /**
   * Scrapes real live travel tweets from Twitter/X
   */
  async scrape(keyword) {
    console.log(`📡 [Twitter Live Scraper] Harvesting real tweets for: "${keyword}"...`);
    const searchTerms = [
      `twitter kenya travel ${keyword} safari itinerary`,
      `x.com ${keyword} tour guide recommendations quotes`,
    ];
    return await this.liveHarvest(searchTerms, 4);
  }
}

module.exports = new TwitterScraper();
