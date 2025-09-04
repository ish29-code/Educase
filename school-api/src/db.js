import mysql from 'mysql2/promise';

const {
  DB_HOST = 'localhost',
  DB_USER = 'root',
  DB_PASSWORD = '',
  DB_NAME = 'schooldb',
  DB_PORT = 3306,
  DB_CONN_LIMIT = 10,
} = process.env;

export const pool = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  port: Number(DB_PORT),
  waitForConnections: true,
  connectionLimit: Number(DB_CONN_LIMIT),
  queueLimit: 0,
  timezone: 'Z',
});

export async function initDB() {
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS schools (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      address VARCHAR(500) NOT NULL,
      latitude FLOAT NOT NULL,
      longitude FLOAT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  const conn = await pool.getConnection();
  try {
    await conn.query(createTableSQL);
  } finally {
    conn.release();
  }
}
