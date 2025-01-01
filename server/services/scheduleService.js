import mqtt from 'mqtt';
import cron from 'node-cron';

class ScheduleService {
    constructor(db) {
        this.db = db;
        this.mqttRetryCount = 0;
        this.maxRetries = 10;
        this.isConnecting = false;
        this.connectMQTT();
        this.startScheduler();
    }

    connectMQTT() {
        if (this.isConnecting) return;
        this.isConnecting = true;

        const options = {
            keepalive: 60,
            clientId: `schedule_service_${Math.random().toString(16).substring(2, 8)}`,
            clean: true,
            reconnectPeriod: 5000,
            connectTimeout: 30 * 1000,
            rejectUnauthorized: false,
        };

        const brokerUrl = process.env.MQTT_BROKER_URL || 'wss://broker.hivemq.com:8884/mqtt';

        try {
            if (this.client) {
                this.client.end(true);
            }

            this.client = mqtt.connect(brokerUrl, options);

            this.client.on('connect', () => {
                console.log('MQTT Connected successfully');
                this.mqttRetryCount = 0;
                this.isConnecting = false;
            });

            this.client.on('error', (err) => {
                console.error('MQTT Connection error:', err.message);
                this.isConnecting = false;
                this.handleMQTTError();
            });

            this.client.on('close', () => {
                console.log('MQTT Connection closed');
                this.isConnecting = false;
                this.handleMQTTError();
            });

            this.client.on('offline', () => {
                console.log('MQTT Client is offline');
                this.isConnecting = false;
            });

            this.client.on('reconnect', () => {
                console.log('Attempting to reconnect to MQTT...');
            });
        } catch (error) {
            console.error('Error initializing MQTT:', error.message);
            this.isConnecting = false;
            this.handleMQTTError();
        }
    }

    handleMQTTError() {
        this.mqttRetryCount++;
        if (this.mqttRetryCount > this.maxRetries) {
            console.error('Max MQTT reconnection attempts reached. Will try again in 1 minute.');
            this.mqttRetryCount = 0;
            setTimeout(() => {
                console.log('Attempting to reconnect after timeout...');
                this.connectMQTT();
            }, 60000);
            return;
        }

        const delay = Math.min(1000 * Math.pow(2, this.mqttRetryCount), 30000);
        setTimeout(() => {
            console.log(`Attempting MQTT reconnection ${this.mqttRetryCount}/${this.maxRetries}`);
            this.connectMQTT();
        }, delay);
    }

    startScheduler() {
        // Jalankan setiap menit
        cron.schedule('* * * * *', async () => {
            try {
                if (this.client && this.client.connected) {
                    await this.checkAndExecuteSchedules();
                } else {
                    console.log('MQTT not connected. Skipping schedule check.');
                }
            } catch (error) {
                console.error('Error executing schedules:', error);
            }
        });
    }

    async checkAndExecuteSchedules() {
        const now = new Date();
        const currentTime = now.toLocaleTimeString('id-ID', { 
            hour: '2-digit', 
            minute: '2-digit', 
            hour12: false 
        });
        const currentDay = this.getDayName(now.getDay());

        try {
            const jadwalCollection = this.db.collection('jadwals');
            const schedules = await jadwalCollection.find({ 
                status: 'active',
                waktu: currentTime,
                hari: currentDay
            }).toArray();

            for (const schedule of schedules) {
                await this.executeSchedule(schedule);
            }
        } catch (error) {
            console.error('Error checking schedules:', error);
        }
    }

    getDayName(dayIndex) {
        const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        return days[dayIndex];
    }

    async executeSchedule(schedule) {
        if (!this.client || !this.client.connected) {
            console.log('MQTT client not connected. Cannot execute schedule.');
            return;
        }

        try {
            const deviceCollection = this.db.collection('devices');
            
            for (const deviceId of schedule.devices) {
                const device = await deviceCollection.findOne({ device_id: deviceId });
                
                if (device && device.mqtt_topic) {
                    // Publish dengan QoS 1 untuk memastikan pengiriman
                    this.client.publish(
                        device.mqtt_topic, 
                        schedule.payload || (schedule.action === 'on' ? '1' : '0'),
                        { qos: 1 },
                        (err) => {
                            if (err) {
                                console.error(`Error publishing to ${device.mqtt_topic}:`, err);
                            } else {
                                console.log(`Successfully published to ${device.mqtt_topic}`);
                            }
                        }
                    );

                    await this.logScheduleExecution(schedule, device);
                }
            }
        } catch (error) {
            console.error('Error executing schedule:', error);
            await this.logScheduleError(schedule, error);
        }
    }

    async logScheduleExecution(schedule, device) {
        try {
            const logsCollection = this.db.collection('schedule_logs');
            await logsCollection.insertOne({
                schedule_id: schedule._id,
                device_id: device.device_id,
                device_name: device.name,
                action: schedule.action,
                executed_at: new Date(),
                status: 'success'
            });
        } catch (error) {
            console.error('Error logging schedule execution:', error);
        }
    }

    async logScheduleError(schedule, error) {
        try {
            const logsCollection = this.db.collection('schedule_logs');
            await logsCollection.insertOne({
                schedule_id: schedule._id,
                error: error.message,
                executed_at: new Date(),
                status: 'error'
            });
        } catch (logError) {
            console.error('Error logging schedule error:', logError);
        }
    }
}

export default ScheduleService; 