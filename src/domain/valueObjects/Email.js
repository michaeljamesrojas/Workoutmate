class Email {
    #value;

    constructor(email) {
        this.validate(email);
        this.#value = email.toLowerCase();
    }

    validate(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            throw new Error('Invalid email format');
        }
    }

    equals(other) {
        return other instanceof Email && this.#value === other.value;
    }

    get value() {
        return this.#value;
    }

    toString() {
        return this.#value;
    }
}

module.exports = Email; 