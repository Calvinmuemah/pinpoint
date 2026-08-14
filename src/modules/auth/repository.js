const { query } = require('../../config/database');

const findByEmail = async (email) => {
  const sql = `
    SELECT u.id, u.name, u.email, u.password_hash, u.role, u.subscription_id, u.created_at,
           s.name as subscription_name, s.status as subscription_status
    FROM users u
    LEFT JOIN subscriptions s ON u.subscription_id = s.id
    WHERE u.email = $1;
  `;
  const res = await query(sql, [email]);
  return res.rows[0] || null;
};

const createUser = async (name, email, passwordHash) => {
  const sql = `
    INSERT INTO users (name, email, password_hash)
    VALUES ($1, $2, $3)
    RETURNING id, name, email, role, subscription_id, created_at;
  `;
  const res = await query(sql, [name, email, passwordHash]);
  return res.rows[0];
};

const bootstrapDefaultAdmin = async (adminEmail, passwordHash) => {
  // 1. Create or get default subscription
  let subRes = await query(`SELECT id FROM subscriptions WHERE name = 'Enterprise Plan' LIMIT 1;`);
  let subscriptionId;
  if (subRes.rows.length === 0) {
    const newSub = await query(
      `INSERT INTO subscriptions (name, status, price) VALUES ('Enterprise Plan', 'active', 299.00) RETURNING id;`
    );
    subscriptionId = newSub.rows[0].id;
  } else {
    subscriptionId = subRes.rows[0].id;
  }

  // 2. Insert admin user
  const userSql = `
    INSERT INTO users (name, email, password_hash, role, subscription_id)
    VALUES ($1, $2, $3, 'admin', $4)
    ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, role = 'admin'
    RETURNING id, name, email, password_hash, role, subscription_id, created_at;
  `;
  const userRes = await query(userSql, ['PinPoint Admin', adminEmail, passwordHash, subscriptionId]);
  const user = userRes.rows[0];

  // 3. Initialize default keywords
  const keywords = ['Mombasa trip', 'Kenya safari', 'planning a vacation', 'Diani luxury beach'];
  for (const kw of keywords) {
    await query(
      `INSERT INTO listener_keywords (user_id, keyword, enabled)
       VALUES ($1, $2, true)
       ON CONFLICT DO NOTHING;`,
      [user.id, kw]
    );
  }

  // 4. Initialize default sources
  const defaultSources = [
    { source: 'Reddit', config: { subreddit: 'travel' } },
    { source: 'TripAdvisor', config: { forum: 'kenya' } },
    { source: 'Twitter', config: { hashtag: '#KenyaTravel' } },
    { source: 'Instagram', config: { hashtag: '#VisitMombasa' } },
  ];
  for (const s of defaultSources) {
    await query(
      `INSERT INTO listener_sources (user_id, source, enabled, configuration)
       VALUES ($1, $2, true, $3)
       ON CONFLICT DO NOTHING;`,
      [user.id, s.source, JSON.stringify(s.config)]
    );
  }

  return {
    ...user,
    subscription_name: 'Enterprise Plan',
    subscription_status: 'active',
  };
};

module.exports = {
  findByEmail,
  createUser,
  bootstrapDefaultAdmin,
};
