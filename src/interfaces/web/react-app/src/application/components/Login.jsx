import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authenticationService } from '../services/AuthenticationService';
import { LoginCredentials } from '../../domain/models/auth/LoginCredentials';
import '../styles/auth.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    setMessage(''); // Clear any error messages when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const credentials = new LoginCredentials(formData.email, formData.password);
      await authenticationService.login(credentials);
      navigate('/dashboard');
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center">
      <div className="auth-container">
        <h1 className="auth-title">Login to Workoutmate</h1>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-input-group">
            <label htmlFor="email" className="auth-input-label">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="auth-input"
            />
          </div>

          <div className="auth-input-group">
            <label htmlFor="password" className="auth-input-label">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="auth-input"
            />
          </div>

          <button type="submit" className="auth-button">
            Login
          </button>
        </form>

        <div className="auth-divider">
          <span className="auth-divider-text">or</span>
        </div>

        <a href={authenticationService.getGoogleAuthUrl()} className="auth-social-button">
          <img
            src="https://www.google.com/favicon.ico"
            alt="Google"
            className="w-5 h-5"
          />
          Continue with Google
        </a>

        <p className="auth-footer">
          Don't have an account?{' '}
          <a href="/signup" className="auth-link">
            Sign up
          </a>
        </p>

        {message && (
          <div className="message" style={{ display: message ? 'block' : 'none' }}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export { Login };
