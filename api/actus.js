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
      // Get all actus
      const { rows } = await sql`
        SELECT * FROM actus ORDER BY date DESC
      `;
      return res.status(200).json(rows);
    }

    if (req.method === 'POST') {
      // Create new actu
      const { title, excerpt, content, image, category, date, author, homepage } = req.body;
      
      const { rows } = await sql`
        INSERT INTO actus (title, excerpt, content, image, category, date, author, homepage)
        VALUES (${title}, ${excerpt}, ${content}, ${image}, ${category}, ${date}, ${author}, ${homepage})
        RETURNING *
      `;
      
      return res.status(201).json(rows[0]);
    }

    if (req.method === 'PUT') {
      // Update actu
      const { id, title, excerpt, content, image, category, date, author, homepage } = req.body;
      
      const { rows } = await sql`
        UPDATE actus
        SET title = ${title}, excerpt = ${excerpt}, content = ${content},
            image = ${image}, category = ${category}, date = ${date},
            author = ${author}, homepage = ${homepage}
        WHERE id = ${id}
        RETURNING *
      `;
      
      return res.status(200).json(rows[0]);
    }

    if (req.method === 'DELETE') {
      // Delete actu
      const { id } = req.query;
      
      await sql`DELETE FROM actus WHERE id = ${id}`;
      
      return res.status(200).json({ message: 'Actu deleted' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Database error:', error);
    return res.status(500).json({ error: error.message });
  }
}
