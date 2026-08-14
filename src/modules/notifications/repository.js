const { query } = require('../../config/database');

const findNotifications = async (userId, status) => {
  const conditions = ['user_id = $1'];
  const values = [userId];

  if (status) {
    values.push(status);
    conditions.push(`status = $${values.length}`);
  }

  const sql = `
    SELECT id, user_id, lead_id, title, message, status, scheduled_at, created_at
    FROM notifications
    WHERE ${conditions.join(' AND ')}
    ORDER BY created_at DESC;
  `;
  const res = await query(sql, values);
  return res.rows;
};

const deleteById = async (id, userId) => {
  const sql = `
    DELETE FROM notifications
    WHERE id = $1 AND user_id = $2
    RETURNING id;
  `;
  const res = await query(sql, [id, userId]);
  return res.rows[0] || null;
};

const deleteByStatus = async (userId, status) => {
  const conditions = ['user_id = $1'];
  const values = [userId];

  if (status) {
    values.push(status);
    conditions.push(`status = $${values.length}`);
  }

  const sql = `
    DELETE FROM notifications
    WHERE ${conditions.join(' AND ')}
    RETURNING id;
  `;
  const res = await query(sql, values);
  return res.rows.length;
};

module.exports = {
  findNotifications,
  deleteById,
  deleteByStatus,
};
