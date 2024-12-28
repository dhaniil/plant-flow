import { Schema, model } from 'mongoose';

const deviceSchema = new Schema({
  device_id: { type: String, required: true },
  name: { type: String, required: true },
  status: { type: String, required: true },
  mqtt_topic: { type: String, required: true }
});

const Device = model('Device', deviceSchema);
export default Device;
