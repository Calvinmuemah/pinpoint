const { query } = require('../../config/database');

const findProfileById = async (userId) => {
  const sql = `
    SELECT u.id, u.name, u.email, u.role, u.created_at, u.updated_at,
           s.id as subscription_id, s.name as subscription_name, s.status as subscription_status,
           s.price as subscription_price, s.started_at as subscription_started_at, s.expires_at as subscription_expires_at
    FROM users u
    LEFT JOIN subscriptions s ON u.subscription_id = s.id
    WHERE u.id = $1;
  `;
  const res = await query(sql, [userId]);
  return res.rows[0] || null;
};

const updateProfile = async (userId, name, email) => {
  const sql = `
    UPDATE users
    SET name = $1, email = $2, updated_at = CURRENT_TIMESTAMP
    WHERE id = $3
    RETURNING id, name, email, role, updated_at;
  `;
  const res = await query(sql, [name, email, userId]);
  return res.rows[0];
};

const findByEmailExceptUser = async (email, userId) => {
  const sql = `
    SELECT id FROM users WHERE email = $1 AND id != $2;
  `;
  const res = await query(sql, [email, userId]);
  return res.rows[0] || null;
};

module.exports = {
  findProfileById,
  updateProfile,
  findByEmailExceptUser,
};
