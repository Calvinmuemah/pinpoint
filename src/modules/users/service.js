const userRepository = require('./repository');
const { NotFoundError, ConflictError } = require('../../utils/errors');

const getProfile = async (userId) => {
  const profile = await userRepository.findProfileById(userId);
  if (!profile) {
    throw new NotFoundError('User profile not found');
  }

  const {
    subscription_id,
    subscription_name,
    subscription_status,
    subscription_price,
    subscription_started_at,
    subscription_expires_at,
    ...user
  } = profile;

  return {
    ...user,
    subscription: subscription_id
      ? {
          id: subscription_id,
          name: subscription_name,
          status: subscription_status,
          price: subscription_price,
          startedAt: subscription_started_at,
          expiresAt: subscription_expires_at,
        }
      : null,
  };
};

const updateProfile = async (userId, { name, email }) => {
  const existing = await userRepository.findByEmailExceptUser(email, userId);
  if (existing) {
    throw new ConflictError('Email address is already in use by another user');
  }

  return await userRepository.updateProfile(userId, name, email);
};

module.exports = {
  getProfile,
  updateProfile,
};
