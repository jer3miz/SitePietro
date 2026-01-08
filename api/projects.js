import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      // Get all projects
      const { rows } = await sql`
        SELECT * FROM projects ORDER BY id DESC
      `;
      return res.status(200).json(rows);
    }

    if (req.method === 'POST') {
      // Create new project
      const { title, description, image, views, engagement, conversion, tags, homepage } = req.body;
      
      const { rows } = await sql`
        INSERT INTO projects (title, description, image, views, engagement, conversion, tags, homepage)
        VALUES (${title}, ${description}, ${image}, ${views}, ${engagement}, ${conversion}, ${JSON.stringify(tags)}, ${homepage})
        RETURNING *
      `;
      
      return res.status(201).json(rows[0]);
    }

    if (req.method === 'PUT') {
      // Update project
      const { id, title, description, image, views, engagement, conversion, tags, homepage } = req.body;
      
      const { rows } = await sql`
        UPDATE projects
        SET title = ${title}, description = ${description}, image = ${image},
            views = ${views}, engagement = ${engagement}, conversion = ${conversion},
            tags = ${JSON.stringify(tags)}, homepage = ${homepage}
        WHERE id = ${id}
        RETURNING *
      `;
      
      return res.status(200).json(rows[0]);
    }

    if (req.method === 'DELETE') {
      // Delete project
      const { id } = req.query;
      
      await sql`DELETE FROM projects WHERE id = ${id}`;
      
      return res.status(200).json({ message: 'Project deleted' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ error: error.message });
  }
}
