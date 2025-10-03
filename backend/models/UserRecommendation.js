const mongoose = require("mongoose");

const userRecommendationSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true 
  },
  recommendations: [{
    itemId: { type: String, required: true },
    title: { type: String, required: true },
    type: { type: String, enum: ["movie", "show"], default: "movie" },
    posterUrl: { type: String, default: "" },
    rating: { type: Number, default: 0 },
    genres: { type: [String], default: [] },
    addedAt: { type: Date, default: Date.now }
  }],
  lastUpdated: { 
    type: Date, 
    default: Date.now 
  }
}, { timestamps: true });

// Create a compound index to ensure one recommendation list per user
userRecommendationSchema.index({ user: 1 }, { unique: true });

module.exports = mongoose.model("UserRecommendation", userRecommendationSchema);