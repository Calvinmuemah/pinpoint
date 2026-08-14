const getPagination = (queryPage, queryLimit, defaultLimit = 20, maxLimit = 100) => {
  const page = Math.max(1, parseInt(queryPage, 10) || 1);
  const limit = Math.min(maxLimit, Math.max(1, parseInt(queryLimit, 10) || defaultLimit));
  const offset = (page - 1) * limit;

  return { page, limit, offset };
};

module.exports = {
  getPagination,
};
