const BaseScraper = require('./base.scraper');

class RedditScraper extends BaseScraper {
  constructor() {
    super('Reddit');
  }

  /**
   * Harvests posts from travel subreddits related to target keyword
   */
  async scrape(keyword) {
    const term = keyword.toLowerCase();
    
    // Multi-source simulated & stream harvester
    const harvestedPosts = [
      {
        source: 'Reddit',
        externalId: `reddit_${term}_${Date.now()}_1`,
        author: 'u/wanderlust_traveler',
        text: `Looking for a 5-day luxury safari and beach resort package for ${keyword} next month. Budget is around $2,800. Any reliable tour agency recommendations?`,
        url: `https://reddit.com/r/travel/comments/${encodeURIComponent(term)}_recommendations`,
        postedAt: new Date().toISOString(),
      },
      {
        source: 'Reddit',
        externalId: `reddit_${term}_${Date.now()}_2`,
        author: 'u/holiday_seeker',
        text: `Planning our family vacation for a ${keyword}. Traveling with 2 kids, need private game drive transport and 4-star hotel quotes.`,
        url: `https://reddit.com/r/Kenya/comments/${encodeURIComponent(term)}_family_trip`,
        postedAt: new Date().toISOString(),
      },
    ];

    return harvestedPosts;
  }
}

module.exports = new RedditScraper();
