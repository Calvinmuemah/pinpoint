const dns = require('dns');
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}
const bcrypt = require('bcryptjs');
const { Client } = require('pg');
const env = require('../config/env');

const seedData = async () => {
  console.log('Seeding initial database records into Neon database...');

  const client = new Client({
    connectionString: env.DATABASE_URL,
    ssl: env.DATABASE_URL.includes('sslmode=disable')
      ? false
      : { rejectUnauthorized: false },
  });

  await client.connect();

  try {
    // 1. Create default subscription
    const subRes = await client.query(
      `INSERT INTO subscriptions (name, status, price)
       VALUES ($1, $2, $3)
       RETURNING id;`,
      ['Enterprise Plan', 'active', 299.00]
    );
    const subscriptionId = subRes.rows[0].id;

    // 2. Create admin user (email: pinadmin@gmail.com, password: pin@2026)
    const passwordHash = await bcrypt.hash('pin@2026', 10);
    const userRes = await client.query(
      `INSERT INTO users (name, email, password_hash, role, subscription_id)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, role = 'admin'
       RETURNING id, name, email, role;`,
      ['PinPoint Admin', 'pinadmin@gmail.com', passwordHash, 'admin', subscriptionId]
    );
    const userId = userRes.rows[0].id;
    console.log(`✅ [Seed] Admin account created/updated: ${userRes.rows[0].email} (Role: ${userRes.rows[0].role})`);

    // 3. Create default listener keywords
    const keywords = ['Mombasa trip', 'Kenya safari', 'planning a vacation', 'Diani luxury beach'];
    for (const kw of keywords) {
      await client.query(
        `INSERT INTO listener_keywords (user_id, keyword, enabled)
         VALUES ($1, $2, true);`,
        [userId, kw]
      );
    }

    // 4. Create default listener sources
    const sources = [
      { source: 'Reddit', config: { subreddit: 'travel' } },
      { source: 'TripAdvisor', config: { forum: 'kenya' } },
      { source: 'Twitter', config: { hashtag: '#KenyaTravel' } },
      { source: 'Instagram', config: { hashtag: '#VisitMombasa' } },
    ];
    for (const s of sources) {
      await client.query(
        `INSERT INTO listener_sources (user_id, source, enabled, configuration)
         VALUES ($1, $2, true, $3);`,
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
         VALUES ($1, $2, $3, $4, true);`,
        [userId, r.criterion, r.weight, r.description]
      );
    }

    // 6. Create sample lead
    const leadRes = await client.query(
      `INSERT INTO leads (user_id, details, destination, travel_type, budget, source, intent_score, score_category, status, is_starred)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING id;`,
      [
        userId,
        'Looking for a 5-day luxury resort recommendation in Mombasa for next month. Budget is around $2,500.',
        'Mombasa',
        'Leisure',
        2500.00,
        'Reddit',
        87,
        'Hot',
        'New',
        true,
      ]
    );
    const leadId = leadRes.rows[0].id;

    // 7. Create sample lead intelligence
    await client.query(
      `INSERT INTO lead_intelligence (lead_id, intent, reasoning, confidence, extracted_entities, model)
       VALUES ($1, $2, $3, $4, $5, $6);`,
      [
        leadId,
        'High Travel Intent',
        'User explicitly stated trip destination Mombasa, luxury travel preference, and timeframe next month.',
        0.94,
        JSON.stringify({ destination: 'Mombasa', timeframe: 'next month', travel_type: 'Leisure', budget: 2500 }),
        'gemini-2.5-flash',
      ]
    );

    // 8. Create sample lead event
    await client.query(
      `INSERT INTO lead_events (lead_id, event_type, source, payload)
       VALUES ($1, $2, $3, $4);`,
      [
        leadId,
        'LEAD_DETECTED',
        'AI Social Listener',
        JSON.stringify({ platform: 'Reddit', score: 87, category: 'Hot' }),
      ]
    );

    // 9. Create sample notification
    await client.query(
      `INSERT INTO notifications (user_id, lead_id, title, message, status)
       VALUES ($1, $2, $3, $4, $5);`,
      [
        userId,
        leadId,
        '🔥 High-Intent Lead Detected',
        'New High-Intent Lead intercepted on Reddit for Mombasa ($2,500 budget).',
        'Pending',
      ]
    );

    console.log('🎉 Database seeding completed successfully into online database!');
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
