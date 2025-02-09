const GoogleStrategy = require('passport-google-oauth20').Strategy;

function createGoogleStrategy(authService) {
    return new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/auth/google/callback'
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            const user = await authService.authenticateGoogleUser(profile);
            return done(null, user);
        } catch (error) {
            return done(error);
        }
    });
}

module.exports = createGoogleStrategy; 