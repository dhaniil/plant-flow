import express from 'express';
const router = express.Router();
import mqttService from '../services/mqttService.js';

// POST /api/mqtt/publish
router.post("/publish", async (req, res) => {
    try {
        const { topic, message, options } = req.body;
        
        if (!topic || !message) {
            return res.status(400).json({ 
                message: 'Topic dan message diperlukan' 
            });
        }

        mqttService.publish(topic, message, options);
        
        res.status(200).json({ 
            message: 'Pesan berhasil dipublish',
            topic,
            payload: message
        });
    } catch (error) {
        console.error('Error publishing message:', error);
        res.status(500).json({ 
            message: 'Gagal publish pesan', 
            error: error.message 
        });
    }
});

export default router; 