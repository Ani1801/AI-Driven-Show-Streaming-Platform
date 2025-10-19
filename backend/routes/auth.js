// routes/auth.js
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Profile = require("../models/Profile");

const router = express.Router();

// Signup route
router.post("/signup", async (req, res) => {
    try {
        const { fullName, email, password, confirmPassword } = req.body;

        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already registered" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            fullName,
            email,
            password: hashedPassword,
            role: 'user', // ADDED: New users are assigned the 'user' role by default.
        });

        await newUser.save();
        await Profile.create({ user: newUser._id });

        res.status(201).json({ message: "User registered successfully" });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// Login route
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // ======================================================================
        // === THIS IS THE CRITICAL FIX ===
        // We MUST add 'role: user.role' to the JWT payload.
        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role }, // <-- FIX IS HERE
            process.env.JWT_SECRET || "your_jwt_secret_key",
            { expiresIn: "7d" }
        );
        // ======================================================================

        const redirectTo = user.role === 'admin' ? '/views/admin/admin_dashboard.html' : '/index.html';

        const profile = await Profile.findOne({ user: user._id });
        
        res.json({
            message: "Login successful",
            token,
            redirectTo,
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role, // Also good to include here
                phone: (profile && profile.phone) || "",
                avatarUrl: (profile && profile.avatarUrl) || "",
                bio: (profile && profile.bio) || "",
            },
        });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

module.exports = router;