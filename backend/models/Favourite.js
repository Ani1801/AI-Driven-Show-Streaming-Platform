const mongoose = require("mongoose");

const favouriteSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true, required: true },
  itemId: { type: String, required: true },
  title: { type: String, required: true },
  type: { type: String, enum: ["movie", "show", "other"], default: "movie" },
  posterUrl: { type: String, default: "" },
  rating: { type: Number, default: 0 },
  addedAt: { type: Date, default: Date.now }
}, { timestamps: true });

favouriteSchema.index({ user: 1, itemId: 1 }, { unique: true });

module.exports = mongoose.model("Favourite", favouriteSchema);


