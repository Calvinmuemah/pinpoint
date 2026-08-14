const { ValidationError } = require('../utils/errors');

const validate = (schema) => (req, res, next) => {
  try {
    if (schema.body) {
      req.body = schema.body.parse(req.body);
    }
    if (schema.query) {
      req.query = schema.query.parse(req.query);
    }
    if (schema.params) {
      req.params = schema.params.parse(req.params);
    }
    next();
  } catch (error) {
    if (error.errors || error.issues) {
      const details = (error.errors || error.issues).map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      return next(new ValidationError('Request validation failed', details));
    }
    next(error);
  }
};

module.exports = validate;
