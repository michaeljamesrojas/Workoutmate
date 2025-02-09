class AuthUtils {
    static async checkAuthentication() {
        try {
            const response = await fetch('/auth/check', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                window.location.href = '/auth/login';
                return false;
            }
            return true;
        } catch (error) {
            console.error('Authentication check failed:', error);
            window.location.href = '/auth/login';
            return false;
        }
    }
}

export default AuthUtils; 