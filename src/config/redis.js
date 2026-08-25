const Redis = require('ioredis');
const env = require('./env');

let redisClient = null;

/**
 * Initializes Redis connection with event listeners and logs.
 */
const connectRedis = () => {
  if (!env.REDIS_URL) {
    console.warn('[Redis] REDIS_URL is not set in .env. Redis features are disabled.');
    return null;
  }

  if (redisClient) {
    return redisClient;
  }

  try {
    redisClient = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        if (times > 5) {
          console.error('[Redis] Max reconnection attempts reached. Halting automatic retries.');
          return null; // Stop retrying
        }
        const delay = Math.min(times * 1000, 5000);
        console.log(`[Redis] Reconnecting to Redis in ${delay}ms... (Attempt ${times}/5)`);
        return delay;
      },
      lazyConnect: false,
    });

    redisClient.on('connect', () => {
      console.log('[Redis] Successfully established socket connection to Redis server.');
    });

    redisClient.on('ready', () => {
      console.log('[Redis] Redis client is ready to receive and execute commands.');
    });

    redisClient.on('error', (err) => {
      console.error('[Redis] Failed to connect / Redis connection error:');
      console.error(`   Message: ${err.message}`);
    });

    redisClient.on('close', () => {
      console.warn('[Redis] Redis connection closed.');
    });

    redisClient.on('reconnecting', () => {
      console.log('[Redis] Reconnecting to Redis server...');
    });

    return redisClient;
  } catch (error) {
    console.error('[Redis] Failed to initialize Redis client:', error.message);
    return null;
  }
};

/**
 * Retrieves the current Redis client instance.
 */
const getRedisClient = () => {
  if (!redisClient) {
    return connectRedis();
  }
  return redisClient;
};

/**
 * Adds a token to the Redis blacklist with a TTL.
 */
const blacklistToken = async (token, expiresInSeconds = 86400) => {
  const client = getRedisClient();
  if (!client) return false;
  try {
    const key = `blacklist:${token}`;
    await client.set(key, 'revoked', 'EX', Math.max(expiresInSeconds, 60));
    return true;
  } catch (err) {
    console.warn('[Redis] Failed to blacklist token:', err.message);
    return false;
  }
};

/**
 * Checks if a token is in the Redis blacklist.
 */
const isTokenBlacklisted = async (token) => {
  const client = getRedisClient();
  if (!client) return false;
  try {
    const key = `blacklist:${token}`;
    const result = await client.get(key);
    return result === 'revoked';
  } catch (err) {
    console.warn('[Redis] Error checking token blacklist:', err.message);
    return false;
  }
};

module.exports = {
  connectRedis,
  getRedisClient,
  blacklistToken,
  isTokenBlacklisted,
};

