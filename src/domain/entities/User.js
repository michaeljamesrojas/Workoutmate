const bcrypt = require('bcryptjs');

class User {
    #id;
    #email;
    #name;
    #password;
    #googleId;
    #profilePicture;
    #createdAt;

    constructor(id, email, name, password = null, googleId = null, profilePicture = null) {
        this.#id = id;
        this.#email = email;
        this.#name = name;
        this.#password = password;
        this.#googleId = googleId;
        this.#profilePicture = profilePicture;
        this.#createdAt = new Date();
    }

    // Getters
    get id() { return this.#id; }
    get email() { return this.#email; }
    get name() { return this.#name; }
    get googleId() { return this.#googleId; }
    get profilePicture() { return this.#profilePicture; }
    get createdAt() { return this.#createdAt; }

    // Domain methods
    async setPassword(plainPassword) {
        if (!plainPassword) {
            throw new Error('Password cannot be empty');
        }
        this.#password = await bcrypt.hash(plainPassword, 10);
    }

    async comparePassword(candidatePassword) {
        if (!this.#password) return false;
        return bcrypt.compare(candidatePassword, this.#password);
    }

    linkGoogleAccount(googleId, profilePicture) {
        if (this.#googleId) {
            throw new Error('Google account already linked');
        }
        this.#googleId = googleId;
        this.#profilePicture = profilePicture;
    }

    updateProfile(name, profilePicture) {
        if (name) this.#name = name;
        if (profilePicture) this.#profilePicture = profilePicture;
    }

    toJSON() {
        return {
            id: this.#id,
            email: this.#email,
            name: this.#name,
            profilePicture: this.#profilePicture,
            createdAt: this.#createdAt
        };
    }

    // Factory methods
    static createNew(email, name) {
        return new User(null, email, name);
    }

    static createFromGoogle(email, name, googleId, profilePicture) {
        return new User(null, email, name, null, googleId, profilePicture);
    }
}

module.exports = User; 