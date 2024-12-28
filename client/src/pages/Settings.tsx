import React, { useEffect, useState } from 'react';

const Settings: React.FC = () => {
  const [url, setUrl] = useState('');
  const [port, setPort] = useState('');
  const [protocol, setProtocol] = useState('');
  const [status, setStatus] = useState('');

  // Memuat pengaturan dari backend
  useEffect(() => {
    fetch('/api/mqtt-settings')
      .then((response) => response.json())
      .then((data) => {
        setUrl(data.url);
        setPort(data.port);
        setProtocol(data.protocol);
      })
      .catch((err) => {
        console.error(err);
        setStatus('Failed to load settings');
      });
  }, []);

  // Simpan pengaturan ke backend
  const handleSave = () => {
    const payload = { url, port, protocol };

    fetch('/api/mqtt-settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then((response) => {
        if (response.ok) {
          setStatus('Settings saved successfully');
        } else {
          setStatus('Failed to save settings');
        }
      })
      .catch((err) => {
        console.error(err);
        setStatus('An error occurred');
      });
  };

  return (
    <div>
      <h1>MQTT Broker Settings</h1>
      <label>
        URL:
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
      </label>
      <br />
      <label>
        Port:
        <input
          type="number"
          value={port}
          onChange={(e) => setPort(e.target.value)}
        />
      </label>
      <br />
      <label>
        Protocol:
        <select
          value={protocol}
          onChange={(e) => setProtocol(e.target.value)}
        >
          <option value="mqtt">MQTT</option>
          <option value="ws">WebSocket</option>
        </select>
      </label>
      <br />
      <button type="button" onClick={handleSave}>
        Save Settings
      </button>
      <p>{status}</p>
    </div>
  );
};

export default Settings;
