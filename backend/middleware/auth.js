const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Access Denied: No token provided." });
        }
        
        const token = authHeader.split(' ')[1];
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret_key");

        req.user = { id: decodedToken.id };
        next();

    } catch (error) {
        res.status(401).json({ message: "Authentication failed: Token is not valid." });
    }
};

module.exports = auth;