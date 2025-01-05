import cron from 'node-cron';
import mqttService from './mqttService.js';
import logger from '../logger.js';

class ScheduleService {
    constructor(db) {
        this.db = db;
        this.mqttClient = null;
        this.startScheduler();
    }

    // Tambahkan method untuk set MQTT client
    setMqttClient(client) {
        this.mqttClient = client;
        console.log('MQTT Client set in ScheduleService');
    }

    // Fungsi helper untuk memformat waktu
    formatTime(time) {
        // Normalisasi format waktu
        return time.replace('.', ':').padStart(5, '0');
    }

    async startScheduler() {
        console.log('Starting scheduler service...');
        try {
            cron.schedule('* * * * *', async () => {
                const now = new Date();
                // Format waktu konsisten menggunakan :
                const currentTime = now.toLocaleTimeString('id-ID', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: false
                }).replace('.', ':');

                const currentDay = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'][now.getDay()];
                
                console.log(`\n[${new Date().toLocaleString()}] Checking schedules...`);
                console.log(`Current time: ${currentTime}`);
                console.log(`Current day: ${currentDay}`);

                const jadwalCollection = this.db.collection('jadwal');
                const schedules = await jadwalCollection.find({ status: 'active' }).toArray();
                
                console.log(`Found ${schedules.length} active schedules`);

                for (const schedule of schedules) {
                    console.log(`\nChecking schedule: ${schedule.name}`);
                    // Normalisasi format waktu jadwal
                    const normalizedScheduleTime = this.formatTime(schedule.waktu);
                    console.log(`Schedule time: ${normalizedScheduleTime} (original: ${schedule.waktu})`);
                    console.log(`Schedule days: ${schedule.hari.join(', ')}`);
                    
                    const timeMatch = normalizedScheduleTime === currentTime;
                    const dayMatch = schedule.hari.includes(currentDay);
                    
                    console.log(`Time match: ${timeMatch} (${normalizedScheduleTime} === ${currentTime})`);
                    console.log(`Day match: ${dayMatch}`);

                    if (timeMatch && dayMatch) {
                        console.log(`✓ Schedule "${schedule.name}" matches! Executing...`);
                        await this.executeSchedule(schedule);
                    } else {
                        console.log(`✗ Schedule "${schedule.name}" does not match current time/day`);
                    }
                }
            });
            
            console.log('Scheduler service started successfully');
        } catch (error) {
            console.error('Error starting scheduler:', error);
        }
    }

    async executeSchedule(schedule) {
        try {
            console.log(`\nExecuting schedule: ${schedule.name}`);
            const deviceCollection = this.db.collection('devices');
            
            if (!this.mqttClient) {
                throw new Error('MQTT Client not initialized');
            }
            
            for (const deviceId of schedule.devices) {
                console.log(`\nProcessing device: ${deviceId}`);
                const device = await deviceCollection.findOne({ device_id: deviceId });
                
                if (device) {
                    console.log(`Found device: ${device.name} (${device.mqtt_topic})`);
                    const messagePayload = schedule.payload || (schedule.action === 'on' ? '1' : '0');
                    console.log(`Publishing: ${messagePayload} to ${device.mqtt_topic}`);
                    
                    try {
                        // Gunakan Promise untuk publish
                        await new Promise((resolve, reject) => {
                            this.mqttClient.publish(device.mqtt_topic, messagePayload, (error) => {
                                if (error) {
                                    console.error(`MQTT publish error for ${device.mqtt_topic}:`, error);
                                    reject(error);
                                } else {
                                    console.log(`✓ Successfully published to ${device.mqtt_topic}`);
                                    resolve();
                                }
                            });
                        });
                        
                        // Log eksekusi jadwal
                        await this.logScheduleExecution(schedule, device, messagePayload);
                        
                    } catch (mqttError) {
                        console.error(`Failed to publish to ${device.mqtt_topic}:`, mqttError);
                        await this.logScheduleError(schedule, device, mqttError);
                    }
                } else {
                    console.warn(`✗ Device not found: ${deviceId}`);
                }
            }
        } catch (error) {
            console.error('Error executing schedule:', error);
            await this.logScheduleError(schedule, null, error);
        }
    }

    // Method untuk logging eksekusi jadwal
    async logScheduleExecution(schedule, device, payload) {
        try {
            const logsCollection = this.db.collection('schedule_logs');
            await logsCollection.insertOne({
                schedule_id: schedule._id,
                schedule_name: schedule.name,
                device_id: device.device_id,
                device_name: device.name,
                mqtt_topic: device.mqtt_topic,
                payload: payload,
                status: 'success',
                timestamp: new Date()
            });
        } catch (error) {
            console.error('Error logging schedule execution:', error);
        }
    }

    // Method untuk logging error
    async logScheduleError(schedule, device, error) {
        try {
            const logsCollection = this.db.collection('schedule_logs');
            await logsCollection.insertOne({
                schedule_id: schedule._id,
                schedule_name: schedule.name,
                device_id: device?.device_id,
                device_name: device?.name,
                mqtt_topic: device?.mqtt_topic,
                error: error.message,
                status: 'error',
                timestamp: new Date()
            });
        } catch (logError) {
            console.error('Error logging schedule error:', logError);
        }
    }
}

export default ScheduleService; 