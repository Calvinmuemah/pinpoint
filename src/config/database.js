const { Pool } = require('pg');
const env = require('./env');

const connectionString = env.DATABASE_URL;

let pool = null;

if (connectionString) {
  pool = new Pool({
    connectionString,
    ssl: connectionString.includes('sslmode=disable')
      ? false
      : { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,
    max: 20,
  });

  pool.on('error', (err) => {
    console.error('❌ [PostgreSQL] Unexpected error on idle client in pool:', err.message);
  });
} else {
  console.warn('⚠️ [PostgreSQL] DATABASE_URL is not set. Database pool not initialized.');
}

/**
 * Tests database connectivity and logs clear success or failure messages.
 */
const testDatabaseConnection = async () => {
  if (!pool) {
    console.warn('⚠️ [PostgreSQL] Database pool not initialized. Please configure DATABASE_URL in .env');
    return false;
  }

  try {
    const client = await pool.connect();
    const res = await client.query('SELECT current_database() as db, current_user as user, version() as version;');
    client.release();

    const dbName = res.rows[0]?.db || 'unknown';
    const dbUser = res.rows[0]?.user || 'unknown';
    console.log(`[PostgreSQL] Successfully connected to Neon database: "${dbName}" as user: "${dbUser}"`);
    return true;
  } catch (error) {
    console.error('[PostgreSQL] Failed to connect to database:');
    console.error(`   Error Code: ${error.code || 'N/A'}`);
    console.error(`   Message: ${error.message}`);
    if (error.detail) console.error(`   Detail: ${error.detail}`);
    if (error.hint) console.error(`   Hint: ${error.hint}`);
    return false;
  }
};

/**
 * Executes a parameterized SQL query with error handling and logging.
 */
const query = async (text, params) => {
  if (!pool) {
    const errMessage = 'Database connection pool is not configured. Please set DATABASE_URL in .env';
    console.error(`[PostgreSQL Query Error]: ${errMessage}`);
    throw new Error(errMessage);
  }

  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    if (env.NODE_ENV === 'development') {
      // Optional query debug logging in development
      // console.log(`[PostgreSQL Query] (${duration}ms) rows: ${res.rowCount}`);
    }
    return res;
  } catch (error) {
    console.error('[PostgreSQL Query Error]:');
    console.error(`   Query: ${text.trim().replace(/\s+/g, ' ')}`);
    console.error(`   Parameters: ${JSON.stringify(params || [])}`);
    console.error(`   Message: ${error.message}`);
    throw error;
  }
};

/**
 * Acquires a client from the pool with error logging.
 */
const getClient = async () => {
  if (!pool) {
    const errMessage = 'Database connection pool is not configured. Please set DATABASE_URL in .env';
    console.error(`[PostgreSQL Client Error]: ${errMessage}`);
    throw new Error(errMessage);
  }

  try {
    const client = await pool.connect();
    return client;
  } catch (error) {
    console.error('[PostgreSQL] Failed to acquire client from pool:', error.message);
    throw error;
  }
};

module.exports = {
  pool,
  query,
  getClient,
  testDatabaseConnection,
};
