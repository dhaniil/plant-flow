import express from 'express';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dataPath = join(__dirname, '../data/DataSensor.json');

// GET - Ambil data sensor terkini
router.get('/current', async (req, res) => {
  try {
    const sensorService = req.app.locals.sensorService;
    if (!sensorService) {
      throw new Error('Sensor service tidak tersedia');
    }

    const currentData = sensorService.getSensorData();

    if (!currentData || !currentData.lastUpdate) {
      return res.status(404).json({ 
        error: 'Data sensor belum tersedia',
        message: 'Menunggu data dari MQTT'
      });
    }

    // Cek apakah data sudah terlalu lama (lebih dari 10 detik)
    const now = Date.now();
    if (now - currentData.lastUpdate > 10000) {
      return res.status(404).json({
        error: 'Data sensor tidak tersedia',
        message: 'Data sensor terakhir sudah terlalu lama'
      });
    }

    res.json({
      temperature: currentData.temperature,
      humidity: currentData.humidity,
      timestamp: currentData.timestamp
    });
  } catch (error) {
    console.error('Error getting current sensor data:', error);
    res.status(500).json({ 
      error: 'Gagal mengambil data sensor',
      detail: error.message 
    });
  }
});

// GET - Ambil topic sensor
router.get('/topic', async (req, res) => {
  try {
    const data = await fs.readFile(dataPath, 'utf8');
    const sensor = JSON.parse(data);
    res.json(sensor);
  } catch (error) {
    console.error('Error reading sensor data:', error);
    res.status(500).json({ error: 'Gagal mengambil data sensor' });
  }
});

// PUT - Update sensor topic
// PUT - Update sensor topic
router.put('/topic', async (req, res) => {
  try {
    const { topic } = req.body;
    
    if (!topic) {
      return res.status(400).json({ 
        success: false,
        message: 'Topic tidak boleh kosong' 
      });
    }
    
    const sensorData = await fs.readFile(dataPath, 'utf8');
    const sensor = JSON.parse(sensorData);
    
    // Update topic
    sensor.sensor.topic = topic;
    
    // Save updated data
    await fs.writeFile(dataPath, JSON.stringify(sensor, null, 2));

    res.json({
      success: true,
      message: 'Topic berhasil diupdate',
      sensor
    });
  } catch (error) {
    console.error('Error updating topic:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Gagal mengupdate topic'
    });
  }
});

router.get("/latest", async (req, res) => {
  try {
    const sensorService = req.app.locals.sensorService;
    const currentData = sensorService.getSensorData();
    res.json({ current: currentData });
  } catch (error) {
    console.error('Error fetching sensor data:', error);
    res.status(500).json({ message: 'Failed to fetch sensor data' });
  }
});

// GET sensor history
router.get("/history", async (req, res) => {
  try {
    const sensorCollection = req.app.locals.getCollection('sensors');
    const history = await sensorCollection
      .find()
      .sort({ timestamp: -1 })
      .limit(6)
      .toArray();
    
    res.json({ history });
  } catch (error) {
    console.error('Error fetching sensor history:', error);
    res.status(500).json({ message: 'Failed to fetch sensor history' });
  }
});

// GET - Stream sensor data
router.get('/stream', (req, res) => {
  // Set headers untuk SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('X-Accel-Buffering', 'no'); // Untuk Nginx

  // Kirim event khusus untuk koneksi berhasil
  res.write(`event: connected\ndata: ${JSON.stringify({ status: 'connected' })}\n\n`);

  const sensorService = req.app.locals.sensorService;
  if (!sensorService) {
    res.write(`event: error\ndata: ${JSON.stringify({ error: 'Sensor service tidak tersedia' })}\n\n`);
    return res.end();
  }

  // Kirim heartbeat setiap 30 detik
  const heartbeat = setInterval(() => {
    res.write(`event: heartbeat\ndata: ${Date.now()}\n\n`);
  }, 30000);

  // Kirim data awal
  const initialData = sensorService.getSensorData();
  if (initialData) {
    res.write(`data: ${JSON.stringify(initialData)}\n\n`);
  }

  // Subscribe ke perubahan data sensor
  const unsubscribe = sensorService.subscribe((data) => {
    if (data) {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    }
  });

  // Cleanup saat koneksi terputus
  req.on('close', () => {
    clearInterval(heartbeat);
    unsubscribe();
  });

  // Handle timeout koneksi
  req.on('timeout', () => {
    clearInterval(heartbeat);
    unsubscribe();
    res.end();
  });

  // Handle error koneksi
  req.on('error', (error) => {
    console.error('❌ SSE connection error:', error);
    clearInterval(heartbeat);
    unsubscribe();
    res.end();
  });
});

export default router;
