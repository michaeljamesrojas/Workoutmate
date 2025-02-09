const { v4: uuidv4 } = require('uuid');
const User = require('@domain/entities/User');
const IUserRepository = require('@domain/repositories/IUserRepository');

class InMemoryUserRepository extends IUserRepository {
    constructor() {
        super();
        this.users = new Map();
    }

    async findById(id) {
        return this.users.get(id) || null;
    }

    async findByEmail(email) {
        return Array.from(this.users.values()).find(user => user.email === email) || null;
    }

    async findByGoogleId(googleId) {
        return Array.from(this.users.values()).find(user => user.googleId === googleId) || null;
    }

    async save(userData) {
        const id = userData.id || uuidv4();
        let user;

        if (userData instanceof User) {
            user = userData;
            Object.defineProperty(user, 'id', { value: id });
        } else {
            user = new User(
                id,
                userData.email,
                userData.name,
                userData.password,
                userData.googleId,
                userData.profilePicture
            );
        }
        
        this.users.set(id, user);
        return user;
    }

    async update(id, userData) {
        const user = this.users.get(id);
        if (!user) return null;

        if (userData.name || userData.profilePicture) {
            user.updateProfile(userData.name, userData.profilePicture);
        }

        if (userData.googleId) {
            user.linkGoogleAccount(userData.googleId, userData.profilePicture);
        }

        return user;
    }

    async delete(id) {
        return this.users.delete(id);
    }
}

module.exports = InMemoryUserRepository; 