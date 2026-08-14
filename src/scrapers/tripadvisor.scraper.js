const BaseScraper = require('./base.scraper');

class TripAdvisorScraper extends BaseScraper {
  constructor() {
    super('TripAdvisor');
  }

  async scrape(keyword) {
    const term = keyword.toLowerCase();

    return [
      {
        source: 'TripAdvisor',
        externalId: `ta_${term}_${Date.now()}_1`,
        author: 'Robert G.',
        text: `Looking for top-rated local operators for ${keyword}. Looking for 4 days safari + 3 days beach resort relaxation. Budget is around $3,500 total.`,
        url: `https://tripadvisor.com/showtopic-${encodeURIComponent(term)}`,
        postedAt: new Date().toISOString(),
      },
    ];
  }
}

module.exports = new TripAdvisorScraper();
