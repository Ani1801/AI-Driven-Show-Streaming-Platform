const mongoose = require("mongoose");

const favouriteSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    show: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Show', 
        required: true 
    }
}, { timestamps: true });

// This ensures a user can only favourite a show once
favouriteSchema.index({ user: 1, show: 1 }, { unique: true });

module.exports = mongoose.model("Favourite", favouriteSchema);