const mongoose = require("mongoose");

const favouriteSchema = new mongoose.Schema({
  itemId: { type: String, required: true },
  title: { type: String, required: true },
  type: { type: String, enum: ["movie", "show", "other"], default: "movie" },
  posterUrl: { type: String, default: "" },
  rating: { type: Number, default: 0 },
  addedAt: { type: Date, default: Date.now },
}, { _id: false });

const profileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, required: true },
  phone: { type: String, default: "", trim: true },
  avatarUrl: { type: String, default: "", trim: true },
  bio: { type: String, default: "", trim: true, maxlength: 300 },
  // favourites moved to separate Favourite collection
}, { timestamps: true });

module.exports = mongoose.model("Profile", profileSchema);


