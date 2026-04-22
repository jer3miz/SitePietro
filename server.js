import 'dotenv/config';
import express from 'express';
import pg from 'pg';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const { Pool } = pg;
const __dirname = dirname(fileURLToPath(import.meta.url));
const pool = new Pool({ connectionString: process.env.POSTGRES_URL, ssl: { rejectUnauthorized: false } });
const app = express();

app.use(express.json());
app.use(express.static(__dirname));

// Init DB
app.get('/api/init-db', async (req, res) => {
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS projects (
      id SERIAL PRIMARY KEY, title VARCHAR(255) NOT NULL, description TEXT,
      image TEXT, views VARCHAR(50), engagement VARCHAR(50), conversion VARCHAR(50),
      tags JSONB, homepage BOOLEAN DEFAULT true, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
    await pool.query(`CREATE TABLE IF NOT EXISTS actus (
      id SERIAL PRIMARY KEY, title VARCHAR(255) NOT NULL, excerpt TEXT, content TEXT,
      image TEXT, category VARCHAR(100), date DATE, author VARCHAR(255),
      homepage BOOLEAN DEFAULT true, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);
    res.json({ message: 'Base de données initialisée', tables: ['projects', 'actus'] });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Projects
app.get('/api/projects', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM projects ORDER BY id DESC');
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/projects', async (req, res) => {
  const { title, description, image, views, engagement, conversion, tags, homepage } = req.body;
  try {
    const { rows } = await pool.query(
      'INSERT INTO projects (title, description, image, views, engagement, conversion, tags, homepage) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',
      [title, description, image, views, engagement, conversion, JSON.stringify(tags), homepage]
    );
    res.status(201).json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/projects', async (req, res) => {
  const { id, title, description, image, views, engagement, conversion, tags, homepage } = req.body;
  try {
    const { rows } = await pool.query(
      'UPDATE projects SET title=$1, description=$2, image=$3, views=$4, engagement=$5, conversion=$6, tags=$7, homepage=$8 WHERE id=$9 RETURNING *',
      [title, description, image, views, engagement, conversion, JSON.stringify(tags), homepage, id]
    );
    res.status(200).json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/projects', async (req, res) => {
  try {
    await pool.query('DELETE FROM projects WHERE id=$1', [req.query.id]);
    res.json({ message: 'Deleted' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Actus
app.get('/api/actus', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM actus ORDER BY date DESC NULLS LAST');
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/actus', async (req, res) => {
  const { title, excerpt, content, image, category, date, author, homepage } = req.body;
  try {
    const { rows } = await pool.query(
      'INSERT INTO actus (title, excerpt, content, image, category, date, author, homepage) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',
      [title, excerpt, content, image, category, date, author, homepage]
    );
    res.status(201).json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/actus', async (req, res) => {
  const { id, title, excerpt, content, image, category, date, author, homepage } = req.body;
  try {
    const { rows } = await pool.query(
      'UPDATE actus SET title=$1, excerpt=$2, content=$3, image=$4, category=$5, date=$6, author=$7, homepage=$8 WHERE id=$9 RETURNING *',
      [title, excerpt, content, image, category, date, author, homepage, id]
    );
    res.status(200).json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/actus', async (req, res) => {
  try {
    await pool.query('DELETE FROM actus WHERE id=$1', [req.query.id]);
    res.json({ message: 'Deleted' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.listen(3000, () => console.log('Serveur local : http://localhost:3000'));
