const { query, getClient } = require('../../config/database');

const getSettings = async (userId) => {
  const keywordsSql = `
    SELECT id, keyword, enabled FROM listener_keywords WHERE user_id = $1 ORDER BY created_at ASC;
  `;
  const sourcesSql = `
    SELECT id, source, enabled, configuration FROM listener_sources WHERE user_id = $1 ORDER BY created_at ASC;
  `;
  const rulesSql = `
    SELECT id, criterion, weight, description, enabled FROM scoring_rules WHERE user_id = $1 ORDER BY created_at ASC;
  `;
  const destsSql = `
    SELECT DISTINCT destination FROM leads WHERE user_id = $1 AND destination IS NOT NULL AND destination != '';
  `;

  const keywordsRes = await query(keywordsSql, [userId]);
  const sourcesRes = await query(sourcesSql, [userId]);
  const rulesRes = await query(rulesSql, [userId]);
  const destsRes = await query(destsSql, [userId]);

  return {
    keywords: keywordsRes.rows,
    sources: sourcesRes.rows.map((s) => ({
      id: s.id,
      source: s.source,
      enabled: s.enabled,
      configuration: s.configuration,
    })),
    scoringRules: rulesRes.rows,
    targetDestinations: destsRes.rows.map((r) => r.destination),
  };
};

const updateKeywords = async (userId, keywordsList) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM listener_keywords WHERE user_id = $1', [userId]);

    const updated = [];
    for (const kw of keywordsList) {
      const res = await client.query(
        `INSERT INTO listener_keywords (user_id, keyword, enabled)
         VALUES ($1, $2, true)
         RETURNING id, keyword, enabled`,
        [userId, kw]
      );
      updated.push(res.rows[0]);
    }

    await client.query('COMMIT');
    return updated;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const updateSources = async (userId, sourcesList) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM listener_sources WHERE user_id = $1', [userId]);

    const updated = [];
    for (const item of sourcesList) {
      const sourceName = item.source || item.id || 'Unknown';
      const res = await client.query(
        `INSERT INTO listener_sources (user_id, source, enabled, configuration)
         VALUES ($1, $2, $3, $4)
         RETURNING id, source, enabled, configuration`,
        [userId, sourceName, item.enabled, JSON.stringify(item.configuration || {})]
      );
      updated.push(res.rows[0]);
    }

    await client.query('COMMIT');
    return updated;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const updateScoringRules = async (userId, rulesList) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM scoring_rules WHERE user_id = $1', [userId]);

    const updated = [];
    for (const item of rulesList) {
      const res = await client.query(
        `INSERT INTO scoring_rules (user_id, criterion, weight, description, enabled)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, criterion, weight, description, enabled`,
        [userId, item.criterion, item.weight, item.description || '', item.enabled !== false]
      );
      updated.push(res.rows[0]);
    }

    await client.query('COMMIT');
    return updated;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  getSettings,
  updateKeywords,
  updateSources,
  updateScoringRules,
};
