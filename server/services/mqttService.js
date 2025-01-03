import mqtt from 'mqtt';

class MqttService {
    constructor(db) {
        if (!db) {
            throw new Error('Database connection is required');
        }
        this.db = db;
        this.client = null;
        this.connect();
    }

    connect() {
        try {
            this.client = mqtt.connect(process.env.MQTT_BROKER_URL, {
                clientId: `plantflow_server_${Date.now()}`,
                keepalive: 60,
                clean: true,
                reconnectPeriod: 5000,
                connectTimeout: 30 * 1000,
            });

            this.client.on('connect', async () => {
                console.log('MQTT Server Connected');
                try {
                    await this.subscribeToAllDevices();
                } catch (error) {
                    console.error('Error in initial subscription:', error);
                }
            });

            this.client.on('error', (error) => {
                console.error('MQTT Error:', error);
            });

        } catch (error) {
            console.error('MQTT Connection Error:', error);
        }
    }

    async subscribeToAllDevices() {
        if (!this.db) {
            throw new Error('Database not initialized');
        }

        try {
            const deviceCollection = this.db.collection('devices');
            const devices = await deviceCollection.find({}).toArray();
            
            console.log(`Found ${devices.length} devices to subscribe`);
            
            for (const device of devices) {
                if (device.mqtt_topic) {
                    this.client.subscribe(device.mqtt_topic, (err) => {
                        if (err) {
                            console.error(`Failed to subscribe to ${device.mqtt_topic}:`, err);
                        } else {
                            console.log(`Subscribed to topic: ${device.mqtt_topic}`);
                        }
                    });
                }
            }
        } catch (error) {
            console.error('Error subscribing to devices:', error);
            throw error;
        }
    }

    publish(topic, message, options = { qos: 1, retain: true }) {
        return new Promise((resolve, reject) => {
            if (!this.client?.connected) {
                reject(new Error('MQTT Client not connected'));
                return;
            }

            this.client.publish(topic, String(message), options, (error) => {
                if (error) {
                    console.error('MQTT Publish Error:', error);
                    reject(error);
                } else {
                    console.log(`Published to ${topic}:`, message);
                    resolve();
                }
            });
        });
    }
}

export default MqttService;
