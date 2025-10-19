const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

// --- Import Mongoose Models (Optional but good practice) ---
const SegmentCount = require('../models/SegmentCount');
const AssociationRule = require('../models/AssociationRule');
const PcaResult = require('../models/PcaResult');

// --- API Endpoints for Kaggle Data Analysis ---

// 1. GET User Segment Counts (K-Means)
// Endpoint: /api/analysis/segment-counts
router.get('/segment-counts', async (req, res) => {
    try {
        const data = await SegmentCount.find();
        res.json(data);
    } catch (err) { res.status(500).json({ message: 'Server Error' }); }
});

// 2. GET PCA Results
// Endpoint: /api/analysis/pca-results
router.get('/pca-results', async (req, res) => {
    try {
        const data = await PcaResult.find();
        res.json(data);
    } catch (err) { res.status(500).json({ message: 'Server Error' }); }
});

// 3. GET User Distribution by Country (NEWLY NEEDED)
// Endpoint: /api/analysis/distribution/country
router.get('/distribution/country', async (req, res) => {
    try {
        // Fetches from the 'usersbycountries' collection
        const data = await mongoose.connection.collection('usersbycountries').find().toArray();
        res.json(data);
    } catch (err) { res.status(500).json({ message: 'Server Error' }); }
});

// 4. GET Engagement by Subscription
// Endpoint: /api/analysis/distribution/subscription
router.get('/distribution/subscription', async (req, res) => {
    try {
        // Fetches from 'subscriptiondistributions' collection
        const data = await mongoose.connection.collection('subscriptiondistributions').find().toArray();
        res.json(data);
    } catch (err) { res.status(500).json({ message: 'Server Error' }); }
});

// 5. GET Engagement by Device
// Endpoint: /api/analysis/distribution/device
router.get('/distribution/device', async (req, res) => {
    try {
        // Fetches from 'devicedistributions' collection
        const data = await mongoose.connection.collection('devicedistributions').find().toArray();
        res.json(data);
    } catch (err) { res.status(500).json({ message: 'Server Error' }); }
});

// 6. GET Subscription Status Breakdown (NEWLY NEEDED)
// Endpoint: /api/analysis/subscription-status
router.get('/subscription-status', async (req, res) => {
    try {
        // Fetches from 'subscriptionstatuses' collection
        const data = await mongoose.connection.collection('subscriptionstatuses').find().toArray();
        res.json(data);
    } catch (err) { res.status(500).json({ message: 'Server Error' }); }
});

// 7. GET Most Popular Genres (NEWLY NEEDED)
// Endpoint: /api/analysis/popular-genres
router.get('/popular-genres', async (req, res) => {
    try {
        // Fetches from 'populargenres' collection
        const data = await mongoose.connection.collection('populargenres').find().toArray();
        res.json(data);
    } catch (err) { res.status(500).json({ message: 'Server Error' }); }
});

// 8. GET Association Rules (Apriori)
// Endpoint: /api/analysis/association-rules
router.get('/association-rules', async (req, res) => {
    try {
        const data = await AssociationRule.find().sort({ lift: -1 });
        res.json(data);
    } catch (err) { res.status(500).json({ message: 'Server Error' }); }
});

module.exports = router;