const express = require('express');
const router = express.Router();
const WatchHistory = require('../models/WatchHistory');

// POST /api/watch-history -> Add a show to a user's history
router.post('/', async (req, res) => {
  const { userId, showId } = req.body;
  try {
    await WatchHistory.findOneAndUpdate(
      { userId: userId, showId: showId },
      { lastWatched: new Date() },
      { upsert: true }
    );
    res.status(200).json({ message: 'Watch history updated.' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating watch history.' });
  }
});

// GET /api/watch-history/:userId -> Get a user's watch history
router.get('/:userId', async (req, res) => {
    try {
        const history = await WatchHistory.find({ userId: req.params.userId })
            .sort({ lastWatched: -1 })
            .populate('showId');
        res.json(history);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching watch history.' });
    }
});

module.exports = router;