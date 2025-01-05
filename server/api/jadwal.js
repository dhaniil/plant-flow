import express from 'express';
import { ObjectId } from 'mongodb';
import authenticate from '../middleware/authMiddleware.js'; // Import middleware

const router = express.Router();

const getJadwalCollection = async (req) => {
  let attempts = 3;
  while (attempts > 0) {
    try {
      const collection = req.app.locals.getCollection('jadwal');
      if (collection) return collection;
      throw new Error('Collection tidak ditemukan');
    } catch (error) {
      attempts--;
      if (attempts === 0) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
};

// GET - Mengambil semua jadwal
router.get("/", authenticate, async (req, res) => {
  try {
    const jadwalCollection = await getJadwalCollection(req);
    const jadwal = await jadwalCollection.find({}).toArray();
    
    res.json({
      success: true,
      data: jadwal || []
    });
  } catch (error) {
    console.error('Error fetching jadwal:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil data jadwal',
      error: error.toString()
    });
  }
});

// GET - Mengambil jadwal berdasarkan devices
router.get("/device/:device_id", async (req, res) => {
  try {
    const { device_id } = req.params;
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
    
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(jadwal);
  } catch (error) {
    console.error('Error fetching jadwal:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// POST - Membuat jadwal baru
router.post("/", authenticate, async (req, res) => {
  try {
    const { devices, name, waktu, hari, action, payload, status } = req.body;

    // Validasi input yang lebih ketat
    if (!devices || !Array.isArray(devices) || devices.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Minimal satu perangkat harus dipilih' 
      });
    }
    
    if (!name?.trim()) {
      return res.status(400).json({ 
        success: false,
        message: 'Nama jadwal harus diisi' 
      });
    }
    
    if (!waktu?.trim()) {
      return res.status(400).json({ 
        success: false,
        message: 'Waktu harus diisi' 
      });
    }
    
    if (!hari || !Array.isArray(hari) || hari.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'Minimal satu hari harus dipilih' 
      });
    }

    const jadwalCollection = req.app.locals.getCollection('jadwal');
    
    const newJadwal = {
      devices,
      name: name.trim(),
      waktu,
      hari,
      action: action || 'on',
      status: status || 'active',
      payload: payload || '1',
      createdAt: new Date()
    };

    const result = await jadwalCollection.insertOne(newJadwal);
    
    if (!result.insertedId) {
      throw new Error('Gagal menyimpan ke database');
    }

    const insertedJadwal = await jadwalCollection.findOne({ 
      _id: result.insertedId 
    });

    res.status(201).json({
      success: true,
      message: 'Jadwal berhasil ditambahkan',
      jadwal: insertedJadwal
    });

  } catch (error) {
    console.error('Error adding jadwal:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menambahkan jadwal',
      error: error.message
    });
  }
});

// PUT - Mengupdate jadwal
router.put("/:id", authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        
        const jadwalCollection = req.app.locals.getCollection('jadwal');
        
        const result = await jadwalCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updates }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'Jadwal tidak ditemukan' 
            });
        }

        const updatedJadwal = await jadwalCollection.findOne({ 
            _id: new ObjectId(id) 
        });

        res.json({
            success: true,
            message: 'Jadwal berhasil diupdate',
            jadwal: updatedJadwal
        });
    } catch (error) {
        console.error('Error updating jadwal:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal mengupdate jadwal',
            error: error.message
        });
    }
});

// DELETE - Menghapus jadwal
router.delete("/:id", authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const jadwalCollection = req.app.locals.getCollection('jadwal');
        
        const result = await jadwalCollection.deleteOne({ 
            _id: new ObjectId(id) 
        });
        
        if (result.deletedCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'Jadwal tidak ditemukan'
            });
        }

        res.json({
            success: true,
            message: 'Jadwal berhasil dihapus'
        });
    } catch (error) {
        console.error('Error deleting jadwal:', error);
        res.status(500).json({
            success: false,
            message: 'Gagal menghapus jadwal',
            error: error.message
        });
    }
});

export default router; 