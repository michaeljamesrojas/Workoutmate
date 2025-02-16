import { AuthenticationError } from '../../shared/exceptions/AuthenticationError';

export class LoginCredentials {
  constructor(email, password) {
    this.validate(email, password);
    this._email = email;
    this._password = password;
  }

  validate(email, password) {
    if (!email || !email.includes('@')) {
      throw new AuthenticationError('Invalid email format');
    }
    if (!password || password.length < 6) {
      throw new AuthenticationError('Password must be at least 6 characters long');
    }
  }

  get email() {
    return this._email;
  }

  get password() {
    return this._password;
  }

  toJSON() {
    return {
      email: this._email,
      password: this._password
    };
  }
} 