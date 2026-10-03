import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

function Login({ onLogin }) {
  const navigate = useNavigate();
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.PROD ? '' : 'http://localhost:8890'}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user, pass }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Login failed. Please try again.');
        setLoading(false);
        return;
      }

      if (data.token) {
        // Save token as cookie (expires in 1 hour)
        const expires = new Date(Date.now() + 60 * 60 * 1000).toUTCString();
        document.cookie = `auth_token=${data.token}; expires=${expires}; path=/; SameSite=Strict`;
        onLogin(data.token);
        navigate('/allcourses', { replace: true });
      } else {
        setError('No token received. Please try again.');
      }
    } catch {
      setError('Cannot connect to server. Make sure the backend is running.');
    }

    setLoading(false);
  };

  return (
    <div className="login-shell">
      {/* Animated background blobs */}
      <div className="login-bg">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
      </div>

      <div className="login-card">
        {/* Logo / Brand */}
        <div className="login-brand">
          <img src={`${import.meta.env.PROD ? '' : 'http://localhost:8890'}/logo.jpg`} alt="Omixelo Logo" className="brand-logo-img" />
          <div>
            <h1 className="login-title">OMIXELO</h1>
            <p className="login-subtitle">Sign in to your account</p>
          </div>
        </div>

        {/* Error Notice */}
        {error && (
          <div className="login-error" role="alert">
            <span className="error-icon">⚠</span>
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="login-form" noValidate>
          <div className="login-field">
            <label htmlFor="username">Username</label>
            <div className="input-wrap">
              <span className="input-icon">👤</span>
              <input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={user}
                onChange={(e) => setUser(e.target.value)}
                required
                autoComplete="username"
                autoFocus
              />
            </div>
          </div>

          <div className="login-field">
            <label htmlFor="password">Password</label>
            <div className="input-wrap">
              <span className="input-icon">🔒</span>
              <input
                id="password"
                type={showPass ? 'text' : 'password'}
                placeholder="Enter your password"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="toggle-pass"
                onClick={() => setShowPass(!showPass)}
                aria-label={showPass ? 'Hide password' : 'Show password'}
              >
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button
            id="login-submit-btn"
            type="submit"
            className={`login-btn ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner" />
                Signing in...
              </>
            ) : (
              <>
                Sign In
              </>
            )}
          </button>
          
          <div className="divider">
            <span>OR</span>
          </div>

          <button
            type="button"
            className="google-btn"
            onClick={() => window.location.href = `${import.meta.env.PROD ? '' : 'http://localhost:8890'}/auth/google`}
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="google-icon" />
            Sign in with Google
          </button>
        </form>

        <p className="login-footer">
          Don't have an account?{' '}
          <button type="button" className="login-switch-link" onClick={() => navigate('/signup')}>
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;
