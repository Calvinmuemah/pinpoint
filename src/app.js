const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const env = require('./config/env');
const errorMiddleware = require('./middleware/error.middleware');
const { apiLimiter } = require('./middleware/rate-limit.middleware');

const app = express();

// Security Middlewares
app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN }));

// Body Parsers
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// General Rate Limiter
app.use('/api', apiLimiter);

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Route Modules (v1 API)
app.use('/api/v1/public', require('./modules/public/routes'));
app.use('/api/v1/auth', require('./modules/auth/routes'));
app.use('/api/v1/user', require('./modules/users/routes'));
app.use('/api/v1/leads', require('./modules/leads/lead.routes'));
app.use('/api/v1/notifications', require('./modules/notifications/routes'));
app.use('/api/v1/analytics', require('./modules/analytics/routes'));
app.use('/api/v1/settings', require('./modules/settings/routes'));

// Backward compatibility alias for /api/
app.use('/api/public', require('./modules/public/routes'));
app.use('/api/auth', require('./modules/auth/routes'));
app.use('/api/user', require('./modules/users/routes'));
app.use('/api/leads', require('./modules/leads/lead.routes'));
app.use('/api/notifications', require('./modules/notifications/routes'));
app.use('/api/analytics', require('./modules/analytics/routes'));
app.use('/api/settings', require('./modules/settings/routes'));

// 404 Route Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Cannot ${req.method} ${req.originalUrl}`,
    },
  });
});

// Global Error Handling Middleware
app.use(errorMiddleware);

module.exports = app;
