const express = require('express');
const mongoose = require('mongoose');
const Show = require('../models/Show');

const router = express.Router();

// NOTE: This file should only contain PUBLIC routes that do not require a user to be logged in.
// The 'auth' middleware has been removed from all routes in this file.

// GET /api/shows/recommendations/:id -> Generates a NEW list of recommendations. PUBLIC.
// This route must come before the '/:category' route to avoid conflicts.
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
        console.error("Error generating recommendations:", err.message);
        return res.status(500).json({ message: 'Failed to fetch recommendations', error: err.message });
    }
});

// GET /api/shows/:category -> Fetches a list of shows by category (e.g., 'popular', 'you-might-like'). PUBLIC.
// This single dynamic route replaces the separate /popular and /you-might-like routes.
router.get('/:category', async (req, res) => {
    try {
        const { category } = req.params;
        const shows = await Show.find({ category: category }).lean();
        return res.json(shows);
    } catch (err) {
        console.error(`Error fetching shows for category "${req.params.category}":`, err.message);
        return res.status(500).json({ message: 'Failed to fetch shows by category', error: err.message });
    }
});

// The old GET '/' route has been removed as it is now handled by the dynamic '/:category' route.

module.exports = router;