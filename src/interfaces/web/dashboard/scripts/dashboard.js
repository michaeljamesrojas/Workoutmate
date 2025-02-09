import AuthUtils from '@/interfaces/web/shared/scripts/authUtils.js';

class DashboardPage {
    constructor() {
        this.init();
    }

    async init() {
        // Check authentication before initializing dashboard
        const isAuthenticated = await AuthUtils.checkAuthentication();
        if (!isAuthenticated) return;

        // Initialize dashboard components
        this.setupEventListeners();
        this.loadDashboardData();
    }

    setupEventListeners() {
        // Add your event listeners here
    }

    async loadDashboardData() {
        // Load dashboard data here
    }
}

// Initialize dashboard
new DashboardPage(); 