import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AddCourses from './addCourses';
import Login from './Login';
import Signup from './Signup';
import ConfirmOTP from './ConfirmOTP';

// Helper: read a cookie by name
function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
}

// Helper: delete a cookie
function deleteCookie(name) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict`;
}

// Wrap protected routes — redirects to /login if no token
function ProtectedRoute({ token, children }) {
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

// Wrap auth routes — redirects to /allcourses if already logged in
function AuthRoute({ token, children }) {
  if (token) return <Navigate to="/allcourses" replace />;
  return children;
}

function App() {
  const [token, setToken] = useState(() => getCookie('auth_token'));

  // Called whenever the backend returns 401/403
  const handleAuthError = useCallback(() => {
    deleteCookie('auth_token');
    setToken(null);
  }, []);

  // Periodically check if the cookie still exists
  useEffect(() => {
    if (!token) return;
    const interval = setInterval(() => {
      const current = getCookie('auth_token');
      if (!current) setToken(null);
    }, 30_000);
    return () => clearInterval(interval);
  }, [token]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth pages */}
        <Route
          path="/login"
          element={
            <AuthRoute token={token}>
              <Login onLogin={(t) => setToken(t)} />
            </AuthRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <AuthRoute token={token}>
              <Signup />
            </AuthRoute>
          }
        />
        <Route
          path="/confirmotp"
          element={
            <AuthRoute token={token}>
              <ConfirmOTP />
            </AuthRoute>
          }
        />

        {/* Protected course pages — all share the same layout shell */}
        <Route
          path="/allcourses"
          element={
            <ProtectedRoute token={token}>
              <AddCourses onAuthError={handleAuthError} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/allcourses/add"
          element={
            <ProtectedRoute token={token}>
              <AddCourses onAuthError={handleAuthError} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mycourses"
          element={
            <ProtectedRoute token={token}>
              <AddCourses onAuthError={handleAuthError} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/enroll/:id"
          element={
            <ProtectedRoute token={token}>
              <AddCourses onAuthError={handleAuthError} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/enrolled-course/:id"
          element={
            <ProtectedRoute token={token}>
              <AddCourses onAuthError={handleAuthError} />
            </ProtectedRoute>
          }
        />

        {/* Root redirect */}
        <Route
          path="/"
          element={<Navigate to={token ? '/allcourses' : '/login'} replace />}
        />

        {/* Catch-all */}
        <Route
          path="*"
          element={<Navigate to={token ? '/allcourses' : '/login'} replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
