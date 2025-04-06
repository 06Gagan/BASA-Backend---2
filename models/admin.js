// models/admin.js
const db = require("../config/db"); // Use the configured pool

// Get admin password
const getAdminPassword = async () => {
  const query = "SELECT password FROM admin WHERE id = 1"; // Assuming admin ID is 1
  const result = await db.query(query);
  return result.rows[0]?.password || null;
};

// Update admin password
const updateAdminPassword = async (hashedPassword) => {
  // Clear token on password update
  const query = `UPDATE admin SET password = $1, reset_token_hash = NULL, reset_token_expiry = NULL WHERE id = 1`;
  await db.query(query, [hashedPassword]);
};

// Save reset token details
const saveResetToken = async (hashedToken, expiresAt) => {
  // Assuming admin ID is 1
  const query = `UPDATE admin SET reset_token_hash = $1, reset_token_expiry = $2 WHERE id = 1`;
  await db.query(query, [hashedToken, expiresAt]);
};

// Find admin by reset token hash (and check expiry)
const findAdminByResetToken = async (hashedToken) => {
  // Assuming admin ID is 1
  const query = `SELECT id, reset_token_expiry FROM admin WHERE id = 1 AND reset_token_hash = $1`;
  const result = await db.query(query, [hashedToken]);
  const admin = result.rows[0];

  if (admin && admin.reset_token_expiry > new Date()) {
    // Token found and not expired
    return { id: admin.id }; // Return necessary identifier
  }
  // Token not found or expired
  return null;
};

// Clear reset token details (e.g., after use or expiry)
const clearResetToken = async () => {
  // Assuming admin ID is 1
  const query = `UPDATE admin SET reset_token_hash = NULL, reset_token_expiry = NULL WHERE id = 1`;
  await db.query(query);
};


module.exports = {
  getAdminPassword,
  updateAdminPassword,
  saveResetToken,
  findAdminByResetToken,
  clearResetToken,
};