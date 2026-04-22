import express from 'express';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const DB_FILE = join(__dirname, 'local-db.json');

if (!existsSync(DB_FILE)) {
  writeFileSync(DB_FILE, JSON.stringify({ projects: [], actus: [] }, null, 2));
}

function getDB() {
  return JSON.parse(readFileSync(DB_FILE, 'utf-8'));
}

function saveDB(data) {
  writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

app.use(express.json());
app.use(express.static(__dirname));

// Projects
app.get('/api/projects', (req, res) => {
  const db = getDB();
  res.json(db.projects.sort((a, b) => b.id - a.id));
});

app.post('/api/projects', (req, res) => {
  const db = getDB();
  const project = { ...req.body, id: Date.now(), created_at: new Date().toISOString() };
  db.projects.push(project);
  saveDB(db);
  res.status(201).json(project);
});

app.put('/api/projects', (req, res) => {
  const db = getDB();
  const idx = db.projects.findIndex(p => p.id === req.body.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  db.projects[idx] = { ...db.projects[idx], ...req.body };
  saveDB(db);
  res.json(db.projects[idx]);
});

app.delete('/api/projects', (req, res) => {
  const db = getDB();
  db.projects = db.projects.filter(p => p.id !== parseInt(req.query.id));
  saveDB(db);
  res.json({ message: 'Deleted' });
});

// Actus
app.get('/api/actus', (req, res) => {
  const db = getDB();
  res.json(db.actus.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0)));
});

app.post('/api/actus', (req, res) => {
  const db = getDB();
  const actu = { ...req.body, id: Date.now(), created_at: new Date().toISOString() };
  db.actus.push(actu);
  saveDB(db);
  res.status(201).json(actu);
});

app.put('/api/actus', (req, res) => {
  const db = getDB();
  const idx = db.actus.findIndex(a => a.id === req.body.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  db.actus[idx] = { ...db.actus[idx], ...req.body };
  saveDB(db);
  res.json(db.actus[idx]);
});

app.delete('/api/actus', (req, res) => {
  const db = getDB();
  db.actus = db.actus.filter(a => a.id !== parseInt(req.query.id));
  saveDB(db);
  res.json({ message: 'Deleted' });
});

app.get('/api/init-db', (req, res) => {
  res.json({ message: 'Local DB ready', tables: ['projects', 'actus'] });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Serveur local : http://localhost:${PORT}`);
});
