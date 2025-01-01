import mqtt from 'mqtt';

const MQTT_BROKER_URL = process.env.VITE_MQTT_BROKER_URL;

if (!MQTT_BROKER_URL) {
  throw new Error('MQTT_BROKER_URL is not defined');
}

const client = mqtt.connect(MQTT_BROKER_URL);

export default client;
