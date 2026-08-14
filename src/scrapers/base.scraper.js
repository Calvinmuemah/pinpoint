/**
 * Base Scraper Interface
 */
class BaseScraper {
  constructor(name) {
    this.name = name;
  }

  async scrape(keyword) {
    throw new Error(`Scrape method not implemented for ${this.name}`);
  }

  cleanText(text) {
    if (!text) return '';
    return text.replace(/\s+/g, ' ').trim();
  }
}

module.exports = BaseScraper;
