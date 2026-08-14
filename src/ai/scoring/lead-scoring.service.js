const { analyzeTravelIntent } = require('../gemini.service');

class LeadScoringService {
  /**
   * Evaluates text content using Gemini AI and returns formatted intelligence
   */
  async processContent(rawText) {
    const analysis = await analyzeTravelIntent(rawText);
    return analysis;
  }

  /**
   * Helper to derive category from numerical score
   */
  getCategoryFromScore(score) {
    if (score >= 80) return 'Hot';
    if (score >= 50) return 'Warm';
    return 'Cool';
  }
}

module.exports = new LeadScoringService();
