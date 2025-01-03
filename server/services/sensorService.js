import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { promises as fs } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class SensorService {
  constructor(db) {
    if (!db) throw new Error('Database connection required');
    this.db = db;
    this.client = null;
    this.sensorData = {
      temperature: null,
      humidity: null,
      timestamp: null
    };
    this.subscribers = new Set();
    this.loadTopics();
  }

  // Tambah method untuk subscribe ke perubahan data
  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  // Notify semua subscriber saat ada data baru
  notifySubscribers(data) {
    try {
      // Format data sebelum dikirim
      const formattedData = data?.type === 'nutrient' ? {
        type: 'nutrient',
        id: data.id,
        value: Number(data.value),
        timestamp: Date.now()
      } : {
        temperature: Number(this.sensorData.temperature),
        humidity: Number(this.sensorData.humidity),
        timestamp: Date.now()
      };

      // Validasi data sebelum dikirim
      if (formattedData?.type === 'nutrient') {
        if (!formattedData.id || formattedData.value === undefined) {
          console.warn('⚠️ [MQTT] Invalid nutrient data format:', formattedData);
          return;
        }
      } else {
        if (formattedData.temperature === undefined || formattedData.humidity === undefined) {
          console.warn('⚠️ [MQTT] Invalid sensor data format:', formattedData);
          return;
        }
      }

      // Kirim ke semua subscriber
      this.subscribers.forEach(callback => {
        try {
          callback(formattedData);
        } catch (error) {
          console.error('❌ [MQTT] Error in subscriber callback:', error);
        }
      });
    } catch (error) {
      console.error('❌ [MQTT] Error in notifySubscribers:', error);
    }
  }

  async loadTopics() {
    try {
      // Load sensor topics
      const sensorDataPath = join(__dirname, '../data/DataSensor.json');
      const nutrientDataPath = join(__dirname, '../data/nutristats.json');
      
      const [sensorData, nutrientData] = await Promise.all([
        fs.readFile(sensorDataPath, 'utf8'),
        fs.readFile(nutrientDataPath, 'utf8')
      ]);

      this.sensorTopics = JSON.parse(sensorData);
      const nutrientTopics = JSON.parse(nutrientData);
      
      if (this.client) {
        // Subscribe sensor topic
        const sensorTopic = this.sensorTopics.sensor.topic;
        console.log('🌡️ [TOPIC] Subscribing to sensor:', sensorTopic);
        this.client.subscribe(sensorTopic);

        // Subscribe nutrient topics
        if (nutrientTopics.nutrients && Array.isArray(nutrientTopics.nutrients)) {
          console.log('🧪 [TOPIC] Found nutrient configs:', 
            nutrientTopics.nutrients.map(n => ({
              id: n.id,
              name: n.name,
              topic: n.topic
            }))
          );

          nutrientTopics.nutrients.forEach(nutrient => {
            if (nutrient.topic) {
              console.log(`🧪 [TOPIC] Subscribing to ${nutrient.name}:`, nutrient.topic);
              this.client.subscribe(nutrient.topic);
            }
          });
        }

        // Handle MQTT messages
        this.client.on('message', (receivedTopic, message) => {
          this.handleMqttMessage(receivedTopic, message);
        });
      }
    } catch (error) {
      console.error('❌ [TOPIC] Error loading topics:', error);
    }
  }

  getSensorData() {
    if (!this.sensorData.lastUpdate) {
      console.log('No sensor data available yet');
      return null;
    }

    return {
      temperature: this.sensorData.temperature,
      humidity: this.sensorData.humidity,
      timestamp: this.sensorData.timestamp,
      lastUpdate: this.sensorData.lastUpdate
    };
  }

  async handleMqttMessage(topic, message) {
    try {
      const messageStr = message.toString();
      console.log('📡 [MQTT] Received message:', {
        topic,
        message: messageStr,
        timestamp: new Date().toLocaleString('id-ID')
      });

      // Handle nutrient data
      const nutrientData = await fs.readFile(join(__dirname, '../data/nutristats.json'), 'utf8');
      const nutrientTopics = JSON.parse(nutrientData);
      const nutrientTopic = nutrientTopics.nutrients?.find(n => n.topic === topic);

      if (nutrientTopic) {
        console.log('🧪 [NUTRIENT] Processing message:', {
          topic,
          id: nutrientTopic.id,
          name: nutrientTopic.name,
          message: messageStr
        });

        const value = parseFloat(messageStr);
        if (!isNaN(value)) {
          console.log('🧪 [NUTRIENT] Valid value:', {
            id: nutrientTopic.id,
            name: nutrientTopic.name,
            value: value,
            unit: nutrientTopic.unit
          });
          
          this.notifySubscribers({
            type: 'nutrient',
            id: nutrientTopic.id,
            name: nutrientTopic.name,
            value: value,
            unit: nutrientTopic.unit,
            timestamp: Date.now()
          });
        } else {
          console.warn('⚠️ [NUTRIENT] Invalid value:', {
            topic,
            message: messageStr,
            nutrient: nutrientTopic.name
          });
        }
        return;
      }

      // Handle sensor data
      if (topic === this.sensorTopics?.sensor?.topic) {
        console.log('🌡️ [SENSOR] Processing message for topic:', topic);
        
        // Format DHT22: "Suhu: 26.5\nKelembaban: 65.3"
        const tempMatch = messageStr.match(/Suhu:\s*(-?\d+\.?\d*)/i);
        const humMatch = messageStr.match(/Kelembaban:\s*(-?\d+\.?\d*)/i);

        if (tempMatch && humMatch) {
          const temperature = parseFloat(tempMatch[1]);
          const humidity = parseFloat(humMatch[1]);
          
          if (!isNaN(temperature) && !isNaN(humidity)) {
            console.log('🌡️ [SENSOR] Valid DHT22 data:', { temperature, humidity });
            const now = Date.now();
            this.sensorData = {
              temperature,
              humidity,
              timestamp: now,
              lastUpdate: now
            };
            
            this.notifySubscribers();
            await this.saveSensorData(this.sensorData);
            return;
          } else {
            console.warn('🌡️ [SENSOR] Invalid number values:', { temperature, humidity });
          }
        } else {
          console.warn('🌡️ [SENSOR] Failed to parse DHT22 format:', messageStr);
        }
      }
    } catch (error) {
      console.error('❌ [MQTT] Error handling message:', error);
    }
  }

  async saveSensorData(data) {
    try {
      const collection = this.db.collection('sensor_history');
      await collection.insertOne({
        ...data,
        createdAt: new Date()
      });
    } catch (error) {
      console.error('Error saving sensor data:', error);
    }
  }

  getNutrientValue(id) {
    return this.nutrientData?.[id] || null;
  }
}

export default SensorService; 