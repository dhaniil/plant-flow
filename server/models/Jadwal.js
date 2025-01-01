import mongoose from 'mongoose';

const jadwalSchema = new mongoose.Schema({
  devices: [{ 
    type: String,
    required: true,
    ref: 'Device' // Referensi ke model Device
  }],
  jadwal_id: {
    type: String,
    required: true,
  },
  name: { 
    type: String, 
    required: true 
  },
  waktu: { 
    type: String, 
    required: true // Format: "HH:mm"
  },
  hari: [{
    type: String,
    enum: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'],
    required: true
  }],
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  action: {
    type: String,
    enum: ['on', 'off'],
    required: true
  },
  payload: {
    type: String,
    default: function() {
      // Default payload berdasarkan action
      return this.action === 'on' ? '1' : '0';
    }
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// Middleware untuk mengupdate updated_at sebelum save
jadwalSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

const Jadwal = mongoose.model('Jadwal', jadwalSchema);

export default Jadwal;
