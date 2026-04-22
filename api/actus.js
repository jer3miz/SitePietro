import pg from 'pg';
const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.POSTGRES_URL, ssl: { rejectUnauthorized: false } });

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'GET') {
      const { rows } = await pool.query('SELECT * FROM actus ORDER BY date DESC');
      return res.status(200).json(rows);
    }

    if (req.method === 'POST') {
      const { title, excerpt, content, image, category, date, author, homepage } = req.body;
      const { rows } = await pool.query(
        'INSERT INTO actus (title, excerpt, content, image, category, date, author, homepage) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',
        [title, excerpt, content, image, category, date, author, homepage]
      );
      return res.status(201).json(rows[0]);
    }

    if (req.method === 'PUT') {
      const { id, title, excerpt, content, image, category, date, author, homepage } = req.body;
      const { rows } = await pool.query(
        'UPDATE actus SET title=$1, excerpt=$2, content=$3, image=$4, category=$5, date=$6, author=$7, homepage=$8 WHERE id=$9 RETURNING *',
        [title, excerpt, content, image, category, date, author, homepage, id]
      );
      return res.status(200).json(rows[0]);
    }

    if (req.method === 'DELETE') {
      await pool.query('DELETE FROM actus WHERE id=$1', [req.query.id]);
      return res.status(200).json({ message: 'Actu deleted' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ error: error.message });
  }
}
