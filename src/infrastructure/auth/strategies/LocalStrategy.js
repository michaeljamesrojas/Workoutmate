const LocalStrategy = require('passport-local').Strategy;

function createLocalStrategy(authService) {
    return new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    }, async (email, password, done) => {
        try {
            const user = await authService.authenticateUser(email, password);
            return done(null, user);
        } catch (error) {
            return done(null, false, { message: error.message });
        }
    });
}

module.exports = createLocalStrategy; 