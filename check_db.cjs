require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

console.log('Connecting to database (waiting up to 15s)...');
pool.query('SELECT current_database(), current_user, NOW()', (err, res) => {
  if (err) {
    console.error('ERROR: Failed to connect to Neon DB!');
    console.error(err.message);
    process.exit(1);
  } else {
    console.log('SUCCESS: Connected to Neon DB!');
    console.log('Database:', res.rows[0].current_database);
    console.log('User:', res.rows[0].current_user);
    console.log('Time:', res.rows[0].now);
    process.exit(0);
  }
});
