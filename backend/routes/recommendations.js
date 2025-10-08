const express = require('express');
const router = express.Router();
const UserRecommendation = require('../models/UserRecommendation');
const auth = require('../middleware/auth');

router.post('/', auth, async (req, res) => {
    const { sourceShowId, recommendations } = req.body;

    // --- THIS IS THE FINAL FIX ---
    // Read the ID from req.user, just like your working watchHistory route does.
    const userId = req.user.id;

    if (!sourceShowId || !Array.isArray(recommendations)) {
        return res.status(400).json({ message: 'sourceShowId and recommendations array are required' });
    }
    try {
        await UserRecommendation.updateOne(
            { user: userId },
            { 
                $set: { 
                    recommendations: recommendations,
                    sourceShowId: sourceShowId,
                    lastUpdated: new Date()
                },
                $setOnInsert: { user: userId } 
            },
            { upsert: true }
        );
        res.status(200).json({ message: 'Recommendations saved successfully' });
    } catch (err) { // <<<--- REPLACE YOUR CATCH BLOCK WITH THIS

        // --- ADD THESE LOUD LOGS ---
        console.log("\n\n");
        console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
        console.log("!!!      RECOMMENDATION SAVE CRASHED       !!!");
        console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
        console.error("THE FULL ERROR OBJECT IS:", err); // Log the entire error object
        console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
        console.log("\n\n");
        // ------------------------------------
        
        res.status(500).json({ message: 'Server error while saving recommendations' });
    }
});

// Your GET route remains the same
router.get('/:userId', auth, async (req, res) => {
    // ... your correct GET logic ...
});

module.exports = router;