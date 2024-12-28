import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectToDatabase } from '../connectToDatabase.js'; // Import connection utility

dotenv.config();

const app = express();
app.use(
    cors({
      origin: ['http://localhost:4000', 'https://server-plant-flow.vercel.app/api/devices'], // Ganti dengan alamat frontend React
      methods: ['GET', 'POST', 'PUT', 'DELETE'], // Metode HTTP yang diizinkan
      allowedHeaders: ['Content-Type', 'Authorization'], // Header yang diizinkan
    })
  );
app.use(bodyParser.json());

// Ensure the database name is provided
const DB_NAME = process.env.DB_NAME;
if (!DB_NAME) {
    console.error("DB_NAME is not defined. Please check your .env file.");
    process.exit(1); // Exit the process if DB_NAME is not set
}

// POST route to add a device
app.post("/api/devices", async (req, res) => {
    const { device_id, name, status, mqtt_topic } = req.body;

    try {
        const client = await connectToDatabase(); // Get the MongoDB client
        const db = client.db(DB_NAME); // Use the specified database
        const devicesCollection = db.collection('devices'); // Access the 'devices' collection

        const newDevice = { device_id, name, status, mqtt_topic };
        const result = await devicesCollection.insertOne(newDevice);

        res.status(201).json({ message: 'Device berhasil ditambahkan', device: result.ops[0] });
    } catch (error) {
        console.error('Error adding device:', error);
        res.status(400).json({ message: 'Device tidak berhasil ditambahkan', error: error.message });
    }
});

// GET route to retrieve devices
app.get("/api/devices", async (req, res) => {
    try {
        const client = await connectToDatabase(); // Get the MongoDB client
        const db = client.db(DB_NAME); // Use the specified database
        const devicesCollection = db.collection('devices'); // Access the 'devices' collection

        const devices = await devicesCollection.find().toArray();
        res.status(200).json(devices);
    } catch (error) {
        console.error('Error fetching devices:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

export default app;
