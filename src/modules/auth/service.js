const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authRepository = require('./repository');
const env = require('../../config/env');
const { UnauthorizedError, ConflictError } = require('../../utils/errors');

const login = async ({ email, password }) => {
  const user = await authRepository.findByEmail(email);
  if (!user) {
    throw new UnauthorizedError('Invalid credentials');
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    throw new UnauthorizedError('Invalid credentials');
  }

  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  const token = jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });

  const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  });

  return {
    token,
    refreshToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      subscription: user.subscription_name
        ? { name: user.subscription_name, status: user.subscription_status }
        : null,
    },
  };
};

const register = async ({ name, email, password }) => {
  const existing = await authRepository.findByEmail(email);
  if (existing) {
    throw new ConflictError('User account with this email already exists');
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const newUser = await authRepository.createUser(name, email, passwordHash);

  const payload = {
    id: newUser.id,
    email: newUser.email,
    role: newUser.role,
  };

  const token = jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });

  return {
    token,
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    },
  };
};

module.exports = {
  login,
  register,
};
