const mongoose = require("mongoose");

const userRecommendationSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true, 
        unique: true 
    },
    sourceShowId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Show' 
    },
    recommendations: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Show' 
    }],
    lastUpdated: { 
        type: Date, 
        default: Date.now 
    }
}, { timestamps: true });

module.exports = mongoose.model("UserRecommendation", userRecommendationSchema);