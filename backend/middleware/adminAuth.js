const auth = require('./auth'); // Reuse your existing login check

const adminAuth = (req, res, next) => {
    // First, run the standard 'auth' middleware to ensure the user is logged in.
    auth(req, res, () => {
        // 'auth' middleware provides req.user. If it passed, we check the role.
        if (req.user.role === 'admin') {
            next(); // If role is 'admin', proceed.
        } else {
            // If not an admin, deny access.
            res.status(403).json({ message: 'Access denied. Admin privileges required.' });
        }
    });
};

module.exports = adminAuth;