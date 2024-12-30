import mqtt from 'mqtt';

class MQTTClient {
  constructor() {
    this.client = null;
    this.subscribedTopics = new Set();
  }

  // Metode untuk koneksi ke broker MQTT
  connect(brokerUrl) {
    this.client = mqtt.connect(brokerUrl);

    this.client.on('connect', () => {
      console.log('Terhubung ke broker MQTT:', brokerUrl);
    });

    this.client.on('error', (err) => {
      console.error('Error MQTT:', err);
    });

    this.client.on('message', (topic, message) => {
      console.log(`Pesan diterima di topic "${topic}":`, message.toString());
      if (this.messageHandler) {
        this.messageHandler(topic, message.toString());
      }
    });
  }

  // Metode untuk subscribe ke topic secara dinamis
  subscribe(topic) {
    if (this.subscribedTopics.has(topic)) {
      console.log(`Sudah subscribe ke topic: ${topic}`);
      return;
    }

    this.client.subscribe(topic, (err) => {
      if (err) {
        console.error(`Gagal subscribe ke topic ${topic}:`, err);
      } else {
        console.log(`Berhasil subscribe ke topic: ${topic}`);
        this.subscribedTopics.add(topic);
      }
    });
  }

  // Metode untuk unsubscribe dari topic
  unsubscribe(topic) {
    if (!this.subscribedTopics.has(topic)) {
      console.log(`Belum subscribe ke topic: ${topic}`);
      return;
    }

    this.client.unsubscribe(topic, (err) => {
      if (err) {
        console.error(`Gagal unsubscribe dari topic ${topic}:`, err);
      } else {
        console.log(`Berhasil unsubscribe dari topic: ${topic}`);
        this.subscribedTopics.delete(topic);
      }
    });
  }

  // Metode untuk menetapkan handler pesan
  onMessage(callback) {
    this.messageHandler = callback;
  }

  // Metode untuk disconnect
  disconnect() {
    if (this.client) {
      this.client.end(() => {
        console.log('Koneksi MQTT ditutup.');
      });
    }
  }
}

export default MQTTClient;
