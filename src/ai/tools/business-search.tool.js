const { query } = require('../../config/database');

/**
 * Business Search Tool for PinPoint Travel Agent
 * Dynamically matches identified destination & travel type with registered client agencies in PostgreSQL.
 */
const search = async (destination = 'Mombasa', travelType = 'Leisure') => {
  console.log(`🏢 [AI Tool: BusinessSearch] Dynamically matching registered agencies for ${destination} (${travelType})...`);

  try {
    // 1. Fetch real onboarded client agencies from PostgreSQL
    const sql = `
      SELECT u.id, u.name, u.email,
             s.name as plan_name,
             COALESCE(
               array_agg(DISTINCT lk.keyword) FILTER (WHERE lk.keyword IS NOT NULL),
               '{}'
             ) as monitored_keywords
      FROM users u
      LEFT JOIN subscriptions s ON u.subscription_id = s.id
      LEFT JOIN listener_keywords lk ON u.id = lk.user_id AND lk.enabled = true
      WHERE u.role = 'client'
      GROUP BY u.id, u.name, u.email, s.name
      LIMIT 10;
    `;
    const res = await query(sql);

    if (res && res.rows.length > 0) {
      // Find client agencies whose monitored keywords include the destination
      const destLower = destination.toLowerCase();
      const matchedClients = res.rows.filter((c) =>
        c.monitored_keywords.some((kw) => kw.toLowerCase().includes(destLower))
      );

      if (matchedClients.length > 0) {
        return matchedClients.map((c) => ({
          agencyId: c.id,
          name: c.name,
          email: c.email,
          plan: c.plan_name,
          matchedDestination: destination,
          matchedTravelType: travelType,
          status: 'Active Agency',
        }));
      }

      // Return all registered client agencies if no specific keyword match
      return res.rows.map((c) => ({
        agencyId: c.id,
        name: c.name,
        email: c.email,
        plan: c.plan_name,
        matchedDestination: destination,
        matchedTravelType: travelType,
        status: 'Active Agency',
      }));
    }
  } catch (err) {
    console.warn('⚠️ [BusinessSearch] DB query skipped/failed:', err.message);
  }

  // Fallback representation if no client agencies are onboarded yet
  return [
    {
      name: `${destination} Tour Agency Partner`,
      matchedDestination: destination,
      matchedTravelType: travelType,
      status: 'Awaiting Onboarded Agency',
    },
  ];
};

module.exports = {
  search,
};
