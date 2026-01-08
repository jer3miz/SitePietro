import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  try {
    // Create projects table
    await sql`
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
    `;

    // Create actus table
    await sql`
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
    `;

    return res.status(200).json({ 
      message: 'Database initialized successfully',
      tables: ['projects', 'actus']
    });
  } catch (error) {
    console.error('Init error:', error);
    return res.status(500).json({ error: error.message });
  }
}
