const mongoose = require('mongoose');

const PcaResultSchema = new mongoose.Schema({
  PC1: Number,
  PC2: Number,
  Segment: Number
});

module.exports = mongoose.model('PcaResult', PcaResultSchema);