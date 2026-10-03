import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './Signup.css';

// Google SVG icon
const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 48 48">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>
);

// Password strength calculator
function getPasswordStrength(password) {
  if (!password) return { score: 0, label: '' };
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score: 1, label: 'Weak' };
  if (score <= 2) return { score: 2, label: 'Fair' };
  if (score <= 3) return { score: 3, label: 'Good' };
  return { score: 4, label: 'Strong' };
}

const strengthClasses = ['', 'weak', 'fair', 'good', 'strong'];

function Signup() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Username availability
  const [usernameStatus, setUsernameStatus] = useState('idle'); // idle | checking | available | taken | error
  const [usernameMessage, setUsernameMessage] = useState('');
  const debounceRef = useRef(null);

  // Live username availability check with debounce
  const checkUsername = useCallback(async (value) => {
    if (!value || value.length < 3) {
      setUsernameStatus('idle');
      setUsernameMessage('');
      return;
    }

    setUsernameStatus('checking');
    setUsernameMessage('');

    try {
      const res = await fetch(`${import.meta.env.PROD ? '' : 'http://localhost:8890'}/seeuser/check-username?username=${encodeURIComponent(value)}`);
      const data = await res.json();

      if (data.available) {
        setUsernameStatus('available');
        setUsernameMessage('Username is available!');
      } else {
        setUsernameStatus('taken');
        setUsernameMessage('Username is already taken');
      }
    } catch {
      setUsernameStatus('error');
      setUsernameMessage('Could not check availability');
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!username || username.length < 3) {
      setUsernameStatus('idle');
      setUsernameMessage('');
      return;
    }

    debounceRef.current = setTimeout(() => {
      checkUsername(username);
    }, 500); // 500ms debounce

    return () => clearTimeout(debounceRef.current);
  }, [username, checkUsername]);

  // Form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !username || !password) {
      setError('Please fill in all fields.');
      return;
    }

    if (username.length < 3) {
      setError('Username must be at least 3 characters.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (usernameStatus === 'taken') {
      setError('Please choose a different username.');
      return;
    }

    setLoading(true);

    try {
      // 1. Temporarily save user data in Redis
      const signupRes = await fetch(`${import.meta.env.PROD ? '' : 'http://localhost:8890'}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, sid: username, password }),
      });

      const signupData = await signupRes.json();

      if (!signupRes.ok) {
        setError(signupData.message || 'Signup failed. Please try again.');
        setLoading(false);
        return;
      }

      // 2. Request OTP to be sent to the email
      const otpRes = await fetch(`${import.meta.env.PROD ? '' : 'http://localhost:8890'}/otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const otpData = await otpRes.json();

      if (!otpRes.ok) {
        setError(otpData.message || 'Failed to send OTP email.');
        setLoading(false);
        return;
      }

      // 3. Navigate to OTP confirmation page, passing the email in state
      navigate('/confirmotp', { state: { email } });
    } catch {
      setError('Cannot connect to server. Make sure the backend is running.');
    }

    setLoading(false);
  };

  const handleGoogleSignup = () => {
    window.location.href = `${import.meta.env.PROD ? '' : 'http://localhost:8890'}/auth/google`;
  };

  const passwordStrength = getPasswordStrength(password);

  // Determine input wrap class for username
  const usernameWrapClass = [
    'input-wrap',
    'username-status-wrap',
    usernameStatus === 'available' ? 'username-available' : '',
    usernameStatus === 'taken' ? 'username-taken' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className="login-shell">
      {/* Animated background blobs */}
      <div className="login-bg">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
      </div>

      <div className="login-card">
        {/* Brand / Logo */}
        <div className="login-brand">
          <img src={`${import.meta.env.PROD ? '' : 'http://localhost:8890'}/logo.jpg`} alt="Omixelo Logo" className="brand-logo-img" />
          <div>
            <h1 className="login-title">Create account</h1>
            <p className="login-subtitle">Join us and start your journey</p>
          </div>
        </div>

        {/* Error Notice */}
        {error && (
          <div className="login-error" role="alert">
            <span className="error-icon">⚠</span>
            <span>{error}</span>
          </div>
        )}

        {/* Google Sign Up */}
        <button
          id="login-google-btn"
          type="button"
          className="google-btn"
          onClick={handleGoogleSignup}
        >
          <GoogleIcon />
          Continue with Google
        </button>

        <div className="divider">
          <span>or sign up with email</span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="login-form" noValidate>
          {/* Email */}
          <div className="login-field">
            <label htmlFor="login-email">Email</label>
            <div className="input-wrap">
              <span className="input-icon">✉️</span>
              <input
                id="login-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                autoFocus
              />
            </div>
          </div>

          {/* Username with live check */}
          <div className="login-field">
            <label htmlFor="login-username">Username</label>
            <div className={usernameWrapClass}>
              <span className="input-icon">👤</span>
              <input
                id="login-username"
                type="text"
                placeholder="Pick a unique username"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                required
                autoComplete="username"
                minLength={3}
              />
              {/* Status indicator */}
              <div className="username-status-indicator">
                {usernameStatus === 'checking' && (
                  <span className="username-spinner" />
                )}
                {usernameStatus === 'available' && (
                  <span className="username-check available">✓</span>
                )}
                {usernameStatus === 'taken' && (
                  <span className="username-check taken">✗</span>
                )}
              </div>
            </div>
            {/* Hint text */}
            {usernameMessage && (
              <span className={`username-hint ${usernameStatus}`}>
                {usernameMessage}
              </span>
            )}
          </div>

          {/* Password */}
          <div className="login-field">
            <label htmlFor="login-password">Password</label>
            <div className="input-wrap">
              <span className="input-icon">🔒</span>
              <input
                id="login-password"
                type={showPass ? 'text' : 'password'}
                placeholder="Min. 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                minLength={6}
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
            {/* Password strength indicator */}
            {password && (
              <>
                <div className="password-strength">
                  {[1, 2, 3, 4].map((seg) => (
                    <div
                      key={seg}
                      className={`strength-segment ${
                        passwordStrength.score >= seg
                          ? `active ${strengthClasses[passwordStrength.score]}`
                          : ''
                      }`}
                    />
                  ))}
                </div>
                <span className={`password-strength-label ${strengthClasses[passwordStrength.score]}`}>
                  {passwordStrength.label}
                </span>
              </>
            )}
          </div>

          {/* Submit */}
          <button
            id="login-submit-btn"
            type="submit"
            className={`login-btn ${loading ? 'loading' : ''}`}
            disabled={loading || usernameStatus === 'taken'}
          >
            {loading ? (
              <>
                <span className="spinner" />
                Creating account...
              </>
            ) : (
              <>
                Create Account
                <span className="btn-arrow">→</span>
              </>
            )}
          </button>
        </form>

        {/* Footer / Switch to Login */}
        <p className="login-footer">
          Already have an account?{' '}
          <button type="button" className="login-switch-link" onClick={() => navigate('/login')}>
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}

export default Signup;
