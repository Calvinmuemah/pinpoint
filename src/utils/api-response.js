const successResponse = (res, statusCode = 200, data = {}, extra = {}) => {
  return res.status(statusCode).json({
    success: true,
    data,
    ...extra,
  });
};

const paginatedResponse = (res, data = [], pagination = {}) => {
  return res.status(200).json({
    success: true,
    data,
    pagination: {
      page: Number(pagination.page) || 1,
      limit: Number(pagination.limit) || 20,
      total: Number(pagination.total) || 0,
      totalPages: Math.ceil((pagination.total || 0) / (pagination.limit || 20)),
    },
  });
};

const errorResponse = (res, statusCode = 500, code = 'INTERNAL_ERROR', message = 'Internal Server Error', details = null) => {
  const payload = {
    success: false,
    error: {
      code,
      message,
      ...(details ? { details } : {}),
    },
  };
  return res.status(statusCode).json(payload);
};

module.exports = {
  successResponse,
  paginatedResponse,
  errorResponse,
};
