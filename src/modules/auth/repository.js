const { query } = require('../../config/database');

const findByEmail = async (email) => {
  const sql = `
    SELECT u.id, u.name, u.email, u.password_hash, u.role, u.subscription_id, u.created_at,
           s.name as subscription_name, s.status as subscription_status
    FROM users u
    LEFT JOIN subscriptions s ON u.subscription_id = s.id
    WHERE u.email = $1;
  `;
  const res = await query(sql, [email]);
  return res.rows[0] || null;
};

const createUser = async (name, email, passwordHash) => {
  const sql = `
    INSERT INTO users (name, email, password_hash)
    VALUES ($1, $2, $3)
    RETURNING id, name, email, role, subscription_id, created_at;
  `;
  const res = await query(sql, [name, email, passwordHash]);
  return res.rows[0];
};

module.exports = {
  findByEmail,
  createUser,
};
