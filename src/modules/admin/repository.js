const { getClient, query } = require('../../config/database');

const createClientAccount = async ({
  name,
  email,
  passwordHash,
  subscriptionPlan,
  price,
  contactInquiryId,
  keywords,
}) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');

    // 1. Create Subscription
    const subSql = `
      INSERT INTO subscriptions (name, status, price)
      VALUES ($1, 'active', $2)
      RETURNING id, name, status, price;
    `;
    const subRes = await client.query(subSql, [subscriptionPlan || 'Enterprise Plan', price || 299.00]);
    const subscription = subRes.rows[0];

    // 2. Create User
    const userSql = `
      INSERT INTO users (name, email, password_hash, role, subscription_id)
      VALUES ($1, $2, $3, 'client', $4)
      RETURNING id, name, email, role, created_at;
    `;
    const userRes = await client.query(userSql, [name, email, passwordHash, subscription.id]);
    const newUser = userRes.rows[0];

    // 3. Initialize Default Listener Keywords
    const defaultKeywords = (keywords && keywords.length > 0)
      ? keywords
      : ['Mombasa trip', 'Kenya safari', 'planning a vacation', 'Diani beach holiday'];
    
    for (const kw of defaultKeywords) {
      await client.query(
        `INSERT INTO listener_keywords (user_id, keyword, enabled)
         VALUES ($1, $2, true);`,
        [newUser.id, kw]
      );
    }

    // 4. Initialize Default Listener Sources
    const defaultSources = [
      { source: 'Reddit', config: { subreddit: 'travel' } },
      { source: 'Twitter', config: { hashtag: '#VisitKenya' } },
      { source: 'TripAdvisor', config: { forum: 'kenya' } },
      { source: 'Instagram', config: { hashtag: '#Mombasa' } },
    ];
    for (const s of defaultSources) {
      await client.query(
        `INSERT INTO listener_sources (user_id, source, enabled, configuration)
         VALUES ($1, $2, true, $3);`,
        [newUser.id, s.source, JSON.stringify(s.config)]
      );
    }

    // 5. Initialize Default Scoring Rules
    const defaultRules = [
      { criterion: 'Specific destination mentioned', weight: 25, description: 'Explicit travel destination stated' },
      { criterion: 'Travel date or timeframe provided', weight: 25, description: 'Explicit travel period given' },
      { criterion: 'Budget details included', weight: 20, description: 'Budget estimation provided' },
      { criterion: 'Explicitly looking for tour operator', weight: 30, description: 'Requesting recommendations or quotes' },
    ];
    for (const r of defaultRules) {
      await client.query(
        `INSERT INTO scoring_rules (user_id, criterion, weight, description, enabled)
         VALUES ($1, $2, $3, $4, true);`,
        [newUser.id, r.criterion, r.weight, r.description]
      );
    }

    // 6. Update Contact Inquiry Status (if converted from public inquiry)
    if (contactInquiryId) {
      await client.query(
        `UPDATE contact_inquiries
         SET status = 'Onboarded', updated_at = CURRENT_TIMESTAMP
         WHERE id = $1;`,
        [contactInquiryId]
      );
    }

    await client.query('COMMIT');

    return {
      ...newUser,
      subscription,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const getInquiriesList = async () => {
  const sql = `
    SELECT id, full_name, business_name, email, industry, message, status, created_at
    FROM contact_inquiries
    ORDER BY created_at DESC;
  `;
  const res = await query(sql);
  return res.rows;
};

const getClientsList = async () => {
  const sql = `
    SELECT u.id, u.name, u.email, u.role, u.created_at,
           s.name as subscription_name, s.status as subscription_status, s.price as subscription_price
    FROM users u
    LEFT JOIN subscriptions s ON u.subscription_id = s.id
    WHERE u.role != 'admin'
    ORDER BY u.created_at DESC;
  `;
  const res = await query(sql);
  return res.rows;
};

module.exports = {
  createClientAccount,
  getInquiriesList,
  getClientsList,
};
