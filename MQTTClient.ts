import mqtt, { MqttClient } from 'mqtt';

const brokerUrl = 'ws://broker.hivemq.com:8000/mqtt';
const options = {
    clientId: `mqtt_client_${Math.random().toString(16).substr(2, 8)}`,
  };


  let client: MqttClient | null = null;

export const connectMqtt = (): MqttClient => {
  if (!client) {
    client = mqtt.connect(brokerUrl, options);

    client.on("connect", () => {
      console.log("Connected to MQTT broker");
    });

    client.on("error", (err) => {
      console.error("MQTT Connection Error:", err);
    });

    client.on("close", () => {
      console.log("MQTT connection closed");
    });
  }
  return client;
};

export const disconnectMqtt = () => {
  if (client) {
    client.end();
    console.log("Disconnected from MQTT broker");
    client = null;
  }
};