const userService = require('./user.service');

const getProfile = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.user?.id);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
};
