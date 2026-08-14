const { query, getClient } = require('../../config/database');

const findLeads = async ({ userId, search, scoreFilter, status, limit, offset }) => {
  const conditions = ['archived_at IS NULL'];
  const values = [];

  if (userId) {
    values.push(userId);
    conditions.push(`user_id = $${values.length}`);
  }

  if (search) {
    values.push(`%${search}%`);
    conditions.push(`(details ILIKE $${values.length} OR destination ILIKE $${values.length} OR source ILIKE $${values.length})`);
  }

  if (scoreFilter) {
    values.push(scoreFilter);
    conditions.push(`score_category = $${values.length}`);
  }

  if (status) {
    values.push(status);
    conditions.push(`status = $${values.length}`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Count total records
  const countSql = `SELECT COUNT(*) as total FROM leads ${whereClause};`;
  const countRes = await query(countSql, values);
  const total = parseInt(countRes.rows[0].total, 10);

  // Fetch paginated leads
  const dataValues = [...values, limit, offset];
  const dataSql = `
    SELECT id, user_id, details, destination, travel_type, budget, source,
           intent_score, score_category, status, is_starred, created_at, updated_at
    FROM leads
    ${whereClause}
    ORDER BY created_at DESC
    LIMIT $${dataValues.length - 1} OFFSET $${dataValues.length};
  `;
  const dataRes = await query(dataSql, dataValues);

  return {
    leads: dataRes.rows,
    total,
  };
};

const findLeadById = async (id, userId = null) => {
  const leadSql = `
    SELECT id, user_id, details, destination, travel_type, budget, source,
           intent_score, score_category, status, is_starred, archived_at, created_at, updated_at
    FROM leads
    WHERE id = $1 AND archived_at IS NULL;
  `;
  const leadRes = await query(leadSql, [id]);
  const lead = leadRes.rows[0];
  if (!lead) return null;

  // Fetch lead intelligence
  const intelSql = `
    SELECT id, intent, reasoning, confidence, extracted_entities, model, created_at
    FROM lead_intelligence
    WHERE lead_id = $1
    ORDER BY created_at DESC
    LIMIT 1;
  `;
  const intelRes = await query(intelSql, [id]);

  // Fetch lead events
  const eventsSql = `
    SELECT id, event_type, source, payload, created_at
    FROM lead_events
    WHERE lead_id = $1
    ORDER BY created_at ASC;
  `;
  const eventsRes = await query(eventsSql, [id]);

  return {
    ...lead,
    intelligence: intelRes.rows[0] || null,
    events: eventsRes.rows || [],
  };
};

const createLeadRecord = async ({
  userId,
  details,
  destination,
  travelType,
  budget,
  source,
  intentScore,
  scoreCategory,
  intelligence,
}) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');

    const leadSql = `
      INSERT INTO leads (user_id, details, destination, travel_type, budget, source, intent_score, score_category, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *;
    `;
    const leadValues = [
      userId || null,
      details,
      destination || null,
      travelType || 'Leisure',
      budget || 0,
      source || 'Manual',
      intentScore || 50,
      scoreCategory || 'Cool',
      'New',
    ];
    const leadRes = await client.query(leadSql, leadValues);
    const lead = leadRes.rows[0];

    // Insert lead intelligence record if provided
    if (intelligence) {
      const intelSql = `
        INSERT INTO lead_intelligence (lead_id, intent, reasoning, confidence, extracted_entities, model)
        VALUES ($1, $2, $3, $4, $5, $6);
      `;
      await client.query(intelSql, [
        lead.id,
        intelligence.intent || 'Detected Intent',
        intelligence.reasoning || '',
        intelligence.confidence || 0.90,
        JSON.stringify(intelligence.extractedEntities || intelligence.extracted_entities || {}),
        intelligence.model || 'gemini-2.5-flash',
      ]);
    }

    // Insert initial event record
    const eventSql = `
      INSERT INTO lead_events (lead_id, event_type, source, payload)
      VALUES ($1, $2, $3, $4);
    `;
    await client.query(eventSql, [
      lead.id,
      'LEAD_DETECTED',
      source || 'Manual',
      JSON.stringify({ score: lead.intent_score, category: lead.score_category }),
    ]);

    await client.query('COMMIT');
    return lead;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const updateLeadStatus = async (id, status, source = 'User') => {
  const client = await getClient();
  try {
    await client.query('BEGIN');

    const updateSql = `
      UPDATE leads
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 AND archived_at IS NULL
      RETURNING *;
    `;
    const updateRes = await client.query(updateSql, [status, id]);
    const lead = updateRes.rows[0];

    if (lead) {
      const eventSql = `
        INSERT INTO lead_events (lead_id, event_type, source, payload)
        VALUES ($1, $2, $3, $4);
      `;
      await client.query(eventSql, [
        id,
        'STATUS_CHANGED',
        source,
        JSON.stringify({ newStatus: status }),
      ]);
    }

    await client.query('COMMIT');
    return lead;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const toggleStarStatus = async (id) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');

    const sql = `
      UPDATE leads
      SET is_starred = NOT is_starred, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND archived_at IS NULL
      RETURNING id, is_starred, updated_at;
    `;
    const res = await client.query(sql, [id]);
    const lead = res.rows[0];

    if (lead) {
      const eventSql = `
        INSERT INTO lead_events (lead_id, event_type, source, payload)
        VALUES ($1, $2, $3, $4);
      `;
      await client.query(eventSql, [
        id,
        'STARRED',
        'User',
        JSON.stringify({ isStarred: lead.is_starred }),
      ]);
    }

    await client.query('COMMIT');
    return lead;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const archiveLead = async (id) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');

    const sql = `
      UPDATE leads
      SET archived_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND archived_at IS NULL
      RETURNING id, archived_at;
    `;
    const res = await client.query(sql, [id]);
    const lead = res.rows[0];

    if (lead) {
      const eventSql = `
        INSERT INTO lead_events (lead_id, event_type, source, payload)
        VALUES ($1, $2, $3, $4);
      `;
      await client.query(eventSql, [
        id,
        'ARCHIVED',
        'User',
        JSON.stringify({ archivedAt: lead.archived_at }),
      ]);
    }

    await client.query('COMMIT');
    return lead;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  findLeads,
  findLeadById,
  createLeadRecord,
  updateLeadStatus,
  toggleStarStatus,
  archiveLead,
};
