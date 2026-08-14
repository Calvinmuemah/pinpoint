const leadScoringService = require('../scoring/lead-scoring.service');
const webSearchTool = require('../tools/web-search.tool');
const socialSearchTool = require('../tools/social-search.tool');
const businessSearchTool = require('../tools/business-search.tool');

class TravelIntelligenceAgent {
  constructor() {
    this.tools = {
      webSearch: webSearchTool,
      socialSearch: socialSearchTool,
      businessSearch: businessSearchTool,
    };
  }

  /**
   * Orchestrates social observation analysis and business discovery
   */
  async processObservation(observationText, source = 'Social/Web') {
    // Step 1: Extract intent & score lead
    const intelligence = await leadScoringService.processContent(observationText);

    if (!intelligence.isTravelIntent) {
      return {
        action: 'DISCARD',
        reason: 'No travel intent detected in raw observation',
        intelligence,
      };
    }

    // Step 2: If travel intent detected and destination is found, discover matching businesses
    let matchedBusinesses = [];
    if (intelligence.destination) {
      matchedBusinesses = await this.tools.businessSearch.search(intelligence.destination, intelligence.travelType);
    }

    return {
      action: 'LEAD_GENERATED',
      source,
      observationText,
      intelligence,
      matchedBusinesses,
    };
  }
}

module.exports = new TravelIntelligenceAgent();
