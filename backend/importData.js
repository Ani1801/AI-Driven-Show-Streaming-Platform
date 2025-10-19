const fs = require('fs');
const mongoose = require('mongoose');
const path = require('path');

// --- DATABASE CONNECTION ---
// Ensure this points to your correct MongoDB database
const DB_CONNECTION_STRING = "mongodb://127.0.0.1:27017/Streaming_Platform"; // Changed DB name to Streaming_Platform

mongoose.connect(DB_CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('MongoDB Connected...'));

// --- IMPORT MODELS ---
// Models are primarily useful if you need schema validation during import,
// but often we query collections directly in the analysis routes.
const SegmentCount = require('./models/SegmentCount');
const AssociationRule = require('./models/AssociationRule');
const PcaResult = require('./models/PcaResult');
// We don't necessarily need models for every collection if we query directly.
// const Distribution = require('./models/Distribution'); // Only needed if using model methods

// --- MAIN IMPORT FUNCTION ---
const importData = async () => {
    try {
        // --- Read Existing JSON Files ---
        const segmentData = JSON.parse(fs.readFileSync(path.join(__dirname, 'admin-data/segment_counts.json'), 'utf-8'));
        const ruleData = JSON.parse(fs.readFileSync(path.join(__dirname, 'admin-data/association_rules.json'), 'utf-8'));
        const pcaData = JSON.parse(fs.readFileSync(path.join(__dirname, 'admin-data/pca_results.json'), 'utf-8'));
        const subscriptionDistData = JSON.parse(fs.readFileSync(path.join(__dirname, 'admin-data/dist_by_subscription.json'), 'utf-8'));
        const deviceDistData = JSON.parse(fs.readFileSync(path.join(__dirname, 'admin-data/dist_by_device.json'), 'utf-8'));

        // --- Read NEW JSON Files ---
        const countryData = JSON.parse(fs.readFileSync(path.join(__dirname, 'admin-data/users_by_country.json'), 'utf-8'));
        const genreData = JSON.parse(fs.readFileSync(path.join(__dirname, 'admin-data/popular_genres.json'), 'utf-8'));
        const subStatusData = JSON.parse(fs.readFileSync(path.join(__dirname, 'admin-data/subscription_status.json'), 'utf-8'));

        // --- Clear Existing Data ---
        console.log('Clearing old data...');
        await SegmentCount.deleteMany();
        await AssociationRule.deleteMany();
        await PcaResult.deleteMany();
        await mongoose.connection.collection('subscriptiondistributions').deleteMany({});
        await mongoose.connection.collection('devicedistributions').deleteMany({});

        // --- Clear NEW Collections ---
        await mongoose.connection.collection('usersbycountries').deleteMany({});
        await mongoose.connection.collection('populargenres').deleteMany({});
        await mongoose.connection.collection('subscriptionstatuses').deleteMany({});

        console.log('Old data cleared! 🧹');

        // --- Insert New Data ---
        console.log('Importing new data...');
        await SegmentCount.insertMany(segmentData);
        await AssociationRule.insertMany(ruleData);
        await PcaResult.insertMany(pcaData);
        await mongoose.connection.collection('subscriptiondistributions').insertMany(subscriptionDistData);
        await mongoose.connection.collection('devicedistributions').insertMany(deviceDistData);

        // --- Insert NEW Data into NEW Collections ---
        await mongoose.connection.collection('usersbycountries').insertMany(countryData);
        await mongoose.connection.collection('populargenres').insertMany(genreData);
        await mongoose.connection.collection('subscriptionstatuses').insertMany(subStatusData);

        console.log('All data imported successfully! ✅');

    } catch (error) {
        console.error('❌ Error during data import:', error);
    } finally {
        // Ensure the script exits after completion or error
        process.exit();
    }
};

// Run the function
importData();