import mqtt from "mqtt";
import dotenv from "dotenv";

dotenv.config();

const brokerUrl = process.env.MQTT_BROKER_URL || "mqtt://localhost";
const client = mqtt.connect(brokerUrl);

client.on("connect", () => {
  console.log("Connected to MQTT Broker");
});

client.on("error", (err) => {
  console.error("MQTT connection error:", err);
});

client.on("message", (topic, message) => {
  console.log(`Received message from ${topic}:`, message.toString());
});

function publish(topic: string, message: string) {
  client.publish(topic, message, (err) => {
    if (err) {
      console.error(`Failed to publish to ${topic}:`, err);
    } else {
      console.log(`Published to ${topic}:`, message);
    }
  });
}

function subscribe(topic: string) {
  client.subscribe(topic, (err) => {
    if (err) {
      console.error(`Failed to subscribe to ${topic}:`, err);
    } else {
      console.log(`Subscribed to ${topic}`);
    }
  });
}

function unsubscribe(topic: string) {
  client.unsubscribe(topic, (err) => {
    if (err) {
      console.error(`Failed to unsubscribe from ${topic}:`, err);
    } else {
      console.log(`Unsubscribed from ${topic}`);
    }
  });
}

export { client, publish, subscribe, unsubscribe };
