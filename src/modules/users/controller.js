const userService = require('./service');
const { successResponse } = require('../../utils/api-response');

const getProfile = async (req, res, next) => {
  try {
    const profile = await userService.getProfile(req.user.id);
    return successResponse(res, 200, profile);
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const updated = await userService.updateProfile(req.user.id, req.body);
    return successResponse(res, 200, updated);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
};
