import express from 'express';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const router = express.Router();

// Get current file directory in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dataPath = join(__dirname, '../data/DataSensor.json');

// GET - Ambil topic sensor
router.get('/topic', async (req, res) => {
  try {
    console.log('Reading file from:', dataPath);
    const data = await fs.readFile(dataPath, 'utf8');
    console.log('Raw data:', data);
    const sensor = JSON.parse(data);
    console.log('Parsed data:', sensor);
    res.json(sensor);
  } catch (error) {
    console.error('Error reading sensor data:', error);
    res.status(500).json({ 
      error: 'Gagal mengambil data sensor', 
      detail: error.message,
      path: dataPath 
    });
  }
});

// PUT - Update topic sensor
router.put('/topic', async (req, res) => {
  try {
    const { topic } = req.body;
    if (!topic) {
      return res.status(400).json({ error: 'Topic tidak boleh kosong' });
    }
    
    const data = await fs.readFile(dataPath, 'utf8');
    const sensor = JSON.parse(data);
    sensor.sensor.topic = topic;
    
    await fs.writeFile(dataPath, JSON.stringify(sensor, null, 2));
    res.json(sensor);
  } catch (error) {
    console.error('Error updating sensor topic:', error);
    res.status(500).json({ error: 'Gagal mengupdate topic sensor' });
  }
});

export default router;
