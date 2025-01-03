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
        await new Promise((resolve) => {
            mqttServiceInstance.client.once('connect', () => {
                console.log('MQTT Client Connected');
                resolve();
            });
        });

        // Pasang mqttService ke app.locals
        app.locals.mqttService = mqttServiceInstance;
        
        // Initialize schedule service setelah MQTT siap
        const scheduleService = new ScheduleService(db, mqttServiceInstance);
        
        // Setelah inisialisasi mqttService
        const chartService = new ChartService(db);
        chartService.client = mqttServiceInstance.client; // Gunakan MQTT client yang sama
        app.locals.chartService = chartService;
        
        // Setelah inisialisasi mqttService
        const sensorService = new SensorService(db);
        sensorService.client = mqttServiceInstance.client;
        app.locals.sensorService = sensorService;
        
        // Tunggu sampai topics terload
        await sensorService.loadTopics();
        
        // Subscribe ke topic sensor
        mqttServiceInstance.client.subscribe('hydro/sched/env');
        
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
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

startServer();

export default app;

