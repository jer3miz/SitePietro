import pg from 'pg';
import bcrypt from 'bcryptjs';

const { Pool } = pg;
const pool = new Pool({ connectionString: (process.env.POSTGRES_URL || '').replace('sslmode=require', 'sslmode=no-verify'), ssl: { rejectUnauthorized: false } });

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        image TEXT,
        views VARCHAR(50),
        engagement VARCHAR(50),
        conversion VARCHAR(50),
        tags JSONB,
        homepage BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS actus (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        excerpt TEXT,
        content TEXT,
        image TEXT,
        category VARCHAR(100),
        date DATE,
        author VARCHAR(255),
        homepage BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Créer l'admin par défaut s'il n'existe pas
    const { rows } = await pool.query('SELECT id FROM admin_users WHERE username = $1', ['admin']);
    if (rows.length === 0) {
      const hash = await bcrypt.hash('Admin2025!', 10);
      await pool.query(
        'INSERT INTO admin_users (username, password_hash) VALUES ($1, $2)',
        ['admin', hash]
      );
    }

    return res.status(200).json({
      message: 'Base de données initialisée',
      tables: ['projects', 'actus', 'admin_users'],
      admin: 'Identifiants par défaut : admin / Admin2025! (à changer !)'
    });
  } catch (error) {
    console.error('Init error:', error);
    return res.status(500).json({ error: error.message });
  }
}
