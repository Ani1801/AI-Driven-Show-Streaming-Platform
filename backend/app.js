require('dotenv').config(); // Loads .env variables
const express = require("express");
const mongoose = require("mongoose");
const cors = require('cors');
const path = require('path');
// --- STEP 1: Import ALL necessary routers ---
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const paymentRoutes = require("./routes/payments");
const showRoutes = require("./routes/shows");
const recommendationRoutes = require("./routes/recommendations");
const watchHistoryRoutes = require("./routes/watchHistory");
const favouriteRoutes = require("./routes/favourites"); // Assuming you created this from the users.js refactor
const analysisRoutes = require('./routes/analysis');
const adminRoutes = require('./routes/admin');
const app = express();
app.use(cors()); // Allow all origins
app.use(express.json()); // Middleware to parse JSON bodies
app.use(express.static(path.join(__dirname, '../frontend'))); // Serve static files from the frontend directory


// --- MongoDB Connection ---
mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/Streaming_Platform")
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => console.error("❌ MongoDB connection error:", err));

// --- STEP 2: Mount ALL routers with the correct '/api' prefix ---
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/shows", showRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/watch-history", watchHistoryRoutes);
app.use("/api/favourites", favouriteRoutes); // Mount the new favourites router
app.use('/api/analysis', analysisRoutes);
app.use('/api/admin', adminRoutes);
// Default Route for testing
app.get("/", (req, res) => {
    res.send("Welcome to the PrimeVision API! 🚀");
});

// --- Start Server ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

module.exports = app;