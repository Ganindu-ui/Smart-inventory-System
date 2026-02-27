// App.jsx — Main layout with sidebar + content area
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './index.css';
import './App.css';

import Sidebar from './components/Sidebar';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Products from './components/Products';
import Sales from './components/Sales';

function parseJwt(token) {
  if (!token) return null;
  try { return JSON.parse(atob(token.split('.')[1])); } catch { return null; }
}

// If stored token is old (no username), clear it so user gets fresh token on next login
(function clearOldToken() {
  const tok = localStorage.getItem('token');
  if (tok) {
    const parsed = parseJwt(tok);
    if (parsed && !parsed.username) {
      localStorage.removeItem('token');
    }
  }
})();


// Inner layout component — needs Router context for useLocation
function AppLayout({ token, user, handleLogin, handleLogout }) {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%', background: 'var(--bg)' }}>
      {/* Sidebar — hidden on auth pages */}
      {!isAuthPage && (
        <Sidebar isAuthenticated={!!token} user={user} onLogout={handleLogout} />
      )}

      {/* Main content area */}
      <main
        style={{
          flex: 1,
          minWidth: 0,
          minHeight: '100vh',
          overflowX: 'hidden',
          overflowY: 'auto',
          background: isAuthPage ? 'transparent' : 'var(--bg)',
          padding: isAuthPage ? 0 : '32px 36px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Routes>
          <Route path="/" element={<Dashboard user={user} />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/products"
            element={token ? <Products token={token} user={user} /> : <Navigate to="/login" />}
          />
          <Route
            path="/sales"
            element={token ? <Sales token={token} user={user} /> : <Navigate to="/login" />}
          />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(() => parseJwt(localStorage.getItem('token')));

  const handleLogin = (tok) => {
    setToken(tok);
    localStorage.setItem('token', tok);
    setUser(parseJwt(tok));
  };

  const handleLogout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <Router>
      <AppLayout
        token={token}
        user={user}
        handleLogin={handleLogin}
        handleLogout={handleLogout}
      />
    </Router>
  );
}

export default App;
