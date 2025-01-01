import express from 'express';
import { ObjectId } from 'mongodb';
const router = express.Router();

// GET - Mengambil semua jadwal
router.get("/", async (req, res) => {
  try {
    const jadwalCollection = req.app.locals.getCollection('jadwal');
    const jadwal = await jadwalCollection.find().toArray();
    res.status(200).json(jadwal);
  } catch (error) {
    console.error('Error fetching jadwal:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// GET - Mengambil jadwal berdasarkan devices
router.get("/device/:device_id", async (req, res) => {
  try {
    const { device_id } = req.params;
    console.log('Fetching schedules for device:', device_id);

    const jadwalCollection = req.app.locals.getCollection('jadwal');
    const deviceCollection = req.app.locals.getCollection('devices');

    // Cari device terlebih dahulu menggunakan device_id
    const device = await deviceCollection.findOne({ device_id });
    if (!device) {
      return res.status(404).json({ message: 'Device tidak ditemukan' });
    }

    // Cari jadwal berdasarkan device_id (bukan _id)
    const jadwal = await jadwalCollection.find({
      devices: device_id  // Gunakan device_id, bukan _id
    }).toArray();
    
    console.log('Found schedules:', jadwal);
    
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(jadwal);
  } catch (error) {
    console.error('Error fetching jadwal:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// POST - Membuat jadwal baru
router.post("/", async (req, res) => {
  try {
    const { devices, name, waktu, hari, action, payload } = req.body;
    
    if (!devices || !Array.isArray(devices) || devices.length === 0) {
      return res.status(400).json({ message: 'Devices array diperlukan dan tidak boleh kosong' });
    }

    const jadwalCollection = req.app.locals.getCollection('jadwal');
    const deviceCollection = req.app.locals.getCollection('devices');

    // Validasi semua device_id valid
    const deviceDocs = await deviceCollection.find({ 
      device_id: { $in: devices } 
    }).toArray();

    if (deviceDocs.length !== devices.length) {
      return res.status(400).json({ message: 'Beberapa device_id tidak valid' });
    }
    
    const newJadwal = {
      devices,
      name,
      waktu,
      hari,
      action,
      payload,
      status: 'active',
      created_at: new Date(),
      updated_at: new Date()
    };

    const result = await jadwalCollection.insertOne(newJadwal);
    
    // Update devices dengan jadwal_id
    await Promise.all(deviceDocs.map(device => 
      deviceCollection.updateOne(
        { device_id: device.device_id },
        { $push: { jadwal_id: result.insertedId } }
      )
    ));

    const insertedJadwal = await jadwalCollection.findOne({ _id: result.insertedId });
    
    res.status(201).json({ 
      message: 'Jadwal berhasil ditambahkan', 
      jadwal: insertedJadwal 
    });
  } catch (error) {
    console.error('Error adding jadwal:', error);
    res.status(400).json({ 
      message: 'Jadwal tidak berhasil ditambahkan', 
      error: error.message 
    });
  }
});

// PUT - Mengupdate jadwal
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { devices, name, waktu, hari, action, status, payload } = req.body;
    
    // Validasi data yang diperlukan
    if (!devices || !Array.isArray(devices) || devices.length === 0) {
      return res.status(400).json({ message: 'Devices array diperlukan dan tidak boleh kosong' });
    }

    const jadwalCollection = req.app.locals.getCollection('jadwal');

    const updatedJadwal = {
      devices, // Sekarang menggunakan array devices
      name,
      waktu,
      hari,
      action,
      payload,
      status: status || 'active',
      updated_at: new Date()
    };

    const result = await jadwalCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedJadwal }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Jadwal tidak ditemukan' });
    }

    res.status(200).json({ 
      message: 'Jadwal berhasil diperbarui', 
      jadwal: updatedJadwal 
    });
  } catch (error) {
    console.error('Error updating jadwal:', error);
    res.status(400).json({ 
      message: 'Jadwal tidak berhasil diperbarui', 
      error: error.message 
    });
  }
});

// DELETE - Menghapus jadwal
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const jadwalCollection = req.app.locals.getCollection('jadwal');
    const deviceCollection = req.app.locals.getCollection('devices');
    
    // Hapus referensi jadwal_id dari devices
    await deviceCollection.updateMany(
      { jadwal_id: new ObjectId(id) },
      { $pull: { jadwal_id: new ObjectId(id) } }
    );
    
    const result = await jadwalCollection.deleteOne({ _id: new ObjectId(id) });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Jadwal tidak ditemukan' });
    }

    res.status(200).json({ message: 'Jadwal berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting jadwal:', error);
    res.status(400).json({ 
      message: 'Jadwal tidak berhasil dihapus', 
      error: error.message 
    });
  }
});

export default router; 