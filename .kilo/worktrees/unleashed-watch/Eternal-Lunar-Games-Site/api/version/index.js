import { readFileSync } from 'fs';
import { join } from 'path';

/**
 * Returns a lightweight version descriptor for a data table.
 * The static JSON file is read from /public/data/<table>.json so editors
 * can update content locally; when deployed via git/Vercel the API reflects
 * the latest commit.
 */
export default function handler(req, res) {
  const table = req.query?.table;

  // Allow either /api/version/projects or /api/version?table=projects
  const tableName = table || (req.url && req.url.match(/\/api\/version\/(.+)/)?.[1]);

  if (!tableName || !['projects', 'sneak_peeks', 'mods'].includes(tableName)) {
    res.status(400).json({ error: 'Invalid table name. Use: projects, sneak_peeks, or mods' });
    return;
  }

  try {
    const filePath = join(process.cwd(), 'public', 'data', `${tableName}.json`);
    const fileContent = readFileSync(filePath, 'utf-8');
    const data = JSON.parse(fileContent);

    // Compute a lightweight hash based on IDs and update timestamps
    const hashInput = JSON.stringify(
      data.map((item) => ({
        id: item.id,
        updated_at: item.updated_at || item.created_at,
        title: item.title,
      }))
    );

    let hash = 0;
    for (let i = 0; i < hashInput.length; i++) {
      const char = hashInput.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    const version = Math.abs(hash).toString(36);

    res.setHeader('Cache-Control', 'no-store, max-age=0');
    res.status(200).json({
      version,
      timestamp: Date.now(),
      count: data.length,
    });
  } catch (error) {
    res.setHeader('Cache-Control', 'no-store, max-age=0');
    res.status(500).json({ error: error.message || 'Failed to read data file' });
  }
}
