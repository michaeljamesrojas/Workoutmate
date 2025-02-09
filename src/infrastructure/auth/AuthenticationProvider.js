const passport = require('passport');
const createLocalStrategy = require('./strategies/LocalStrategy');
const createGoogleStrategy = require('./strategies/GoogleStrategy');
const configureUserSerialization = require('./serialization/UserSerialization');

class AuthenticationProvider {
    constructor(authService) {
        this.passport = passport;
        this.authService = authService;
        this.initialize();
    }

    initialize() {
        // Configure strategies
        this.passport.use(createLocalStrategy(this.authService));
        this.passport.use(createGoogleStrategy(this.authService));

        // Configure serialization
        configureUserSerialization(this.passport, this.authService);
    }

    getPassportInstance() {
        return this.passport;
    }

    getMiddleware() {
        return {
            initialize: this.passport.initialize(),
            session: this.passport.session()
        };
    }

    authenticate(strategy, options = {}) {
        return this.passport.authenticate(strategy, options);
    }
}

module.exports = AuthenticationProvider; 