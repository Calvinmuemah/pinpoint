const app = require('./app');
const env = require('./config/env');
const { testDatabaseConnection } = require('./config/database');
const { connectRedis } = require('./config/redis');

const PORT = env.PORT || 3000;

const startServer = async () => {
  console.log(`Starting PinPoint backend [Environment: ${env.NODE_ENV}]...`);

  // Test PostgreSQL Database Connection
  await testDatabaseConnection();

  // Initialize Redis Connection (if configured)
  if (env.REDIS_URL) {
    connectRedis();
  }

  // Start HTTP Server
  app.listen(PORT, () => {
    console.log(`[Server] PinPoint server is running and listening on http://localhost:${PORT}`);
  });
};

startServer();
