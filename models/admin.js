const db = require("../config/db");

// Get admin password
const getAdminPassword = async () => {
  const query = "SELECT password FROM admin WHERE id = 1";
  const result = await db.query(query);
  return result.rows[0]?.password || null;
};

// Update admin password
const updateAdminPassword = async (hashedPassword) => {
  const query = `
    INSERT INTO admin (id, password)
    VALUES (1, $1)
    ON CONFLICT (id)
    DO UPDATE SET password = $1`;
  await db.query(query, [hashedPassword]);
};

module.exports = {
  getAdminPassword,
  updateAdminPassword,
};
