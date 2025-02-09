class UserRegistered {
    constructor(userId, email, name, registrationType) {
        this.userId = userId;
        this.email = email;
        this.name = name;
        this.registrationType = registrationType; // 'local' or 'google'
        this.timestamp = new Date();
    }
}

class UserLoggedIn {
    constructor(userId, loginType) {
        this.userId = userId;
        this.loginType = loginType; // 'local' or 'google'
        this.timestamp = new Date();
    }
}

class GoogleAccountLinked {
    constructor(userId, googleId) {
        this.userId = userId;
        this.googleId = googleId;
        this.timestamp = new Date();
    }
}

class ProfileUpdated {
    constructor(userId, changes) {
        this.userId = userId;
        this.changes = changes;
        this.timestamp = new Date();
    }
}

module.exports = {
    UserRegistered,
    UserLoggedIn,
    GoogleAccountLinked,
    ProfileUpdated
}; 