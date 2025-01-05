import express from 'express';
import { ObjectId } from 'mongodb';
import authenticate from '../middleware/authMiddleware.js';

const router = express.Router();

// GET route untuk mengambil semua device
router.get("/", authenticate, async (req, res) => {
  try {
    const devicesCollection = req.app.locals.getCollection('devices');
    const devices = await devicesCollection.find().toArray();
    res.status(200).json(devices);
  } catch (error) {

    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

router.post("/", authenticate, async (req, res) => {
  try {
    const { device_id, name, mqtt_topic } = req.body;

    if (!device_id || !name || !mqtt_topic) {
      return res.status(400).json({
        message: "device_id, name, dan mqtt_topic diperlukan",
      });
    }

    const devicesCollection = req.app.locals.getCollection("devices");
    await devicesCollection.createIndex({ device_id: 1 }, { unique: true });


    // Coba tambahkan perangkat baru
    const newDevice = {
      device_id,
      name,
      mqtt_topic,
      status: "off",
      created_at: new Date(),
    };

    try {
      const result = await devicesCollection.insertOne(newDevice);
      console.log("Device berhasil ditambahkan:", newDevice);

      return res.status(201).json({
        message: "Device berhasil ditambahkan",
        device: {
          _id: result.insertedId,
          ...newDevice,
        },
      });
    } catch (dbError) {
      // Tangkap error duplikasi dari MongoDB
      if (dbError.code === 11000) {
        console.error("Device ID sudah digunakan:", device_id);
        return res.status(400).json({
          message: "Device ID sudah digunakan",
        });
      }

      throw dbError; // Lempar error lain ke catch berikutnya
    }
  } catch (error) {
    console.error("Error menambahkan device:", error);
    return res.status(500).json({
      message: "Gagal menambahkan device",
      error: error.message,
    });
  }
});





// PUT route untuk mengedit device
router.put("/:id",  async (req, res) => {
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

router.delete("/:id", authenticate, async (req, res) => {
  try {
      const { id } = req.params;
      const devicesCollection = req.app.locals.getCollection('devices');
      
      // Find device first
      const device = await devicesCollection.findOne({ 
          _id: new ObjectId(id) 
      });

      if (!device) {
          return res.status(404).json({ 
              message: 'Device tidak ditemukan' 
          });
      }

      // Delete device
      const result = await devicesCollection.deleteOne({ 
          _id: new ObjectId(id) 
      });

      if (result.deletedCount === 0) {
          throw new Error('Gagal menghapus device');
      }

      // Unsubscribe from MQTT topic if needed
      const mqttService = req.app.locals.mqttService;
      if (mqttService?.client && device.mqtt_topic) {
          mqttService.client.unsubscribe(device.mqtt_topic);
      }

      res.status(200).json({ 
          success: true,
          message: 'Device berhasil dihapus' 
      });
  } catch (error) {
      console.error('Error deleting device:', error);
      res.status(500).json({ 
          success: false,
          message: 'Gagal menghapus device',
          error: error.message 
      });
  }
});

export default router; 