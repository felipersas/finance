import { Pool } from 'pg';

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
});

// Test connection on initialization (silent unless error)
pool.connect()
  .then(client => {
    client.query('SELECT NOW()').then(() => client.release());
  })
  .catch(err => {
    console.error('❌ [DB] Connection failed:', err.message);
  });

// Handle pool errors (only log errors)
pool.on('error', (err) => {
  console.error('❌ [DB] Pool error:', err.message);
});
