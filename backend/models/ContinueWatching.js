const mongoose = require("mongoose");

const continueWatchingSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true 
  },
  watchHistory: [{
    itemId: { type: String, required: true },
    title: { type: String, required: true },
    type: { type: String, enum: ["movie", "show"], default: "movie" },
    posterUrl: { type: String, default: "" },
    progress: { type: Number, default: 0 }, // Percentage of content watched
    lastWatched: { type: Date, default: Date.now }
  }],
  lastUpdated: { 
    type: Date, 
    default: Date.now 
  }
}, { timestamps: true });

// Create a compound index to ensure one watch history per user
continueWatchingSchema.index({ user: 1 }, { unique: true });

module.exports = mongoose.model("ContinueWatching", continueWatchingSchema);