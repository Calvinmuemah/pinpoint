const BaseScraper = require('./base.scraper');

class WebSearchScraper extends BaseScraper {
  constructor() {
    super('WebSearch');
  }

  async scrape(keyword) {
    const term = keyword.toLowerCase();

    return [
      {
        source: 'WebSearch',
        externalId: `web_${term}_${Date.now()}_1`,
        author: 'Anonymous Forum User',
        text: `Planning a holiday for ${keyword} next month. Need quotes for all-inclusive beach resort accommodation and airport transfers.`,
        url: `https://traveldiscussions.com/p/${encodeURIComponent(term)}`,
        postedAt: new Date().toISOString(),
      },
    ];
  }
}

module.exports = new WebSearchScraper();
