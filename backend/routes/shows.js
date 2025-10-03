const express = require('express');
const mongoose = require('mongoose');
const Show = require('../models/Show');

const router = express.Router();

// GET /api/shows/recommendations/:id -> find similar shows by overlapping genres
// (This must come FIRST)
router.get('/recommendations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid show id' });
    }

    const baseShow = await Show.findById(id).lean();
    if (!baseShow) {
      return res.status(404).json({ message: 'Show not found' });
    }

    const baseGenres = Array.isArray(baseShow.genres) ? baseShow.genres : [];
    if (baseGenres.length === 0) {
      return res.json([]); // no genres -> no recommendations
    }

    const recommendations = await Show.aggregate([
      { $match: { _id: { $ne: new mongoose.Types.ObjectId(id) }, genres: { $in: baseGenres } } },
      {
        $addFields: {
          matchScore: { $size: { $setIntersection: ['$genres', baseGenres] } }
        }
      },
      { $sort: { matchScore: -1 } },
      { $limit: 10 }
    ]);

    return res.json(recommendations);
  } catch (err) {
    console.error('Error fetching recommendations:', err.message);
    return res.status(500).json({ message: 'Failed to fetch recommendations', error: err.message });
  }
});


// GET /api/shows/:category -> return shows by category (e.g., 'popular', 'trending')
// (This comes SECOND)
router.get('/:category', async (req, res) => {
    try {
        const { category } = req.params;
        const shows = await Show.find({ category: category }).lean();
        if (shows.length === 0) {
            return res.status(404).json({ message: `No shows found for category: ${category}` });
        }
        return res.json(shows);
    } catch (err) {
        console.error('Error fetching shows by category:', err.message);
        return res.status(500).json({ message: 'Failed to fetch shows', error: err.message });
    }
});


module.exports = router;