const User = require("../models/User");
const Profile = require("../models/Profile");
const axios = require("axios");
const jwt = require("jsonwebtoken");

// This function will create your app's token after a successful Google login
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET || "your_jwt_secret_key", {
        expiresIn: "7d",
    });
};

exports.googleLogin = (req, res) => {
    const redirectUrl = "http://localhost:5000/api/auth/google/callback";
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${redirectUrl}&response_type=code&scope=email profile&access_type=offline&prompt=consent`;
    res.redirect(url);
};

exports.googleCallback = async (req, res) => {
    const { code } = req.query;
    const redirectUri = "http://localhost:5000/api/auth/google/callback";

    try {
        // 1. Exchange the code for an access token
        const tokenRes = await axios.post("https://oauth2.googleapis.com/token", {
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            code,
            redirect_uri: redirectUri,
            grant_type: "authorization_code",
        });
        const { access_token } = tokenRes.data;

        // 2. Use the access token to get the user's profile
        const userRes = await axios.get("https://www.googleapis.com/oauth2/v1/userinfo", {
            headers: { Authorization: `Bearer ${access_token}` },
        });
        const googleUser = userRes.data;

        // 3. Find or create the user in your database
        let user = await User.findOne({ email: googleUser.email });
        if (!user) {
            user = new User({
                fullName: googleUser.name,
                email: googleUser.email,
                // No password needed for OAuth users
            });
            await user.save();
            await Profile.create({ user: user._id });
        }

        // 4. Generate your own app's JWT and redirect
        const token = generateToken(user._id);
        res.redirect(`http://localhost:5500/frontend/views/auth-success.html?token=${token}&userId=${user._id}&name=${encodeURIComponent(user.fullName)}`);

    } catch (error) {
        console.error("Error in Google OAuth callback:", error.message);
        res.redirect("http://localhost:5500/frontend/views/login.html?error=google_failed");
    }
};