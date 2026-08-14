const { ForbiddenError, UnauthorizedError } = require('../utils/errors');

const adminMiddleware = (req, res, next) => {
  if (!req.user) {
    return next(new UnauthorizedError('Authentication required'));
  }

  if (req.user.role !== 'admin') {
    return next(new ForbiddenError('Access denied: Admin privileges required'));
  }

  next();
};

module.exports = adminMiddleware;
