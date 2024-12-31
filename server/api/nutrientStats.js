import express from 'express';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();
const NUTRIENT_FILE = join(__dirname, '../data/nutristats.json');

// Memastikan file nutristats.json ada
async function ensureFile() {
  try {
    await fs.access(NUTRIENT_FILE);
  } catch {

    await fs.writeFile(NUTRIENT_FILE, JSON.stringify(defaultData, null, 2));
  }
}

// Get all nutrient topics
router.get('/topics', async (req, res) => {
  try {
    await ensureFile();
    const data = await fs.readFile(NUTRIENT_FILE, 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    res.status(500).json({ error: 'Gagal membaca data nutrient' });
  }
});

// Update topic for specific nutrient
router.put('/topic/:id', async (req, res) => {
  try {
    await ensureFile();
    const { topic } = req.body;
    const { id } = req.params;

    const data = JSON.parse(await fs.readFile(NUTRIENT_FILE, 'utf8'));
    
    const nutrientIndex = data.nutrients.findIndex(n => n.id === id);
    if (nutrientIndex === -1) {
      return res.status(404).json({ error: 'Nutrient tidak ditemukan' });
    }

    data.nutrients[nutrientIndex].topic = topic;
    await fs.writeFile(NUTRIENT_FILE, JSON.stringify(data, null, 2));

    res.json(data.nutrients[nutrientIndex]);
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengupdate topic' });
  }
});

export default router;