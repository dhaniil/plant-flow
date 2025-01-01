import mqtt from 'mqtt';

class MqttService {
    constructor(db) {
        this.db = db;
        this.client = mqtt.connect(process.env.MQTT_BROKER_URL);
        this.setupMqttHandlers();
    }

    setupMqttHandlers() {
        this.client.on('connect', () => {
            console.log('MQTT Connected');
            // Subscribe ke semua topic device
            this.subscribeToAllDevices();
        });

        this.client.on('message', async (topic, message) => {
            try {
                const payload = message.toString();
                console.log(`Received message: ${payload} from topic: ${topic}`);
                
                // Update status device di database
                const deviceCollection = this.db.collection('devices');
                await deviceCollection.updateOne(
                    { mqtt_topic: topic },
                    { 
                        $set: { 
                            status: payload === '1' || payload.toLowerCase() === 'true' ? 'on' : 'off',
                            last_updated: new Date()
                        } 
                    }
                );
            } catch (error) {
                console.error('Error handling MQTT message:', error);
            }
        });
    }

    async subscribeToAllDevices() {
        try {
            const deviceCollection = this.db.collection('devices');
            const devices = await deviceCollection.find({}).toArray();
            
            devices.forEach(device => {
                if (device.mqtt_topic) {
                    this.client.subscribe(device.mqtt_topic);
                    console.log(`Subscribed to topic: ${device.mqtt_topic}`);
                }
            });
        } catch (error) {
            console.error('Error subscribing to devices:', error);
        }
    }
}

const mqttService = new MqttService();
export default mqttService;
