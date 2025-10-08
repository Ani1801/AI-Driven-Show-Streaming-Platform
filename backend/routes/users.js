const express = require("express");
const User = require("../models/User");
const Profile = require("../models/Profile");
const auth = require('../middleware/auth'); // Import the shared middleware

const router = express.Router();

// GET /api/users/me -> Get the logged-in user's profile
router.get("/me", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password"); // Exclude password hash
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const profile = await Profile.findOne({ user: req.user.id });
        
        res.json({
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                phone: profile ? profile.phone : "",
                avatarUrl: profile ? profile.avatarUrl : "",
                bio: profile ? profile.bio : ""
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// PUT /api/users/me -> Update the logged-in user's profile
router.put("/me", auth, async (req, res) => {
    try {
        const { fullName, phone, avatarUrl, bio } = req.body;

        // Update User model
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: { fullName } },
            { new: true }
        ).select("-password");

        if (!user) return res.status(404).json({ message: "User not found" });

        // Update or create Profile model
        const profile = await Profile.findOneAndUpdate(
            { user: req.user.id },
            { $set: { phone, avatarUrl, bio } },
            { new: true, upsert: true }
        );

        res.json({
            message: "Profile updated",
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                phone: profile.phone,
                avatarUrl: profile.avatarUrl,
                bio: profile.bio
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

module.exports = router;