const mongoose = require('mongoose');

const SegmentCountSchema = new mongoose.Schema({
  segment: Number,
  userCount: Number
});

module.exports = mongoose.model('SegmentCount', SegmentCountSchema);