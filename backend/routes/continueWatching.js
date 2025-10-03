const express = require('express');
const mongoose = require('mongoose');
const ContinueWatching = require('../models/ContinueWatching');
const jwt = require("jsonwebtoken");

const router = express.Router();

// Auth middleware
const auth = (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }
  try {
    const decoded = jwt.verify(token, "your_jwt_secret_key");
    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// GET user's continue watching list
router.get('/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    // Find or create user's continue watching list
    let continueWatching = await ContinueWatching.findOne({ user: userId });
    
    if (!continueWatching) {
      continueWatching = new ContinueWatching({
        user: userId,
        watchHistory: []
      });
      await continueWatching.save();
    }

    return res.json(continueWatching);
  } catch (err) {
    console.error('Error fetching continue watching:', err);
    return res.status(500).json({ message: 'Failed to fetch continue watching', error: err.message });
  }
});

// POST to add or update an item in continue watching
router.post('/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { itemId, title, type, posterUrl, progress } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    if (!itemId || !title) {
      return res.status(400).json({ message: 'Item ID and title are required' });
    }

    // Find or create user's continue watching
    let continueWatching = await ContinueWatching.findOne({ user: userId });
    
    if (!continueWatching) {
      continueWatching = new ContinueWatching({
        user: userId,
        watchHistory: []
      });
    }

    // Check if item already exists in watch history
    const existingItemIndex = continueWatching.watchHistory.findIndex(
      item => item.itemId === itemId
    );

    if (existingItemIndex !== -1) {
      // Update existing item
      continueWatching.watchHistory[existingItemIndex].title = title;
      continueWatching.watchHistory[existingItemIndex].type = type || continueWatching.watchHistory[existingItemIndex].type;
      continueWatching.watchHistory[existingItemIndex].posterUrl = posterUrl || continueWatching.watchHistory[existingItemIndex].posterUrl;
      continueWatching.watchHistory[existingItemIndex].progress = progress || continueWatching.watchHistory[existingItemIndex].progress;
      continueWatching.watchHistory[existingItemIndex].lastWatched = new Date();
    } else {
      // Add new item to watch history
      continueWatching.watchHistory.push({
        itemId,
        title,
        type: type || 'movie',
        posterUrl: posterUrl || '',
        progress: progress || 0,
        lastWatched: new Date()
      });
    }

    // Sort watch history by lastWatched (most recent first)
    continueWatching.watchHistory.sort((a, b) => b.lastWatched - a.lastWatched);
    
    // Limit to most recent 20 items
    if (continueWatching.watchHistory.length > 20) {
      continueWatching.watchHistory = continueWatching.watchHistory.slice(0, 20);
    }

    continueWatching.lastUpdated = new Date();
    await continueWatching.save();

    return res.status(201).json(continueWatching);
  } catch (err) {
    console.error('Error updating continue watching:', err);
    return res.status(500).json({ message: 'Failed to update continue watching', error: err.message });
  }
});

// DELETE an item from continue watching
router.delete('/:userId/:itemId', async (req, res) => {
  try {
    const { userId, itemId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const continueWatching = await ContinueWatching.findOne({ user: userId });
    
    if (!continueWatching) {
      return res.status(404).json({ message: 'Continue watching not found' });
    }

    // Filter out the item to delete
    continueWatching.watchHistory = continueWatching.watchHistory.filter(
      item => item.itemId !== itemId
    );

    continueWatching.lastUpdated = new Date();
    await continueWatching.save();

    return res.json({ message: 'Item removed from continue watching successfully' });
  } catch (err) {
    console.error('Error removing from continue watching:', err);
    return res.status(500).json({ message: 'Failed to remove from continue watching', error: err.message });
  }
});

module.exports = router;