const mongoose = require('mongoose');

const AssociationRuleSchema = new mongoose.Schema({
  antecedents: String,
  consequents: String,
  support: Number,
  confidence: Number,
  lift: Number
});

module.exports = mongoose.model('AssociationRule', AssociationRuleSchema);