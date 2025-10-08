const express = require('express');
const router = express.Router();
const WatchHistory = require('../models/WatchHistory');
const auth = require('../middleware/auth');

// POST /api/watch-history -> Adds or updates a show in a user's history
router.post('/', auth, async (req, res) => {
    const { showId } = req.body;
    const userId = req.user.id; 

    try {
        await WatchHistory.findOneAndUpdate(
            { user: userId, show: showId },
            { lastUpdated: new Date() },
            { upsert: true, new: true }
        );
        res.status(200).json({ message: 'Watch history updated.' });
    } catch (err) {
        console.error("Error updating watch history:", err.message);
        res.status(500).json({ message: 'Server error while updating watch history.' });
    }
});

// GET /api/watch-history/:userId -> Gets a user's watch history
router.get('/:userId', auth, async (req, res) => {
    try {
        const history = await WatchHistory.find({ user: req.params.userId })
            .sort({ lastUpdated: -1 })
            .limit(20)
            .populate('show'); 

        res.json(history);
    } catch (err) { // --- FIX #1: Added opening curly brace { ---
        console.error("Error fetching watch history:", err.message);
        res.status(500).json({ message: 'Server error while fetching watch history.' });
    } // --- FIX #2: Added closing curly brace } ---
});

module.exports = router;