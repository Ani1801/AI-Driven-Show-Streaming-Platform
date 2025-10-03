const mongoose = require("mongoose");

const showSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  poster_url: {
    type: String,
    required: true,
  },
  trailer_url: {
    type: String,
    default: "",
  },
  genres: {
    type: [String],
    required: true, // critical for recommendation logic
    validate: {
      validator: function (arr) {
        return Array.isArray(arr) && arr.length > 0;
      },
      message: "At least one genre is required",
    },
  },
  actors: {
    type: [String],
    default: [],
  },
  director: {
    type: String,
    default: "",
  },
  rating: {
    type: Number,
    min: 0,
    max: 10,
  },
  keywords: {
    type: [String],
    default: [],
  },
  category: {
    type: String,
    required: true,
    enum: ['popular', 'trending', 'new-release', 'you-might-like']
  },
}, { timestamps: true });

module.exports = mongoose.model("Show", showSchema);


