const express = require('express');

function createAuthRoutes(authService, authProvider) {
    const router = express.Router();

    // Manual signup
    router.post('/signup', async (req, res) => {
        try {
            const { email, password, name } = req.body;
            const user = await authService.registerUser(email, password, name);
            
            req.login(user, (err) => {
                if (err) {
                    return res.status(500).json({ error: 'Error logging in after signup' });
                }
                res.json({ message: 'Signup successful', user: user.toJSON() });
            });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    });

    // Manual login
    router.post('/login', (req, res, next) => {
        authProvider.authenticate('local', (err, user, info) => {
            if (err) {
                return res.status(500).json({ error: 'Internal server error' });
            }
            if (!user) {
                return res.status(401).json({ error: 'Invalid email or password' });
            }
            req.login(user, (err) => {
                if (err) {
                    return res.status(500).json({ error: 'Error logging in' });
                }
                return res.json({ message: 'Login successful', user: user.toJSON() });
            });
        })(req, res, next);
    });

    // Google OAuth routes
    router.get('/google', authProvider.authenticate('google', {
        scope: ['profile', 'email']
    }));

    router.get('/google/callback',
        authProvider.authenticate('google', { failureRedirect: '/login' }),
        (req, res) => {
            res.redirect('/dashboard');
        }
    );

    // Logout
    router.get('/logout', (req, res) => {
        req.logout((err) => {
            if (err) {
                return res.status(500).json({ error: 'Error logging out' });
            }
            res.json({ message: 'Logged out successfully' });
        });
    });

    // Get current user
    router.get('/current-user', (req, res) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        res.json({ user: req.user.toJSON() });
    });

    router.get('/check', (req, res) => {
        if (req.isAuthenticated()) {
            res.status(200).json({ authenticated: true });
        } else {
            res.status(401).json({ authenticated: false });
        }
    });

    return router;
}

module.exports = createAuthRoutes; 