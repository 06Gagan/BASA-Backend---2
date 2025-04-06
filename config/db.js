// config/db.js
const { Pool } = require('pg');
require('dotenv').config(); // Keep for local .env loading

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("FATAL ERROR: DATABASE_URL environment variable is not set.");
  // In a real app, you might exit or throw a more specific error
  process.exit(1);
}

const pool = new Pool({
  connectionString: connectionString,
  // Add SSL configuration if required by your deployed DB provider (e.g., Supabase, Neon, Render, Fly.io often require it)
  // Check your provider's documentation. For local, 'ssl: false' is usually fine (or omit ssl).
  // Example for platforms often needing SSL:
  // ssl: {
  //   rejectUnauthorized: false
  // }
});

pool.on('connect', () => {
  console.log('Database pool connected');
});

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle database client', err);
  process.exit(-1); // Exit if pool encounters critical error
});

module.exports = pool; // Export the pool instance