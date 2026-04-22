import pg from 'pg';
import jwt from 'jsonwebtoken';

const { Pool } = pg;
const pool = new Pool({ connectionString: (process.env.POSTGRES_URL || '').replace('sslmode=require', 'sslmode=no-verify'), ssl: { rejectUnauthorized: false } });

function verifyToken(req) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return null;
  try {
    return jwt.verify(auth.split(' ')[1], process.env.JWT_SECRET);
  } catch { return null; }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'GET') {
      const { rows } = await pool.query('SELECT * FROM projects ORDER BY id DESC');
      return res.status(200).json(rows);
    }

    // Routes protégées
    if (!verifyToken(req)) {
      return res.status(401).json({ error: 'Non autorisé' });
    }

    if (req.method === 'POST') {
      const { title, description, image, views, engagement, conversion, tags, homepage } = req.body;
      const { rows } = await pool.query(
        'INSERT INTO projects (title, description, image, views, engagement, conversion, tags, homepage) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',
        [title, description, image, views, engagement, conversion, JSON.stringify(tags), homepage]
      );
      return res.status(201).json(rows[0]);
    }

    if (req.method === 'PUT') {
      const { id, title, description, image, views, engagement, conversion, tags, homepage } = req.body;
      const { rows } = await pool.query(
        'UPDATE projects SET title=$1, description=$2, image=$3, views=$4, engagement=$5, conversion=$6, tags=$7, homepage=$8 WHERE id=$9 RETURNING *',
        [title, description, image, views, engagement, conversion, JSON.stringify(tags), homepage, id]
      );
      return res.status(200).json(rows[0]);
    }

    if (req.method === 'DELETE') {
      await pool.query('DELETE FROM projects WHERE id=$1', [req.query.id]);
      return res.status(200).json({ message: 'Project deleted' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ error: error.message });
  }
}
