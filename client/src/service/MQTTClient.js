"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.client = void 0;
exports.publish = publish;
exports.subscribe = subscribe;
exports.unsubscribe = unsubscribe;
const mqtt_1 = __importDefault(require("mqtt"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const brokerUrl = process.env.MQTT_BROKER_URL || "mqtt://localhost";
const client = mqtt_1.default.connect(brokerUrl);
exports.client = client;
client.on("connect", () => {
    console.log("Connected to MQTT Broker");
});
client.on("error", (err) => {
    console.error("MQTT connection error:", err);
});
client.on("message", (topic, message) => {
    console.log(`Received message from ${topic}:`, message.toString());
});
function publish(topic, message) {
    client.publish(topic, message, (err) => {
        if (err) {
            console.error(`Failed to publish to ${topic}:`, err);
        }
        else {
            console.log(`Published to ${topic}:`, message);
        }
    });
}
function subscribe(topic) {
    client.subscribe(topic, (err) => {
        if (err) {
            console.error(`Failed to subscribe to ${topic}:`, err);
        }
        else {
            console.log(`Subscribed to ${topic}`);
        }
    });
}
function unsubscribe(topic) {
    client.unsubscribe(topic, (err) => {
        if (err) {
            console.error(`Failed to unsubscribe from ${topic}:`, err);
        }
        else {
            console.log(`Unsubscribed from ${topic}`);
        }
    });
}
