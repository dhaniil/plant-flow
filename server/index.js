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
import MqttService from './services/mqttService.js';
import mqttRouter from './api/mqtt.js';
import logsRouter from './api/logs.js';
import ChartService from './services/chartService.js';
import SensorService from './services/sensorService.js';
import logger from './logger.js';
import rateLimit from 'express-rate-limit';
import authenticate from './middleware/authMiddleware.js';



dotenv.config();

        

const app = express();
const PORT = process.env.PORT;

// Rate limiting middleware
// const limiter = rateLimit({
//     windowMs: 15 * 60 * 1000, // 15 menit
//     max: 100 // limit setiap IP ke 100 request per windowMs
// });

// app.use(limiter); // Apply rate limiting to all requests

// Middleware untuk menangani error
app.use((err, req, res, next) => {
    logger.error('Application error', {
        error: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method
    });
    
    res.status(500).json({
        error: process.env.NODE_ENV === 'production' 
            ? 'Internal server error' 
            : err.message
    });
});

// Pastikan MONGO_URI ada
const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = process.env.DB_NAME;

// Konfigurasi CORS
const corsOptions = {
    origin: [
        'https://plant-flow.vercel.app',
        'http://localhost:4000',  // Frontend port
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
app.use('/api/mqtt', mqttRouter);
app.use('/api/logs', logsRouter);


let mqttServiceInstance;

const startServer = async () => {
    try {
        const client = await MongoClient.connect(MONGO_URI);
        console.log('Connected to MongoDB');
        
        const db = client.db(DB_NAME);
        app.locals.getCollection = (name) => db.collection(name);
        
        // Inisialisasi MQTT Service dengan database
        mqttServiceInstance = new MqttService(db);
        
        // Tunggu hingga MQTT terkoneksi
        await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('MQTT connection timeout'));
            }, 5000);

            mqttServiceInstance.client.once('connect', () => {
                clearTimeout(timeout);
                console.log('MQTT Client Connected');
                resolve();
            });
        });

        // Pasang services ke app.locals
        app.locals.mqttService = mqttServiceInstance;
        app.locals.db = db; // Tambahkan db ke app.locals
        
        // Initialize services setelah MQTT siap
        const scheduleService = new ScheduleService(app.locals.db);
        scheduleService.setMqttClient(mqttServiceInstance.client);
        app.locals.scheduleService = scheduleService;
        
        const chartService = new ChartService(db);
        chartService.client = mqttServiceInstance.client;
        app.locals.chartService = chartService;
        
        const sensorService = new SensorService(db);
        sensorService.client = mqttServiceInstance.client;
        app.locals.sensorService = sensorService;
        
        // Tunggu sampai topics terload
        await sensorService.loadTopics();
        
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

    } catch (error) {
        console.error('Failed to start server:', error);
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

app.get('/health', async (req, res) => {
    try {
        const metrics = {
            uptime: process.uptime(),
            timestamp: Date.now(),
            mqtt: req.app.locals.mqttService?.client?.connected || false,
            mongodb: req.app.locals.db?.topology?.isConnected() || false
        };
        
        res.json(metrics);
    } catch (error) {
        logger.error('Health check failed', { error });
        res.status(500).json({ status: 'error' });
    }
});

startServer();

export default app;

