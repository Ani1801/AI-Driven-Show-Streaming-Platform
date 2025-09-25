const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,  // No duplicate emails
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6, // Basic validation
  },
  // Optional profile fields
  // Keep only account fields here; profile is separate collection now
}, { timestamps: true }); // adds createdAt and updatedAt fields

module.exports = mongoose.model("User", userSchema);
