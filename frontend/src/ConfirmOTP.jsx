import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './ConfirmOTP.css';

function ConfirmOTP() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds

  const inputRefs = useRef([]);

  useEffect(() => {
    // If no email is provided in state, redirect to signup
    if (!email) {
      navigate('/signup');
    }
  }, [email, navigate]);

  useEffect(() => {
    // Timer countdown
    if (timeLeft <= 0) return;
    const timerId = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timerId);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleOtpChange = (index, value) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value !== '' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6).split('');
    if (pastedData.some(char => !/^\d$/.test(char))) return; // must all be numbers

    const newOtp = [...otp];
    pastedData.forEach((char, i) => {
      if (i < 6) newOtp[i] = char;
    });
    setOtp(newOtp);

    // Focus the next empty input, or the last one
    const focusIndex = pastedData.length < 6 ? pastedData.length : 5;
    inputRefs.current[focusIndex]?.focus();
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');

    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter all 6 digits of the OTP.');
      return;
    }

    if (timeLeft <= 0) {
      setError('OTP has expired. Please sign up again.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8890'}/signup/verifyOTP`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpString }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Verification failed. Invalid OTP.');
        setLoading(false);
        return;
      }

      // Success, go to login
      navigate('/login');
    } catch {
      setError('Cannot connect to server. Make sure the backend is running.');
      setLoading(false);
    }
  };

  return (
    <div className="login-shell">
      <div className="login-bg">
        <div className="blob otp-blob-1" />
        <div className="blob otp-blob-2" />
      </div>

      <div className="login-card">
        <div className="login-brand">
          <img src={`${import.meta.env.VITE_API_URL || 'http://localhost:8890'}/logo.jpg`} alt="Omixelo Logo" className="brand-logo-img" />
          <h1 className="login-title">Verify your email</h1>
          <p className="login-subtitle">
            We sent a 6-digit verification code to<br />
            <strong className="login-email">{email}</strong>
          </p>
        </div>

        {error && (
          <div className="login-error" role="alert">
            <span className="error-icon">⚠</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleVerify} className="login-form">
          <div className="login-inputs" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                ref={(el) => (inputRefs.current[index] = el)}
                className="login-input-box"
                autoFocus={index === 0}
              />
            ))}
          </div>

          <div className="login-timer-wrap">
            <span className="login-timer-icon">⏱</span>
            <span className={`otp-timer ${timeLeft < 60 ? 'otp-timer-danger' : ''}`}>
              {formatTime(timeLeft)}
            </span>
          </div>

          <button
            type="submit"
            className={`otp-btn ${loading ? 'loading' : ''}`}
            disabled={loading || timeLeft <= 0 || otp.join('').length < 6}
          >
            {loading ? (
              <><span className="spinner" /> Verifying...</>
            ) : (
              <>Verify Account <span className="btn-arrow">→</span></>
            )}
          </button>
        </form>

        <p className="login-footer">
          Didn't receive the email?{' '}
          <button type="button" className="login-switch-link" onClick={() => navigate('/signup')}>
            Try again
          </button>
        </p>
      </div>
    </div>
  );
}

export default ConfirmOTP;
