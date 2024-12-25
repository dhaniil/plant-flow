import { useEffect, useState } from "react";
import { connectMqtt } from "./MQTTClient";

export const useMqtt = (topic: string) => {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const client = connectMqtt();

    client.subscribe(topic, (err) => {
      if (err) {
        console.error(`Failed to subscribe to topic ${topic}:`, err);
      } else {
        console.log(`Subscribed to topic: ${topic}`);
      }
    });

    client.on("message", (receivedTopic, payload) => {
      if (receivedTopic === topic) {
        setMessage(payload.toString());
      }
    });


    return () => {
      client.unsubscribe(topic, (err) => {
        if (err) {
          console.error(`Failed to unsubscribe from topic ${topic}:`, err);
        } else {
          console.log(`Unsubscribed from topic: ${topic}`);
        }
      });
    };
  }, [topic]);

  return { message, publish: (payload: string) => connectMqtt().publish(topic, payload) };
};
