import { AuthenticationError } from '../../domain/shared/exceptions/AuthenticationError';

class AuthenticationService {
  async login(credentials) {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new AuthenticationError(data.message || 'Login failed');
      }

      const user = await response.json();
      return user;
    } catch (error) {
      if (error instanceof AuthenticationError) {
        throw error;
      }
      throw new AuthenticationError('An error occurred during login');
    }
  }

  getGoogleAuthUrl() {
    return '/auth/google';
  }
}

export const authenticationService = new AuthenticationService(); 