const dns = require('dns');
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}
const bcrypt = require('bcryptjs');
const { Client } = require('pg');
const env = require('../config/env');

const seedData = async () => {
  console.log('Seeding initial system configuration into Neon database...');

  const client = new Client({
    connectionString: env.DATABASE_URL,
    ssl: env.DATABASE_URL.includes('sslmode=disable')
      ? false
      : { rejectUnauthorized: false },
  });

  await client.connect();

  try {
    // 1. Create or ensure default subscription
    let subRes = await client.query(
      `SELECT id FROM subscriptions WHERE name = 'Enterprise Plan' LIMIT 1;`
    );
    let subscriptionId;
    if (subRes.rows.length === 0) {
      const newSub = await client.query(
        `INSERT INTO subscriptions (name, status, price)
         VALUES ($1, 'active', $2)
         RETURNING id;`,
        ['Enterprise Plan', 299.00]
      );
      subscriptionId = newSub.rows[0].id;
    } else {
      subscriptionId = subRes.rows[0].id;
    }

    // 2. Create or update admin user (email: pinadmin@gmail.com, password: pin@2026)
    const passwordHash = await bcrypt.hash('pin@2026', 10);
    const userRes = await client.query(
      `INSERT INTO users (name, email, password_hash, role, subscription_id)
       VALUES ($1, $2, $3, 'admin', $4)
       ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, role = 'admin'
       RETURNING id, name, email, role;`,
      ['PinPoint Admin', 'pinadmin@gmail.com', passwordHash, subscriptionId]
    );
    const userId = userRes.rows[0].id;
    console.log(`✅ [Seed] Admin account configured: ${userRes.rows[0].email} (Role: ${userRes.rows[0].role})`);

    // 3. Create default listener keywords
    const keywords = ['Mombasa trip', 'Kenya safari', 'planning a vacation', 'Diani luxury holiday'];
    for (const kw of keywords) {
      await client.query(
        `INSERT INTO listener_keywords (user_id, keyword, enabled)
         VALUES ($1, $2, true)
         ON CONFLICT DO NOTHING;`,
        [userId, kw]
      );
    }

    // 4. Create default listener sources (including Facebook and Instagram)
    const sources = [
      { source: 'Reddit', config: { subreddit: 'travel' } },
      { source: 'TripAdvisor', config: { forum: 'kenya' } },
      { source: 'Twitter', config: { hashtag: '#KenyaTravel' } },
      { source: 'Facebook', config: { query: 'Kenya travel groups' } },
      { source: 'Instagram', config: { hashtag: '#VisitMombasa' } },
      { source: 'WebSearch', config: { query: 'Kenya travel advice' } },
    ];
    for (const s of sources) {
      await client.query(
        `INSERT INTO listener_sources (user_id, source, enabled, configuration)
         VALUES ($1, $2, true, $3)
         ON CONFLICT DO NOTHING;`,
        [userId, s.source, JSON.stringify(s.config)]
      );
    }

    // 5. Create default scoring rules
    const rules = [
      { criterion: 'Specific destination mentioned', weight: 25, description: 'Explicit mention of travel destination' },
      { criterion: 'Travel date or timeframe provided', weight: 25, description: 'Explicit travel period mentioned' },
      { criterion: 'Budget details included', weight: 20, description: 'Explicit budget estimation given' },
      { criterion: 'Explicitly looking for tour operator', weight: 30, description: 'Requesting recommendations or quotes' },
    ];
    for (const r of rules) {
      await client.query(
        `INSERT INTO scoring_rules (user_id, criterion, weight, description, enabled)
         VALUES ($1, $2, $3, $4, true)
         ON CONFLICT DO NOTHING;`,
        [userId, r.criterion, r.weight, r.description]
      );
    }

    console.log('🎉 Initial system setup completed successfully! No dummy leads were created.');
  } finally {
    await client.end();
  }
};

if (require.main === module) {
  seedData()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Seeding failed:', err);
      process.exit(1);
    });
}

module.exports = seedData;
