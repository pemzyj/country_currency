import mysql from 'mysql2';
import 'dotenv/config';

export const pool = mysql.createPool({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: 'country_currency'
}).promise()

(async () => {
    try {
        await pool.query('SELECT 1');
        console.log('Connected to MySQL');
    } catch (err) {
        console.error('Database connection failed:', err);
    }
})();

