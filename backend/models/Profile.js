const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        unique: true, 
        required: true 
    },
    phone: { 
        type: String, 
        default: "", 
        trim: true 
    },
    avatarUrl: { 
        type: String, 
        default: "", 
        trim: true 
    },
    bio: { 
        type: String, 
        default: "", 
        trim: true, 
        maxlength: 300 
    }
}, { timestamps: true });

module.exports = mongoose.model("Profile", profileSchema);