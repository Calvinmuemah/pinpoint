const login = async (credentials) => {
  // TODO: Implement authentication and JWT generation logic
  return { token: 'mock_jwt_token' };
};

const register = async (userData) => {
  // TODO: Implement user registration logic
  return { user: { id: 'mock_user_id', email: userData.email } };
};

module.exports = {
  login,
  register,
};
