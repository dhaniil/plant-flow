import { Schema, model } from 'mongoose';

const deviceSchema = new Schema({
  device_id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  mqtt_topic: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  jadwal_id: [{
    type: Schema.Types.ObjectId,
    ref: 'Jadwal',
    default: []
  }],
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

const Device = model('Device', deviceSchema);
export default Device;
