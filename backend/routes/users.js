const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Profile = require("../models/Profile");
const Favourite = require("../models/Favourite");

const router = express.Router();

// Auth middleware
const auth = (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ message: "No token provided" });
  try {
    const decoded = jwt.verify(token, "your_jwt_secret_key");
    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// GET current user profile
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("fullName email createdAt");
    if (!user) return res.status(404).json({ message: "User not found" });
    const profile = await Profile.findOne({ user: req.userId }).select("phone avatarUrl bio");
    res.json({ user: {
      fullName: user.fullName,
      email: user.email,
      phone: profile ? profile.phone : "",
      avatarUrl: profile ? profile.avatarUrl : "",
      bio: profile ? profile.bio : "",
    }});
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// UPDATE current user profile
router.put("/me", auth, async (req, res) => {
  try {
    const { fullName, phone, avatarUrl, bio } = req.body;
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (typeof fullName === 'string') user.fullName = fullName;
    await user.save();

    let profile = await Profile.findOne({ user: req.userId });
    if (!profile) profile = await Profile.create({ user: req.userId });
    if (typeof phone === 'string') profile.phone = phone;
    if (typeof avatarUrl === 'string') profile.avatarUrl = avatarUrl;
    if (typeof bio === 'string') profile.bio = bio;
    await profile.save();

    res.json({ message: "Profile updated", user: {
      fullName: user.fullName,
      email: user.email,
      phone: profile.phone || "",
      avatarUrl: profile.avatarUrl || "",
      bio: profile.bio || "",
    }});
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// FAVOURITES ROUTES
router.get('/me/favourites', auth, async (req, res) => {
  try {
    const favourites = await Favourite.find({ user: req.userId }).sort({ addedAt: -1 }).lean();
    res.json({ favourites });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/me/favourites', auth, async (req, res) => {
  try {
    const { itemId, title, type, posterUrl, rating } = req.body;
    if (!itemId || !title) return res.status(400).json({ message: 'itemId and title are required' });
    await Favourite.updateOne(
      { user: req.userId, itemId },
      { $setOnInsert: { title, type, posterUrl, rating } },
      { upsert: true }
    );
    const favourites = await Favourite.find({ user: req.userId }).sort({ addedAt: -1 }).lean();
    res.status(201).json({ message: 'Added to favourites', favourites });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/me/favourites/:itemId', auth, async (req, res) => {
  try {
    const { itemId } = req.params;
    await Favourite.deleteOne({ user: req.userId, itemId });
    const favourites = await Favourite.find({ user: req.userId }).sort({ addedAt: -1 }).lean();
    res.json({ message: 'Removed from favourites', favourites });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;


