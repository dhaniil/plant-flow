import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectToDatabase } from './connectToDatabase.js';
import Chart from './models/Chart.js';
import Device from './models/Device.js';
import { MongoClient, ObjectId } from 'mongodb';
import adminRoutes from './api/admin.js';
import nutrientRouter from './api/nutrientStats.js';
import datasensorRouter from './api/datasensor.js';
import devicesRouter from './api/devices.js';
import chartRouter from './api/chart.js';

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
    app.locals.getCollection = (collectionName) => {
      return db.collection(collectionName);
    };
    next();
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({ message: 'Database connection failed', error: error.message });
  }
});

//LOG API REQUEST
app.use((req,res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log('Method:', req.method);
  console.log('Path:', req.path);
  next();
});

// Endpoint API
app.use('/api/devices', devicesRouter);
app.use('/api/chart', chartRouter);
app.use('/api/nutrient', nutrientRouter);
app.use('/api/datasensor', datasensorRouter);

//Error Handler 404
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    path: req.path,
    method: req.method 
  });
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;

