import { Pool } from 'pg';

console.log('🔌 [DB] Initializing PostgreSQL connection pool...');
console.log('🔌 [DB] Database URL:', process.env.DATABASE_URL?.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@'));

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
});

// Test connection on initialization
pool.connect()
  .then(client => {
    console.log('✅ [DB] PostgreSQL connection successful!');
    return client.query('SELECT NOW(), current_database(), current_user');
  })
  .then(result => {
    console.log('✅ [DB] Connected to database:', result.rows[0].current_database);
    console.log('✅ [DB] Connected as user:', result.rows[0].current_user);
    console.log('✅ [DB] Server time:', result.rows[0].now);
  })
  .catch(err => {
    console.error('❌ [DB] PostgreSQL connection failed:', err.message);
    console.error('❌ [DB] Make sure DATABASE_URL is correct and database is running');
  });

// Handle pool errors
pool.on('error', (err) => {
  console.error('❌ [DB] Unexpected error on idle client:', err.message);
});

pool.on('connect', () => {
  console.log('🔗 [DB] New client connected to pool');
});

pool.on('remove', () => {
  console.log('🔌 [DB] Client removed from pool');
});
