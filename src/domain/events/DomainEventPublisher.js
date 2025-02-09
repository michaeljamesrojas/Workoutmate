class DomainEventPublisher {
    static #instance;
    #handlers;

    constructor() {
        if (DomainEventPublisher.#instance) {
            return DomainEventPublisher.#instance;
        }
        this.#handlers = new Map();
        DomainEventPublisher.#instance = this;
    }

    static getInstance() {
        if (!DomainEventPublisher.#instance) {
            DomainEventPublisher.#instance = new DomainEventPublisher();
        }
        return DomainEventPublisher.#instance;
    }

    subscribe(eventType, handler) {
        if (!this.#handlers.has(eventType)) {
            this.#handlers.set(eventType, new Set());
        }
        this.#handlers.get(eventType).add(handler);
    }

    unsubscribe(eventType, handler) {
        if (this.#handlers.has(eventType)) {
            this.#handlers.get(eventType).delete(handler);
        }
    }

    async publish(event) {
        const eventType = event.constructor.name;
        if (this.#handlers.has(eventType)) {
            const handlers = this.#handlers.get(eventType);
            const promises = Array.from(handlers).map(handler => handler(event));
            await Promise.all(promises);
        }
    }
}

module.exports = DomainEventPublisher; 