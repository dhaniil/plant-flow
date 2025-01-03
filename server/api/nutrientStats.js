import express from 'express';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const NUTRIENT_FILE = join(__dirname, '../data/nutristats.json');

const defaultData = {
  nutrients: []
};


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
    const parsedData = JSON.parse(data);
    res.json(parsedData);
  } catch (error) {
    console.error('Error reading nutrient data:', error);
    res.status(500).json({ 
      error: 'Gagal membaca data nutrient',
      detail: error.message 
    });
  }
});

// Update topic for specific nutrient
router.put('/topic/:id', async (req, res) => {
  try {
    await ensureFile();
    const { topic } = req.body;
    const { id } = req.params;

    if (!topic) {
      return res.status(400).json({ error: 'Topic tidak boleh kosong' });
    }

    const data = JSON.parse(await fs.readFile(NUTRIENT_FILE, 'utf8'));
    const nutrientIndex = data.nutrients.findIndex(n => n.id === id);
    
    if (nutrientIndex === -1) {
      return res.status(404).json({ error: 'Nutrient tidak ditemukan' });
    }

    data.nutrients[nutrientIndex].topic = topic;
    await fs.writeFile(NUTRIENT_FILE, JSON.stringify(data, null, 2));

    // Update topics di sensorService
    const sensorService = req.app.locals.sensorService;
    if (sensorService) {
      await sensorService.loadTopics();
    }

    res.json(data.nutrients[nutrientIndex]);
  } catch (error) {
    console.error('Error updating nutrient topic:', error);
    res.status(500).json({ 
      error: 'Gagal mengupdate topic',
      detail: error.message 
    });
  }
});

router.get('/current', async (req, res) => {
  try {
    const sensorService = req.app.locals.sensorService;
    const currentData = {
      ph: sensorService.getNutrientValue('ph'),
      tds: sensorService.getNutrientValue('tds'),
      ec: sensorService.getNutrientValue('ec'),
      nutrient: sensorService.getNutrientValue('nutrient')
    };
    res.json(currentData);
  } catch (error) {
    console.error('Error fetching nutrient data:', error);
    res.status(500).json({ message: 'Failed to fetch nutrient data' });
  }
});

export default router;