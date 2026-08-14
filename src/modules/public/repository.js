const { query } = require('../../config/database');

const createInquiry = async (data) => {
  const sql = `
    INSERT INTO contact_inquiries (full_name, business_name, email, industry, message, status)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id, full_name, business_name, email, industry, message, status, created_at;
  `;
  const values = [
    data.fullName,
    data.businessName || '',
    data.email,
    data.industry || '',
    data.message,
    'New',
  ];
  const res = await query(sql, values);
  return res.rows[0];
};

module.exports = {
  createInquiry,
};
