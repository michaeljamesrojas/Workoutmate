class DomainException extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
    }
}

class InvalidEmailException extends DomainException {
    constructor(email) {
        super(`Invalid email format: ${email}`);
        this.email = email;
    }
}

class UserAlreadyExistsException extends DomainException {
    constructor(email) {
        super(`User already exists with email: ${email}`);
        this.email = email;
    }
}

class InvalidCredentialsException extends DomainException {
    constructor() {
        super('Invalid email or password');
    }
}

class GoogleAccountAlreadyLinkedException extends DomainException {
    constructor(userId) {
        super('Google account already linked to this user');
        this.userId = userId;
    }
}

module.exports = {
    DomainException,
    InvalidEmailException,
    UserAlreadyExistsException,
    InvalidCredentialsException,
    GoogleAccountAlreadyLinkedException
}; 