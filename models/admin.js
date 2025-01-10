const { Pool } = require("pg");
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
});

// Get admin password
const getAdminPassword = async () => {
  const query = "SELECT password FROM admin WHERE id = 1";
  const result = await pool.query(query);
  return result.rows[0]?.password || null;
};

// Update admin password
const updateAdminPassword = async (hashedPassword) => {
  const query = `
    INSERT INTO admin (id, password)
    VALUES (1, $1)
    ON CONFLICT (id)
    DO UPDATE SET password = $1`;
  await pool.query(query, [hashedPassword]);
};

module.exports = {
  getAdminPassword,
  updateAdminPassword,
};
