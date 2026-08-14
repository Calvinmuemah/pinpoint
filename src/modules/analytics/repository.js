const { query } = require('../../config/database');

const getDashboardMetrics = async (userId = null) => {
  const userCondition = userId ? 'AND user_id = $1' : '';
  const params = userId ? [userId] : [];

  const sql = `
    SELECT
      COUNT(*) as total_leads,
      COUNT(CASE WHEN intent_score >= 80 OR score_category = 'Hot' THEN 1 END) as high_intent_lead_count,
      COALESCE(AVG(intent_score), 0) as average_intent_score,
      COUNT(CASE WHEN status = 'Contacted' THEN 1 END) as contacted_leads
    FROM leads
    WHERE archived_at IS NULL ${userCondition};
  `;

  const res = await query(sql, params);
  const row = res.rows[0];

  const totalLeads = parseInt(row.total_leads, 10) || 0;
  const highIntentLeadCount = parseInt(row.high_intent_lead_count, 10) || 0;
  const averageIntentScore = parseFloat(row.average_intent_score) || 0;
  const contactedLeads = parseInt(row.contacted_leads, 10) || 0;
  const conversionRate = totalLeads > 0 ? Number(((contactedLeads / totalLeads) * 100).toFixed(1)) : 0;

  return {
    totalLeads,
    highIntentLeadCount,
    averageIntentScore: Number(averageIntentScore.toFixed(1)),
    conversionRate,
  };
};

const getBreakdownMetrics = async (timeframe = '30d', userId = null) => {
  let intervalCondition = '';
  if (timeframe === '7d') {
    intervalCondition = "AND created_at >= NOW() - INTERVAL '7 days'";
  } else if (timeframe === '30d') {
    intervalCondition = "AND created_at >= NOW() - INTERVAL '30 days'";
  }

  const userCondition = userId ? 'AND user_id = $1' : '';
  const params = userId ? [userId] : [];

  // Platforms/Sources distribution
  const sourcesSql = `
    SELECT COALESCE(source, 'Unknown') as platform, COUNT(*) as leads
    FROM leads
    WHERE archived_at IS NULL ${intervalCondition} ${userCondition}
    GROUP BY COALESCE(source, 'Unknown')
    ORDER BY leads DESC;
  `;
  const sourcesRes = await query(sourcesSql, params);

  // Top Destinations
  const destinationsSql = `
    SELECT COALESCE(destination, 'Unspecified') as destination, COUNT(*) as leads
    FROM leads
    WHERE archived_at IS NULL ${intervalCondition} ${userCondition}
    GROUP BY COALESCE(destination, 'Unspecified')
    ORDER BY leads DESC
    LIMIT 10;
  `;
  const destinationsRes = await query(destinationsSql, params);

  // Travel Types Distribution
  const typesSql = `
    SELECT COALESCE(travel_type, 'Other') as type, COUNT(*) as count
    FROM leads
    WHERE archived_at IS NULL ${intervalCondition} ${userCondition}
    GROUP BY COALESCE(travel_type, 'Other')
    ORDER BY count DESC;
  `;
  const typesRes = await query(typesSql, params);

  const totalTypesCount = typesRes.rows.reduce((acc, curr) => acc + parseInt(curr.count, 10), 0);
  const travelTypes = typesRes.rows.map((r) => ({
    type: r.type,
    count: parseInt(r.count, 10),
    percentage: totalTypesCount > 0 ? Number(((parseInt(r.count, 10) / totalTypesCount) * 100).toFixed(1)) : 0,
  }));

  // Lead Volume Trends (grouped by date)
  const trendsSql = `
    SELECT DATE_TRUNC('day', created_at)::DATE as date, COUNT(*) as count
    FROM leads
    WHERE archived_at IS NULL ${intervalCondition} ${userCondition}
    GROUP BY DATE_TRUNC('day', created_at)::DATE
    ORDER BY date ASC;
  `;
  const trendsRes = await query(trendsSql, params);

  return {
    timeframe,
    platforms: sourcesRes.rows.map((r) => ({ platform: r.platform, leads: parseInt(r.leads, 10) })),
    destinations: destinationsRes.rows.map((r) => ({ destination: r.destination, leads: parseInt(r.leads, 10) })),
    travelTypes,
    trends: trendsRes.rows.map((r) => ({ date: r.date, leads: parseInt(r.count, 10) })),
  };
};

module.exports = {
  getDashboardMetrics,
  getBreakdownMetrics,
};
