const express = require('express');
const router = express.Router();
const UserRecommendation = require('../models/UserRecommendation');

// POST /api/recommendations -> Save a user's recommendation list
router.post('/', async (req, res) => {
  const { userId, sourceShowId, recommendations } = req.body;
  try {
    await UserRecommendation.findOneAndUpdate(
      { userId: userId },
      { userId, sourceShowId, recommendations },
      { new: true, upsert: true }
    );
    res.status(200).json({ message: 'Recommendations saved.' });
  } catch (err) {
    res.status(500).json({ message: 'Error saving recommendations.' });
  }
});

// GET /api/recommendations/:userId -> Get a user's LAST SAVED recommendations
router.get('/:userId', async (req, res) => {
    try {
        const userRecs = await UserRecommendation.findOne({ userId: req.params.userId })
            .populate('recommendations');
        res.json(userRecs || { recommendations: [] });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching recommendations.' });
    }
});

module.exports = router;