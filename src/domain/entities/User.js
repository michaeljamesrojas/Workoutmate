const bcrypt = require('bcryptjs');
const Email = require('@domain/valueObjects/Email');
const DomainEventPublisher = require('@domain/events/DomainEventPublisher');
const { UserRegistered, GoogleAccountLinked, ProfileUpdated } = require('@domain/events/UserEvents');

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
        this.#email = new Email(email);
        this.#name = name;
        this.#password = password;
        this.#googleId = googleId;
        this.#profilePicture = profilePicture;
        this.#createdAt = new Date();
    }

    // Getters
    get id() { return this.#id; }
    get email() { return this.#email.value; }
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

        // Publish domain event
        DomainEventPublisher.getInstance().publish(
            new GoogleAccountLinked(this.#id, googleId)
        );
    }

    updateProfile(name, profilePicture) {
        const changes = {};
        if (name && name !== this.#name) {
            this.#name = name;
            changes.name = name;
        }
        if (profilePicture && profilePicture !== this.#profilePicture) {
            this.#profilePicture = profilePicture;
            changes.profilePicture = profilePicture;
        }

        if (Object.keys(changes).length > 0) {
            // Publish domain event
            DomainEventPublisher.getInstance().publish(
                new ProfileUpdated(this.#id, changes)
            );
        }
    }

    toJSON() {
        return {
            id: this.#id,
            email: this.#email.value,
            name: this.#name,
            profilePicture: this.#profilePicture,
            createdAt: this.#createdAt
        };
    }

    // Factory methods
    static createNew(email, name) {
        const user = new User(null, email, name);
        
        // Publish domain event
        DomainEventPublisher.getInstance().publish(
            new UserRegistered(user.id, email, name, 'local')
        );

        return user;
    }

    static createFromGoogle(email, name, googleId, profilePicture) {
        const user = new User(null, email, name, null, googleId, profilePicture);

        // Publish domain event
        DomainEventPublisher.getInstance().publish(
            new UserRegistered(user.id, email, name, 'google')
        );

        return user;
    }
}

module.exports = User; 