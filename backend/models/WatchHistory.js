const mongoose = require("mongoose");

const watchHistorySchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    show: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Show', 
        required: true 
    },
    lastUpdated: { 
        type: Date, 
        default: Date.now 
    }
}, { timestamps: true });

// This ensures a user has only one history entry per show, which gets updated
watchHistorySchema.index({ user: 1, show: 1 }, { unique: true });

module.exports = mongoose.model("WatchHistory", watchHistorySchema);