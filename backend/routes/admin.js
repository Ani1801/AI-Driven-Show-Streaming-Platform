const express = require('express');
const router = express.Router();
// const adminAuth = require('../middleware/adminAuth'); // Uncomment when ready for security
const User = require('../models/User'); // Adjust path if needed
const Show = require('../models/Show'); // Adjust path if needed

// GET /api/admin/stats -> Get dashboard statistics.
// router.get('/stats', adminAuth, async (req, res) => { // Uncomment adminAuth later
router.get('/stats', async (req, res) => { // Temporarily bypassing auth
    try {
        const userCount = await User.countDocuments();
        const showCount = await Show.countDocuments();
        // Add calculations for revenue and watch time here if possible
        res.json({
            users: userCount,
            shows: showCount,
            revenue: 0,    // Placeholder
            watchTime: 0 // Placeholder
        });
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        res.status(500).json({ message: 'Error fetching admin stats.' });
    }
});

// GET /api/admin/shows -> Get recent shows for the dashboard table.
// router.get('/shows', adminAuth, async (req, res) => { // Uncomment adminAuth later
router.get('/shows', async (req, res) => { // Temporarily bypassing auth
    try {
        // Find shows, sort by creation date (newest first), limit to 5
        const shows = await Show.find().sort({ createdAt: -1 }).limit(5);
        res.json(shows);
    } catch (error) {
        console.error('Error fetching recent shows:', error);
        res.status(500).json({ message: 'Error fetching shows.' });
    }
});

module.exports = router;