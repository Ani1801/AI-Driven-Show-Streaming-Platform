const express = require('express');
const router = express.Router();
const Favourite = require('../models/Favourite');
const auth = require('../middleware/auth');

// GET /api/favourites -> Get all of the user's favourites
router.get('/', auth, async (req, res) => {
    try {
        const favourites = await Favourite.find({ user: req.user.id }).populate('show');
        res.json(favourites);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /api/favourites -> Add a show to favourites
router.post('/', auth, async (req, res) => {
    try {
        const newFavourite = new Favourite({
            user: req.user.id,
            show: req.body.showId
        });
        await newFavourite.save();
        res.status(201).json(newFavourite);
    } catch (err) {
        // Handle duplicate error
        if (err.code === 11000) {
            return res.status(400).json({ message: 'Already in favourites' });
        }
        res.status(500).json({ message: 'Server error' });
    }
});

// DELETE /api/favourites/:showId -> Remove a show from favourites
router.delete('/:showId', auth, async (req, res) => {
    try {
        await Favourite.deleteOne({ user: req.user.id, show: req.params.showId });
        res.json({ message: 'Removed from favourites' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;