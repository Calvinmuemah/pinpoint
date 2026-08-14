const { errorResponse } = require('../utils/api-response');
const env = require('../config/env');

const errorMiddleware = (err, req, res, next) => {
  console.error('[Error Middleware]:', err);

  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_ERROR';
  const message = err.message || 'Internal Server Error';
  const details = err.details || null;

  // Do not expose stack traces or raw database error details in production
  const safeMessage = (statusCode === 500 && env.NODE_ENV === 'production')
    ? 'Internal Server Error'
    : message;

  return errorResponse(res, statusCode, code, safeMessage, details);
};

module.exports = errorMiddleware;
