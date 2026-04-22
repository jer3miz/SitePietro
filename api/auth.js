import pg from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const { Pool } = pg;
const pool = new Pool({ connectionString: (process.env.POSTGRES_URL || '').replace('sslmode=require', 'sslmode=no-verify'), ssl: { rejectUnauthorized: false } });

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // POST /api/auth — Login
  if (req.method === 'POST') {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ error: 'Identifiants manquants' });
    }

    try {
      const { rows } = await pool.query(
        'SELECT * FROM admin_users WHERE username = $1',
        [username]
      );

      if (rows.length === 0) {
        return res.status(401).json({ error: 'Identifiants incorrects' });
      }

      const valid = await bcrypt.compare(password, rows[0].password_hash);
      if (!valid) {
        return res.status(401).json({ error: 'Identifiants incorrects' });
      }

      const token = jwt.sign(
        { id: rows[0].id, username: rows[0].username },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.status(200).json({ token, username: rows[0].username });
    } catch (error) {
      console.error('Auth error:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  // GET /api/auth — Vérifier le token
  if (req.method === 'GET') {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token manquant' });
    }

    try {
      const decoded = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
      return res.status(200).json({ valid: true, username: decoded.username });
    } catch {
      return res.status(401).json({ error: 'Token invalide ou expiré' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
