import cron from 'node-cron';
import mqttService from './mqttService.js';

class ScheduleService {
    constructor(db) {
        this.db = db;
        this.startScheduler();
    }

    startScheduler() {
        // Jalankan setiap menit
        cron.schedule('* * * * *', async () => {
            try {
                await this.checkAndExecuteSchedules();
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
        }).replace('.', ':');
        const currentDay = this.getDayName(now.getDay());

        console.log('\n=== Checking Schedules ===');
        console.log('Current Time:', currentTime);
        console.log('Current Day:', currentDay);

        try {
            const jadwalCollection = this.db.collection('jadwal');
            const allSchedules = await jadwalCollection.find({ status: 'active' }).toArray();
            
            console.log(`Found ${allSchedules.length} active schedules`);
            
            if (allSchedules.length > 0) {
                console.log('Active schedules:', JSON.stringify(allSchedules, null, 2));
            }
            
            for (const schedule of allSchedules) {
                const scheduleTime = schedule.waktu.replace('.', ':');
                const timeMatch = scheduleTime === currentTime;
                const dayMatch = schedule.hari.includes(currentDay);
                
                console.log(`\nSchedule: ${schedule.name}`);
                console.log(`Schedule details:`, {
                    configuredTime: scheduleTime,
                    currentTime: currentTime,
                    configuredDays: schedule.hari,
                    currentDay: currentDay,
                    status: schedule.status
                });
                console.log(`Time Match (${scheduleTime} = ${currentTime}):`, timeMatch);
                console.log(`Day Match (${schedule.hari.join(',')} includes ${currentDay}):`, dayMatch);
                
                if (timeMatch && dayMatch) {
                    console.log('✓ Schedule matches! Executing...');
                    await this.executeSchedule(schedule);
                } else {
                    console.log('✗ Schedule does not match current time/day');
                }
            }
        } catch (error) {
            console.error('Error checking schedules:', error);
        }
        console.log('\n=== End Checking Schedules ===\n');
    }

    getDayName(dayIndex) {
        const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        return days[dayIndex];
    }

    async executeSchedule(schedule) {
        try {
            console.log(`\nExecuting schedule: ${schedule.name}`);
            const deviceCollection = this.db.collection('devices');
            
            for (const deviceId of schedule.devices) {
                const device = await deviceCollection.findOne({ device_id: deviceId });
                
                if (device) {
                    console.log(`- Device found: ${device.name} (${device.mqtt_topic})`);
                    const messagePayload = schedule.payload || (schedule.action === 'on' ? '1' : '0');
                    console.log(`- Publishing message: ${messagePayload} to ${device.mqtt_topic}`);
                    
                    mqttService.publish(device.mqtt_topic, messagePayload);
                    await this.logScheduleExecution(schedule, device, messagePayload);
                    console.log('✓ Schedule executed successfully');
                } else {
                    console.log(`✗ Device not found: ${deviceId}`);
                }
            }
        } catch (error) {
            console.error('Error executing schedule:', error);
            await this.logScheduleError(schedule, error);
        }
    }

    async logScheduleExecution(schedule, device, payload) {
        try {
            const logsCollection = this.db.collection('schedule_logs');
            await logsCollection.insertOne({
                schedule_id: schedule._id,
                device_id: device.device_id,
                device_name: device.name,
                mqtt_topic: device.mqtt_topic,
                action: schedule.action,
                payload: payload,
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