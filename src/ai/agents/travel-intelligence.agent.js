const leadScoringService = require('../scoring/lead-scoring.service');
const webSearchTool = require('../tools/web-search.tool');
const socialSearchTool = require('../tools/social-search.tool');
const businessSearchTool = require('../tools/business-search.tool');
const leadRepository = require('../../modules/leads/lead.repository');
const { query } = require('../../config/database');

class TravelIntelligenceAgent {
  constructor() {
    this.tools = {
      webSearch: webSearchTool,
      socialSearch: socialSearchTool,
      businessSearch: businessSearchTool,
    };
  }

  /**
   * Processes a single raw observation text using Gemini AI
   */
  async processObservation(observationText, source = 'Social/Web') {
    console.log(`🤖 [Travel Intelligence Agent] Analyzing observation from ${source}...`);

    // Step 1: Extract intent & score lead with Gemini
    const intelligence = await leadScoringService.processContent(observationText);

    if (!intelligence.isTravelIntent) {
      return {
        action: 'DISCARD',
        reason: 'No travel intent detected in raw observation',
        intelligence,
      };
    }

    // Step 2: Match relevant tourism businesses
    let matchedBusinesses = [];
    if (intelligence.destination) {
      matchedBusinesses = await this.tools.businessSearch.search(
        intelligence.destination,
        intelligence.travelType || 'Leisure'
      );
    }

    return {
      action: 'LEAD_GENERATED',
      source,
      observationText,
      intelligence,
      matchedBusinesses,
    };
  }

  /**
   * Full agent scan: Discovers live social/web posts based on user's active keywords and creates leads
   */
  async scanSourcesForUser(userId) {
    console.log(`🚀 [Travel Intelligence Agent] Launching automated keyword & source scan for user: ${userId}`);

    // Fetch active keywords for this user
    let keywords = ['Mombasa trip', 'Kenya safari'];
    let sources = ['Reddit', 'Twitter'];

    try {
      const kwRes = await query(
        'SELECT keyword FROM listener_keywords WHERE user_id = $1 AND enabled = true',
        [userId]
      );
      if (kwRes.rows.length > 0) {
        keywords = kwRes.rows.map((r) => r.keyword);
      }

      const srcRes = await query(
        'SELECT source FROM listener_sources WHERE user_id = $1 AND enabled = true',
        [userId]
      );
      if (srcRes.rows.length > 0) {
        sources = srcRes.rows.map((r) => r.source);
      }
    } catch (err) {
      console.warn('⚠️ [Travel Intelligence Agent] Using default keywords for scan:', err.message);
    }

    const generatedLeads = [];

    // Collect observations from tools
    for (const kw of keywords) {
      for (const src of sources) {
        const observations = await this.tools.socialSearch.search(src, kw);

        for (const obs of observations) {
          const analysis = await this.processObservation(obs.post, src);

          if (analysis.action === 'LEAD_GENERATED') {
            const intel = analysis.intelligence;

            // Save lead to database if database is configured
            try {
              const newLead = await leadRepository.createLeadRecord({
                userId,
                details: obs.post,
                destination: intel.destination || 'Mombasa',
                travelType: intel.travelType || 'Leisure',
                budget: intel.budget || 1500,
                source: src,
                intentScore: intel.intentScore || 85,
                scoreCategory: intel.scoreCategory || 'Hot',
                intelligence: {
                  intent: 'High Travel Intent',
                  reasoning: intel.reasoning,
                  confidence: intel.confidence,
                  extractedEntities: intel.extractedEntities,
                  model: 'gemini-2.5-flash',
                },
              });

              // Create notification
              await query(
                `INSERT INTO notifications (user_id, lead_id, title, message, status)
                 VALUES ($1, $2, $3, $4, 'Pending')`,
                [
                  userId,
                  newLead.id,
                  `New ${newLead.score_category} Lead Intercepted`,
                  `Travel intent detected on ${src} for ${newLead.destination} ($${newLead.budget}).`,
                ]
              );

              generatedLeads.push({
                lead: newLead,
                intelligence: intel,
                matchedBusinesses: analysis.matchedBusinesses,
              });
            } catch (dbErr) {
              console.warn('⚠️ [Travel Intelligence Agent] Could not persist lead in DB:', dbErr.message);
              generatedLeads.push({
                observation: obs.post,
                source: src,
                intelligence: intel,
                matchedBusinesses: analysis.matchedBusinesses,
              });
            }
          }
        }
      }
    }

    return {
      scannedKeywords: keywords,
      scannedSources: sources,
      totalLeadsDetected: generatedLeads.length,
      leads: generatedLeads,
    };
  }
}

module.exports = new TravelIntelligenceAgent();
