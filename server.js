import 'dotenv/config';
import express from 'express';
import pg from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const { Pool } = pg;
const __dirname = dirname(fileURLToPath(import.meta.url));
const pool = new Pool({ connectionString: process.env.POSTGRES_URL, ssl: { rejectUnauthorized: false } });
const JWT_SECRET = process.env.JWT_SECRET;
const app = express();

app.use(express.json());

// URL propre /admin
app.get('/admin', (req, res) => res.sendFile(join(__dirname, 'admin.html')));

// Auth helper
function verifyToken(req) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return null;
  try { return jwt.verify(auth.split(' ')[1], JWT_SECRET); }
  catch { return null; }
}

// ========================================
// INIT DB
// ========================================
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
    await pool.query(`CREATE TABLE IF NOT EXISTS admin_users (
      id SERIAL PRIMARY KEY, username VARCHAR(100) UNIQUE NOT NULL,
      password_hash TEXT NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`);

    const { rows } = await pool.query('SELECT id FROM admin_users WHERE username = $1', ['admin']);
    if (rows.length === 0) {
      const hash = await bcrypt.hash('Admin2025!', 10);
      await pool.query('INSERT INTO admin_users (username, password_hash) VALUES ($1, $2)', ['admin', hash]);
    }

    res.json({ message: 'Base de données initialisée', tables: ['projects', 'actus', 'admin_users'], admin: 'admin / Admin2025!' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ========================================
// AUTH
// ========================================
app.post('/api/auth', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'Identifiants manquants' });

  try {
    const { rows } = await pool.query('SELECT * FROM admin_users WHERE username = $1', [username]);
    if (rows.length === 0 || !await bcrypt.compare(password, rows[0].password_hash)) {
      return res.status(401).json({ error: 'Identifiants incorrects' });
    }
    const token = jwt.sign({ id: rows[0].id, username: rows[0].username }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, username: rows[0].username });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/auth', (req, res) => {
  const decoded = verifyToken(req);
  if (!decoded) return res.status(401).json({ error: 'Token invalide' });
  res.json({ valid: true, username: decoded.username });
});

// ========================================
// PROJECTS
// ========================================
app.get('/api/projects', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM projects ORDER BY id DESC');
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/projects', async (req, res) => {
  if (!verifyToken(req)) return res.status(401).json({ error: 'Non autorisé' });
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
  if (!verifyToken(req)) return res.status(401).json({ error: 'Non autorisé' });
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
  if (!verifyToken(req)) return res.status(401).json({ error: 'Non autorisé' });
  try {
    await pool.query('DELETE FROM projects WHERE id=$1', [req.query.id]);
    res.json({ message: 'Deleted' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ========================================
// ACTUS
// ========================================
app.get('/api/actus', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM actus ORDER BY date DESC NULLS LAST');
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/actus', async (req, res) => {
  if (!verifyToken(req)) return res.status(401).json({ error: 'Non autorisé' });
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
  if (!verifyToken(req)) return res.status(401).json({ error: 'Non autorisé' });
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
  if (!verifyToken(req)) return res.status(401).json({ error: 'Non autorisé' });
  try {
    await pool.query('DELETE FROM actus WHERE id=$1', [req.query.id]);
    res.json({ message: 'Deleted' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Fichiers statiques en dernier (après toutes les routes API)
app.use(express.static(__dirname));

app.listen(3000, () => console.log('Serveur local : http://localhost:3000'));
