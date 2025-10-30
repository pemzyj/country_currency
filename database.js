import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Try .env.local first (development), then .env (production/Railway)
const envLocalPath = path.join(__dirname, '.env.local');
const envPath = path.join(__dirname, '.env');

let envFileUsed;
if (fs.existsSync(envLocalPath)) {
  console.log('📁 Loading .env.local (development)');
  dotenv.config({ path: envLocalPath });
  envFileUsed = '.env.local';
} else if (fs.existsSync(envPath)) {
  console.log('📁 Loading .env (production)');
  dotenv.config({ path: envPath });
  envFileUsed = '.env';
} else {
  console.log('⚠️ No .env file found - using Railway environment variables');
  envFileUsed = 'none';
}

console.log('🔍 Environment Variables:');
console.log('   Loaded from:', envFileUsed);
console.log('   DB_HOST:', process.env.DB_HOST);
console.log('   DB_USER:', process.env.DB_USER);
console.log('   DB_PASSWORD:', process.env.DB_PASSWORD ? '***exists***' : '⚠️ MISSING!');
console.log('   DB_NAME:', process.env.DB_NAME);
console.log('   DB_PORT:', process.env.DB_PORT);
console.log('   MYSQL_URL:', process.env.MYSQL_URL ? 'exists' : 'not set');

let poolConfig;

// Railway provides MYSQL_URL
if (process.env.MYSQL_URL) {
  console.log('✅ Using Railway MYSQL_URL');
  poolConfig = process.env.MYSQL_URL;
} else {
  // Local development
  console.log('✅ Using local MySQL');
  poolConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'country_currency',
    port: parseInt(process.env.DB_PORT || '3306'),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  };
}

const pool = mysql.createPool(poolConfig);



export async function initDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS countries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        capital VARCHAR(255),
        region VARCHAR(100),
        population BIGINT NOT NULL,
        currency_code VARCHAR(10),
        exchange_rate DECIMAL(15, 4),
        estimated_gdp DECIMAL(20, 2),
        flag_url TEXT,
        last_refreshed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_region (region),
        INDEX idx_currency (currency_code),
        INDEX idx_name (name)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS refresh_metadata (
        id INT PRIMARY KEY DEFAULT 1,
        last_refreshed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        total_countries INT DEFAULT 0,
        CHECK (id = 1)
      )
    `);

    await pool.query(`
      INSERT IGNORE INTO refresh_metadata (id) VALUES (1)
    `);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
}

export default pool;


