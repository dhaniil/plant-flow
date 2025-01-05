import logger from '../logger.js';

class SensorMetrics {
    constructor() {
        this.readings = 0;
        this.errors = 0;
        this.lastReading = null;
    }

    recordReading(data) {
        this.readings++;
        this.lastReading = {
            timestamp: new Date(),
            temperature: data.temperature,
            humidity: data.humidity
        };
        logger.info('Sensor reading recorded', this.getMetrics());
    }

    getMetrics() {
        return {
            totalReadings: this.readings,
            errorRate: (this.errors / this.readings) * 100,
            lastReading: this.lastReading
        };
    }
}

export default SensorMetrics; 