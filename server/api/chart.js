import express from 'express';
import { ObjectId } from 'mongodb';
import authenticate from '../middleware/authMiddleware.js';
const router = express.Router();

// GET route untuk mengambil semua chart
router.get("/", async (req, res) => {
  try {
    const chartCollection = req.app.locals.getCollection('graphs');
    const charts = await chartCollection.find({}).toArray();
    
    console.log('Fetched charts:', charts); // Debugging
    
    if (!charts) {
      return res.json([]);
    }

    res.json(charts);
  } catch (error) {
    console.error('Error fetching charts:', error);
    res.status(500).json({ 
      message: 'Gagal mengambil data charts', 
      error: error.message 
    });
  }
});

// POST route untuk menambahkan chart
router.post("/", async (req, res) => {
  const { name, topic } = req.body;
  try {
    const sensorsCollection = req.app.locals.getCollection('graphs');
    const newSensor = { name, topic };
    const result = await sensorsCollection.insertOne(newSensor);
    const insertedSensor = await sensorsCollection.findOne({ _id: result.insertedId });
    res.status(201).json({ message: 'Sensor berhasil ditambahkan', sensor: insertedSensor });
  } catch (error) {
    console.error('Error adding sensor:', error);
    res.status(400).json({ message: 'Sensor tidak berhasil ditambahkan', error: error.message });
  }
});

//PUT route untuk update chart
router.put("/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, topic } = req.body;

    if (!name || !topic) {
      return res.status(400).json({ message: 'Name dan topic harus diisi' });
    }

    const chartCollection = req.app.locals.getCollection('graphs');
    const result = await chartCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { name, topic } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Chart tidak ditemukan' });
    }

    res.json({ message: 'Chart berhasil diupdate', id, name, topic });
  } catch (error) {
    console.error('Error updating chart:', error);
    res.status(500).json({ message: 'Gagal mengupdate chart', error: error.message });
  }
});

// DELETE route untuk menghapus chart
router.delete("/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Attempting to delete chart with ID:', id); // Debugging

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID tidak valid'
      });
    }

    const chartCollection = req.app.locals.getCollection('graphs');
    
    // Cek apakah chart ada sebelum dihapus
    const chart = await chartCollection.findOne({ _id: new ObjectId(id) });
    
    if (!chart) {
      console.log('Chart not found:', id); // Debugging
      return res.status(404).json({
        success: false,
        message: 'Chart tidak ditemukan'
      });
    }

    // Hapus chart
    const result = await chartCollection.deleteOne({ 
      _id: new ObjectId(id) 
    });

    console.log('Delete result:', result); // Debugging

    if (result.deletedCount === 1) {
      // Hapus data dari chartService jika ada
      const chartService = req.app.locals.chartService;
      if (chartService && chartService.removeChartData) {
        chartService.removeChartData(id);
      }
      
      console.log('Chart deleted successfully:', id); // Debugging
      return res.json({ 
        success: true,
        message: 'Chart berhasil dihapus', 
        id 
      });
    } else {
      throw new Error('Gagal menghapus chart dari database');
    }

  } catch (error) {
    console.error('Error deleting chart:', error);
    res.status(500).json({ 
      success: false,
      message: 'Gagal menghapus chart', 
      error: error.message 
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const chartCollection = req.app.locals.getCollection('graphs');
    const chart = await chartCollection.findOne({ _id: new ObjectId(id) });
    
    if (!chart) {
      return res.status(404).json({ message: 'Chart tidak ditemukan' });
    }

    // Ambil data dari chartService memory
    const chartService = req.app.locals.chartService;
    const chartData = chartService.getChartData(id) || { data: [], labels: [] };

    res.json({
      data: chartData.data,
      labels: chartData.labels
    });
  } catch (error) {
    console.error('Error fetching chart data:', error);
    res.status(500).json({ message: 'Gagal mengambil data chart' });
  }
});

// GET route untuk mendapatkan data MQTT berdasarkan topic
router.get("/mqtt/data/:topic",  async (req, res) => {
  const { topic } = req.params;
  try {
    const client = req.app.locals.mqttClient;
    let messageReceived = false;

    // Handler untuk pesan MQTT
    const messageHandler = (receivedTopic, message) => {
      if (receivedTopic === topic && !messageReceived) {
        messageReceived = true;
        client.removeListener('message', messageHandler);
        client.unsubscribe(topic);
        res.json({
          value: message.toString(),
          timestamp: new Date().toISOString()
        });
      }
    };

    // Subscribe ke topic
    client.subscribe(topic);
    client.on('message', messageHandler);

    // Timeout setelah 2 detik jika tidak ada pesan
    setTimeout(() => {
      if (!messageReceived) {
        client.removeListener('message', messageHandler);
        client.unsubscribe(topic);
        res.json({ value: null, timestamp: new Date().toISOString() });
      }
    }, 2000);

  } catch (error) {
    console.error('Error getting MQTT data:', error);
    res.status(500).json({ message: 'Gagal mendapatkan data MQTT', error: error.message });
  }
});

export default router; 