const User = require('@domain/entities/User');

class AuthService {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    async registerUser(email, password, name) {
        const existingUser = await this.userRepository.findByEmail(email);
        if (existingUser) {
            throw new Error('Email already registered');
        }

        const user = User.createNew(email, name);
        await user.setPassword(password);
        
        return this.userRepository.save(user);
    }

    async authenticateUser(email, password) {
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new Error('Invalid email or password');
        }

        const isValid = await user.comparePassword(password);
        if (!isValid) {
            throw new Error('Invalid email or password');
        }

        return user;
    }

    async authenticateGoogleUser(profile) {
        let user = await this.userRepository.findByGoogleId(profile.id);

        if (!user) {
            // Check if user exists with same email
            user = await this.userRepository.findByEmail(profile.emails[0].value);
            
            if (user) {
                // Link Google account to existing user
                return this.userRepository.update(user.id, {
                    googleId: profile.id,
                    profilePicture: profile.photos[0].value
                });
            } else {
                // Create new user
                const newUser = User.createFromGoogle(
                    profile.emails[0].value,
                    profile.displayName,
                    profile.id,
                    profile.photos[0].value
                );
                return this.userRepository.save(newUser);
            }
        }

        return user;
    }

    async getUserById(id) {
        return this.userRepository.findById(id);
    }
}

module.exports = AuthService; 