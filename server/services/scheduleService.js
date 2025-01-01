
import cron from 'node-cron';

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
        try {
            const deviceCollection = this.db.collection('devices');
            
            for (const deviceId of schedule.devices) {
                const device = await deviceCollection.findOne({ device_id: deviceId });
                
                if (device) {
                    // Di sini Anda bisa menambahkan logika eksekusi alternatif
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