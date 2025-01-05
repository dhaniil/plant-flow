import mqtt from 'mqtt';
import dotenv from 'dotenv';

dotenv.config();

class MqttService {
    constructor(db) {
        this.db = db;
        this.client = null;
        this.connect();
    }

    async updateDeviceStatus(topic, message) {
        try {
            const deviceCollection = this.db.collection('devices');
            const status = message === '1' || message.toLowerCase() === 'true' ? 'on' : 'off';
            
            console.log(`Updating device status for topic ${topic} to ${status}`);
            
            await deviceCollection.updateOne(
                { mqtt_topic: topic },
                { 
                    $set: { 
                        status: status,
                        last_updated: new Date()
                    } 
                }
            );
        } catch (error) {
            console.error('Error updating device status:', error);
        }
    }

    connect() {
        try {
            const brokerUrl = process.env.MQTT_BROKER_URL;
            if (!brokerUrl) {
                throw new Error('MQTT_BROKER_URL tidak ditemukan di environment variables');
            }

            console.log('Connecting to MQTT broker:', brokerUrl);
            
            const options = {
                clientId: `plantflow_server_${Date.now()}`,
                clean: true,
                connectTimeout: 60000, // Tambah timeout jadi 60 detik
                reconnectPeriod: 5000,
                keepalive: 60,
                rejectUnauthorized: false,
                protocol: 'wss',
                protocolVersion: 4,
                path: '/mqtt'
            };

            this.client = mqtt.connect(brokerUrl, options);

            this.client.on('connect', async () => {
                console.log('✓ MQTT Connected successfully to:', brokerUrl);
                try {
                    await this.subscribeToAllDevices();
                } catch (error) {
                    console.error('Error in initial subscription:', error);
                }
            });

            this.client.on('error', (err) => {
                console.error('✗ MQTT Error:', err.message);
            });

            this.client.on('close', () => {
                console.log('! MQTT Connection closed, attempting to reconnect...');
            });

            this.client.on('reconnect', () => {
                console.log('! MQTT Reconnecting to:', brokerUrl);
            });

            this.client.on('offline', () => {
                console.log('! MQTT Client offline');
            });

            this.client.on('message', async (topic, message) => {
                try {
                    const messageStr = message.toString();
                    console.log(`Received message on ${topic}:`, messageStr);
                    
                    const deviceCollection = this.db.collection('devices');
                    await deviceCollection.updateOne(
                        { mqtt_topic: topic },
                        { 
                            $set: { 
                                status: messageStr === '1' ? 'on' : 'off',
                                last_message: messageStr,
                                last_updated: new Date()
                            } 
                        }
                    );
                } catch (error) {
                    console.error('Error handling MQTT message:', error);
                }
            });

        } catch (error) {
            console.error('✗ MQTT Connection Error:', error.message);
            throw error;
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
                            console.log(`✓ Subscribed to topic: ${device.mqtt_topic}`);
                        }
                    });
                }
            }
        } catch (error) {
            console.error('Error subscribing to devices:', error);
            throw error;
        }
    }

    async publish(topic, message) {
        return new Promise((resolve, reject) => {
            if (!this.client?.connected) {
                reject(new Error('MQTT Client not connected'));
                return;
            }
            
            this.client.publish(topic, message.toString(), (error) => {
                if (error) {
                    console.error(`Failed to publish to ${topic}:`, error);
                    reject(error);
                } else {
                    console.log(`Successfully published to ${topic}`);
                    resolve(true);
                }
            });
        });
    }
}

export default MqttService;