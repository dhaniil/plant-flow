import express from 'express';
import mqttService from '../services/mqttService.js';
import authenticate from '../middleware/authMiddleware.js';

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

// GET route untuk mendapatkan data MQTT berdasarkan topic
router.get("/data/:topic",  async (req, res) => {
  const { topic } = req.params;
  try {
    const client = req.app.locals.mqttService.client;
    if (!client || !client.connected) {
      return res.status(500).json({ 
        message: 'MQTT client tidak tersedia atau tidak terhubung',
        value: null 
      });
    }

    let messageReceived = false;
    
    const messageHandler = (receivedTopic, message) => {
      if (receivedTopic === topic && !messageReceived) {
        messageReceived = true;
        client.removeListener('message', messageHandler);
        client.unsubscribe(topic);
        res.json({
          value: message.toString(),
          timestamp: new Date().toISOString()
        });
      }
    };

    client.subscribe(topic);
    client.on('message', messageHandler);

    setTimeout(() => {
      if (!messageReceived) {
        client.removeListener('message', messageHandler);
        client.unsubscribe(topic);
        res.json({ value: null, timestamp: new Date().toISOString() });
      }
    }, 2000);

  } catch (error) {
    console.error('Error getting MQTT data:', error);
    res.status(500).json({ message: 'Gagal mendapatkan data MQTT', error: error.message });
  }
});

export default router; 