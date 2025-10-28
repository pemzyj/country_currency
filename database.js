import mysql from 'mysql2';
import 'dotenv/config';

export const pool = mysql.createPool({
    host: process.env.host,
    user: process.env.user,
    password: process.env.password,
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

