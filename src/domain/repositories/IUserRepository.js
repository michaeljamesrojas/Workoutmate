/**
 * @interface IUserRepository
 * Repository interface for User entity operations
 */
class IUserRepository {
    /**
     * Find a user by their ID
     * @param {string} id
     * @returns {Promise<import('../entities/User')>}
     */
    async findById(id) {
        throw new Error('Method not implemented');
    }

    /**
     * Find a user by their email
     * @param {string} email
     * @returns {Promise<import('../entities/User')>}
     */
    async findByEmail(email) {
        throw new Error('Method not implemented');
    }

    /**
     * Find a user by their Google ID
     * @param {string} googleId
     * @returns {Promise<import('../entities/User')>}
     */
    async findByGoogleId(googleId) {
        throw new Error('Method not implemented');
    }

    /**
     * Save a user
     * @param {import('../entities/User')} user
     * @returns {Promise<import('../entities/User')>}
     */
    async save(user) {
        throw new Error('Method not implemented');
    }

    /**
     * Update a user
     * @param {string} id
     * @param {Partial<import('../entities/User')>} userData
     * @returns {Promise<import('../entities/User')>}
     */
    async update(id, userData) {
        throw new Error('Method not implemented');
    }

    /**
     * Delete a user
     * @param {string} id
     * @returns {Promise<boolean>}
     */
    async delete(id) {
        throw new Error('Method not implemented');
    }
}

module.exports = IUserRepository; 