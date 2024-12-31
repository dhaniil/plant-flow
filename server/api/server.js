import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectToDatabase } from '../connectToDatabase.js';
import Chart from '../models/Chart.js';
import Device from '../models/Device.js';
import { MongoClient, ObjectId } from 'mongodb';
import adminRoutes from './admin.js';
import nutrientRouter from './nutrientStats.js';

dotenv.config();



const app = express();
const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = process.env.DB_NAME;

// Konfigurasi CORS yang akan digunakan di seluruh aplikasi
const corsOptions = {
  origin: [
    'https://plant-flow.vercel.app',
    'http://localhost:4000'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Terapkan CORS untuk semua route
app.use(cors(corsOptions));

// Handle OPTIONS preflight untuk semua route
app.options('*', cors(corsOptions));

app.use(express.json());
app.use('/api/admin', adminRoutes);

app.use(bodyParser.json()); 
let db;

const connectDatabase = async () => {
  if (!db) {
    const client = new MongoClient(MONGO_URI);
    await client.connect();
    db = client.db(DB_NAME);
    console.log('Connected to database');
  }
};

app.use(async (req, res, next) => {
  try {
    await connectDatabase();
    next();
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ message: 'Database connection failed', error: error.message });
  }
});

const getCollection = (collectionName) => {
  return db.collection(collectionName);
};

// POST route untuk menambahkan device
app.post("/api/devices", async (req, res) => {
  const { device_id, name, status, mqtt_topic } = req.body;

  try {
    const devicesCollection = getCollection('devices');
    const newDevice = { device_id, name, status, mqtt_topic };
    const result = await devicesCollection.insertOne(newDevice);

    const insertedDevice = await devicesCollection.findOne({ _id: result.insertedId });

    res.status(201).json({ message: 'Device berhasil ditambahkan', device: insertedDevice });
  } catch (error) {
    console.error('Error adding device:', error);
    res.status(400).json({ message: 'Device tidak berhasil ditambahkan', error: error.message });
  }
});

// GET route untuk mengambil semua device
app.get("/api/devices", async (req, res) => {
  try {
    const devicesCollection = getCollection('devices');
    const devices = await devicesCollection.find().toArray();
    res.status(200).json(devices);
  } catch (error) {
    console.error('Error fetching devices:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// PUT route untuk mengedit device
app.put("/api/devices/:id", async (req, res) => {
  const { id } = req.params;
  const { device_id, name, status, mqtt_topic } = req.body;

  try {
    const devicesCollection = getCollection('devices');
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
app.delete("/api/devices/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const devicesCollection = getCollection('devices');
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

// GET route untuk mengambil semua chart
app.get("/api/chart", async (req, res) => {
  try {
    const sensorsCollection = getCollection('graphs');
    const sensors = await sensorsCollection.find().toArray();
    res.status(200).json(sensors);
  } catch (error) {
    console.error('Error fetching sensors:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// POST route untuk menambahkan chart
app.post("/api/chart", async (req, res) => {
  const { name, topic } = req.body;

  try {
    const sensorsCollection = getCollection('graphs');
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
app.put("/api/chart/:id", async (req, res) => {
  const { id } = req.params;
  const { name, topic } = req.body;

  try {
    const sensorsCollection = getCollection('graphs');
    const updatedSensor = { name, topic };
    const result = await sensorsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedSensor }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Sensor tidak ditemukan' });
    }
    res.status(200).json({ message: 'Sensor berhasil diperbarui', updatedSensor });
  }
  catch (error) {
    console.error('Error updating sensor:', error);
    res.status(400).json({ message: 'Sensor tidak berhasil diperbarui', error: error.message });
  }
});

// Tambahkan router nutrient
app.use('/api/nutrient', nutrientRouter);

// Tambahkan error handler untuk 404
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    path: req.path,
    method: req.method 
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
