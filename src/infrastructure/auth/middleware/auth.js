const ensureAuth = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    // Redirect to login page for HTML requests, send 401 for API requests
    if (req.accepts('html')) {
        res.redirect('/login');
    } else {
        res.status(401).json({ error: 'Please log in to continue' });
    }
};

const ensureGuest = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return next();
    }
    res.redirect('/dashboard');
};

module.exports = {
    ensureAuth,
    ensureGuest
}; 