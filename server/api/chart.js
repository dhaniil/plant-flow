import express from 'express';
import { ObjectId } from 'mongodb';
const router = express.Router();

// GET route untuk mengambil semua chart
router.get("/", async (req, res) => {
  try {
    const sensorsCollection = req.app.locals.getCollection('graphs');
    const sensors = await sensorsCollection.find().toArray();
    res.status(200).json(sensors);
  } catch (error) {
    console.error('Error fetching sensors:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
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

//POST route untuk edit chart
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, topic } = req.body;
  try {
    const sensorsCollection = req.app.locals.getCollection('graphs');
    const updatedSensor = { name, topic };
    const result = await sensorsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedSensor }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Sensor tidak ditemukan' });
    }
    res.status(200).json({ message: 'Sensor berhasil diperbarui', updatedSensor });
  } catch (error) {
    console.error('Error updating sensor:', error);
    res.status(400).json({ message: 'Sensor tidak berhasil diperbarui', error: error.message });
  }
});

// DELETE route untuk menghapus chart
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const sensorsCollection = req.app.locals.getCollection('graphs');
    const result = await sensorsCollection.deleteOne({ _id: new ObjectId(id) });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Chart tidak ditemukan' });
    }
    
    res.status(200).json({ message: 'Chart berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting chart:', error);
    res.status(500).json({ message: 'Gagal menghapus chart', error: error.message });
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

export default router; 