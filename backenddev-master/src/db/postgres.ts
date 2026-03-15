import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Log the effective connection info (mask password) to help debug runtime issues
try {
  const raw = process.env.DATABASE_URL;
  if (raw) {
    try {
      const u = new URL(raw);
      const masked = `${u.protocol}//${u.username}:${u.password ? '*****' : ''}@${u.hostname}:${u.port}${u.pathname}`;
      console.log('Postgres connection:', masked);
    } catch {
      console.log('Postgres connection string present (masked)');
    }
  } else {
    console.log('Postgres DATABASE_URL not set; using default pg behavior');
  }
} catch {
  // ignore
}

pool.on('connect', () => {
  console.log('PostgreSQL connected');
});

pool.on('error', (err) => {
  console.error('PostgreSQL error', err);
});

export default pool;

// Helper functions for database operations
export const query = async (text: string, params?: unknown[]) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (err) {
    console.error('Query error', err);
    throw err;
  }
};

export const getClient = async () => {
  const client = await pool.connect();
  const release = client.release;

  // Set a timeout of 5 seconds, after which we will log this client's last query
  const timeout = setTimeout(() => {
    console.error('A client has been checked out for more than 5 seconds!');
    // Removed: lastQuery property does not exist on PoolClient
  }, 5000);

  // Removed monkey patching of client.query and lastQuery
  client.release = () => {
    clearTimeout(timeout);
    client.release = release;
    return release.apply(client);
  };

  return client;
};