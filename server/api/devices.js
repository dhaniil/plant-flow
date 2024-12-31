import express from 'express';
import { ObjectId } from 'mongodb';
const router = express.Router();

// GET route untuk mengambil semua device
router.get("/", async (req, res) => {
  try {
    const devicesCollection = req.app.locals.getCollection('devices');
    const devices = await devicesCollection.find().toArray();
    res.status(200).json(devices);
  } catch (error) {
    console.error('Error fetching devices:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// POST route untuk menambahkan device
router.post("/", async (req, res) => {
  const { device_id, name, status, mqtt_topic } = req.body;
  try {
    const devicesCollection = req.app.locals.getCollection('devices');
    const newDevice = { device_id, name, status, mqtt_topic };
    const result = await devicesCollection.insertOne(newDevice);
    const insertedDevice = await devicesCollection.findOne({ _id: result.insertedId });
    res.status(201).json({ message: 'Device berhasil ditambahkan', device: insertedDevice });
  } catch (error) {
    console.error('Error adding device:', error);
    res.status(400).json({ message: 'Device tidak berhasil ditambahkan', error: error.message });
  }
});

// PUT route untuk mengedit device
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { device_id, name, status, mqtt_topic } = req.body;
  try {
    const devicesCollection = req.app.locals.getCollection('devices');
    const updatedDevice = { device_id, name, status, mqtt_topic };
    const result = await devicesCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedDevice }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Device tidak ditemukan' });
    }
    res.status(200).json({ message: 'Device berhasil diperbarui', updatedDevice });
  } catch (error) {
    console.error('Error updating device:', error);
    res.status(400).json({ message: 'Device tidak berhasil diperbarui', error: error.message });
  }
});

// DELETE route untuk menghapus device
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const devicesCollection = req.app.locals.getCollection('devices');
    const result = await devicesCollection.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Device tidak ditemukan' });
    }
    res.status(200).json({ message: 'Device berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting device:', error);
    res.status(400).json({ message: 'Device tidak berhasil dihapus', error: error.message });
  }
});

export default router; 