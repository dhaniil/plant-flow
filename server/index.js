import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
import adminRoutes from './api/admin.js';
import nutrientRouter from './api/nutrientStats.js';
import datasensorRouter from './api/datasensor.js';
import devicesRouter from './api/devices.js';
import chartRouter from './api/chart.js';
import jadwalRouter from './api/jadwal.js';
import ScheduleService from './services/scheduleService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT;

// Pastikan MONGO_URI ada
const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = process.env.DB_NAME;

// Konfigurasi CORS
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

app.use(cors(corsOptions));
app.use(express.json());
app.use(bodyParser.json());

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api/devices', devicesRouter);
app.use('/api/chart', chartRouter);
app.use('/api/nutrient', nutrientRouter);
app.use('/api/datasensor', datasensorRouter);
app.use('/api/jadwal', jadwalRouter);

const startServer = async () => {
    try {
        // Gunakan MONGO_URI yang sudah dipastikan ada
        const client = await MongoClient.connect(MONGO_URI);
        console.log('Connected to MongoDB');
        
        const db = client.db(DB_NAME);
        
        // Initialize schedule service
        const scheduleService = new ScheduleService(db);
        
        // Add collection getter to app.locals
        app.locals.getCollection = (name) => db.collection(name);
        
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to connect to MongoDB:', error);
        process.exit(1);
    }
};

// Error Handler 404
app.use((req, res) => {
    res.status(404).json({ 
        error: 'Not Found',
        path: req.path,
        method: req.method 
    });
});

startServer();

export default app;

