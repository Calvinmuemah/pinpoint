const { query } = require('../config/database');
const { harvestObservations } = require('../scrapers');
const leadScoringService = require('../ai/scoring/lead-scoring.service');
const leadRepository = require('../modules/leads/lead.repository');
const businessSearchTool = require('../ai/tools/business-search.tool');

/**
 * Core Background Job:
 * 1. Harvests raw social/web observations via scrapers
 * 2. Feeds observations to Gemini AI agent
 * 3. Saves qualified high-intent leads to database automatically
 */
const runLeadProcessingCycle = async () => {
  const startTime = Date.now();
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`⏰ [Background Job] Starting Automated 24/7 Lead Processing Cycle at ${new Date().toISOString()}`);

  let totalUsersScanned = 0;
  let totalRawHarvested = 0;
  let totalLeadsCreated = 0;

  try {
    // 1. Fetch all active users
    const usersRes = await query(`
      SELECT u.id, u.name, u.email 
      FROM users u
      LEFT JOIN subscriptions s ON u.subscription_id = s.id
      WHERE u.role != 'admin' OR u.subscription_id IS NOT NULL;
    `);

    const activeUsers = usersRes.rows;
    totalUsersScanned = activeUsers.length;

    for (const user of activeUsers) {
      console.log(`🔍 [Job Worker] Processing keywords for user: ${user.name} (${user.email})`);

      // 2. Fetch user's active keywords
      const kwRes = await query(
        'SELECT keyword FROM listener_keywords WHERE user_id = $1 AND enabled = true',
        [user.id]
      );
      const keywords = kwRes.rows.map((r) => r.keyword);

      if (keywords.length === 0) {
        keywords.push('Mombasa trip', 'Kenya safari');
      }

      // 3. Fetch user's enabled sources
      const srcRes = await query(
        'SELECT source FROM listener_sources WHERE user_id = $1 AND enabled = true',
        [user.id]
      );
      const sources = srcRes.rows.map((r) => r.source);
      const enabledSources = sources.length > 0 ? sources : ['Reddit', 'Twitter', 'TripAdvisor'];

      // 4. Scrape raw posts
      const rawPosts = await harvestObservations(keywords, enabledSources);
      totalRawHarvested += rawPosts.length;

      // 5. Run AI Intent Extraction on each harvested post
      for (const post of rawPosts) {
        const intel = await leadScoringService.processContent(post.text);

        // Filter: Only proceed if Gemini confirms strong travel intent
        if (intel.isTravelIntent && intel.confidence >= 0.7) {
          // Check for duplicate lead in DB
          const existingCheck = await query(
            'SELECT id FROM leads WHERE user_id = $1 AND details = $2 LIMIT 1',
            [user.id, post.text]
          );

          if (existingCheck.rows.length === 0) {
            // Persist Lead
            const createdLead = await leadRepository.createLeadRecord({
              userId: user.id,
              details: post.text,
              destination: intel.destination || 'Mombasa',
              travelType: intel.travelType || 'Leisure',
              budget: intel.budget || 2000,
              source: post.source,
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

            // Match local tour operators
            const matches = await businessSearchTool.search(
              createdLead.destination,
              createdLead.travel_type
            );

            // Record notification for user's dashboard
            await query(
              `INSERT INTO notifications (user_id, lead_id, title, message, status)
               VALUES ($1, $2, $3, $4, 'Pending');`,
              [
                user.id,
                createdLead.id,
                `🔥 New ${createdLead.score_category} Lead Detected!`,
                `High intent travel lead detected on ${post.source} for ${createdLead.destination} ($${createdLead.budget || 'N/A'}).`,
              ]
            );

            totalLeadsCreated++;
            console.log(`✅ [Lead Created] Lead ID: ${createdLead.id} for ${user.email} (${createdLead.score_category} - ${createdLead.intent_score} pts)`);
          }
        }
      }
    }
  } catch (error) {
    console.error('❌ [Background Job Error]:', error.message);
  }

  const durationMs = Date.now() - startTime;
  console.log(`🏁 [Background Job Finished] Users: ${totalUsersScanned}, Posts: ${totalRawHarvested}, Leads Created: ${totalLeadsCreated} in ${durationMs}ms`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  return {
    usersScanned: totalUsersScanned,
    rawHarvested: totalRawHarvested,
    leadsCreated: totalLeadsCreated,
    durationMs,
  };
};

module.exports = {
  runLeadProcessingCycle,
};
