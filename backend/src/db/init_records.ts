import { query } from './postgres.js';

const sql = `
CREATE TABLE IF NOT EXISTS staff_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(100) NOT NULL,
  department VARCHAR(100) NOT NULL,
  joining_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS leave_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES staff_records(id) ON DELETE CASCADE,
  leave_type VARCHAR(100) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', 
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

async function init() {
  try {
    console.log('Initializing tables...');
    await query(sql);
    console.log('Tables initialized successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Error initializing tables:', err);
    process.exit(1);
  }
}

init();
