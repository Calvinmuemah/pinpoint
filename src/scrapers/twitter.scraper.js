const BaseScraper = require('./base.scraper');

class TwitterScraper extends BaseScraper {
  constructor() {
    super('Twitter');
  }

  async scrape(keyword) {
    const term = keyword.toLowerCase();

    return [
      {
        source: 'Twitter',
        externalId: `tw_${term}_${Date.now()}_1`,
        author: '@nomad_kate',
        text: `Heading out for a ${keyword} in 3 weeks! Looking for private tour operators or safari packages with ocean view lodges. Recommendations? 🏖️🐘`,
        url: `https://twitter.com/nomad_kate/status/${Date.now()}`,
        postedAt: new Date().toISOString(),
      },
    ];
  }
}

module.exports = new TwitterScraper();
