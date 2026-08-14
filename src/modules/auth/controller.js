const authService = require('./service');
const { successResponse } = require('../../utils/api-response');

const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    return successResponse(res, 200, result);
  } catch (error) {
    next(error);
  }
};

const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    return successResponse(res, 201, result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  register,
};
