/**
 * Base Scraper Class with Real Live Web Harvesting Engine
 */
class BaseScraper {
  constructor(name) {
    this.name = name;
  }

  async scrape(keyword) {
    throw new Error(`Scrape method not implemented for ${this.name}`);
  }

  cleanHtml(text) {
    if (!text) return '';
    return text
      .replace(/<[^>]+>/g, '')
      .replace(/&#x27;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Fetches real live travel discussions and inquiries across the web for target keyword
   */
  async liveHarvest(searchTerms = [], maxResults = 4) {
    const results = [];
    const ignoredDomains = ['wikipedia.org', 'wiktionary.org', 'dictionary.com', 'wikimedia.org'];

    for (const term of searchTerms) {
      if (results.length >= maxResults) break;

      const url = `https://www.bing.com/search?q=${encodeURIComponent(term)}&format=rss`;

      try {
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          },
          signal: AbortSignal.timeout(8000),
        });

        if (!response.ok) continue;

        const xml = await response.text();
        const itemRegex = /<item>[\s\S]*?<title>([\s\S]*?)<\/title>[\s\S]*?<link>([\s\S]*?)<\/link>[\s\S]*?<description>([\s\S]*?)<\/description>[\s\S]*?<\/item>/gi;
        
        let match;
        while ((match = itemRegex.exec(xml)) !== null && results.length < maxResults) {
          const title = this.cleanHtml(match[1]);
          const link = match[2].trim();
          const description = this.cleanHtml(match[3]);

          // Filter out encyclopedias and non-travel pages
          const isIgnored = ignoredDomains.some((d) => link.toLowerCase().includes(d));
          if (!isIgnored && description.length > 30) {
            results.push({
              source: this.name,
              text: `${title}: ${description}`,
              url: link,
              postedAt: new Date().toISOString(),
            });
          }
        }
      } catch (err) {
        console.warn(`⚠️ [${this.name} Scraper] Harvest error for "${term}":`, err.message);
      }
    }

    return results;
  }
}

module.exports = BaseScraper;
