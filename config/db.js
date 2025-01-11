const { Pool } = require('pg');

const pool = new Pool({
  user: 'basa', // Your database username
  host: '34.47.178.27', // Public IP of your GCP instance
  database: 'basa', // Your database name
  password: 'basa_backend', // Your database password
  port: 5432, // Default PostgreSQL port
  ssl: false, // Disable SSL
});

module.exports = pool;
