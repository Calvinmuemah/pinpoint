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

const refreshToken = async (req, res, next) => {
  try {
    const result = await authService.refreshAuthToken(req.body);
    return successResponse(res, 200, result);
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
    const { refreshToken: rawRefreshToken } = req.body || {};

    const result = await authService.logout({ token, refreshToken: rawRefreshToken });
    return successResponse(res, 200, result);
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const result = await authService.forgotPassword(req.body);
    return successResponse(res, 200, result);
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const result = await authService.resetPassword(req.body);
    return successResponse(res, 200, result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  register,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
};

