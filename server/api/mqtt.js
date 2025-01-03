import express from 'express';
import mqttService from '../services/mqttService.js';

const router = express.Router();

router.post("/publish", async (req, res) => {
    try {
        const { topic, message } = req.body;
        
        if (!topic || message === undefined) {
            return res.status(400).json({ 
                success: false,
                message: 'Topic dan message diperlukan' 
            });
        }

        const mqttService = req.app.locals.mqttService;
        if (!mqttService || !mqttService.client?.connected) {
            throw new Error('MQTT Client not connected');
        }

        // Log untuk debugging
        console.log('Publishing:', { topic, message });
        
        // Publish message
        await mqttService.publish(topic, message);
        
        // Update device status di database
        const deviceCollection = req.app.locals.getCollection('devices');
        await deviceCollection.updateOne(
            { mqtt_topic: topic },
            { 
                $set: { 
                    status: message === '1' || message.toLowerCase() === 'true' ? 'on' : 'off',
                    last_updated: new Date()
                } 
            }
        );

        res.status(200).json({ 
            success: true,
            message: 'Message published successfully' 
        });
    } catch (error) {
        console.error('Error publishing message:', error);
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
});

export default router; 