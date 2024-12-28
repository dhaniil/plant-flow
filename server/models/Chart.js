const mongoose = require('mongoose');

// Definisikan skema Chart
const chartSchema = new mongoose.Schema({
  name: { type: String, required: true },
  topic: { type: String, required: true }
});

// Buat model Chart
const Chart = mongoose.model('Chart', chartSchema);

module.exports = Chart;
