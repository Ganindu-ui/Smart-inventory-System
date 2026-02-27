// Login.jsx — Split-screen premium login page (no emojis)
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const BrandIcon = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
);

function FloatingInput({ label, type = 'text', value, onChange, disabled, placeholder }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: focused ? 'var(--primary)' : 'var(--text-secondary)', marginBottom: 7, transition: 'color 0.2s', fontFamily: 'var(--font)' }}>
        {label}
      </label>
      <input
        type={type} value={value} onChange={onChange}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        disabled={disabled} placeholder={placeholder} required
        style={{
          width: '100%', padding: '13px 18px',
          border: `2px solid ${focused ? 'var(--primary)' : 'var(--border)'}`,
          borderRadius: 12, outline: 'none',
          fontFamily: 'var(--font)', fontSize: '0.95rem',
          color: 'var(--text-primary)', background: '#fff',
          transition: 'border-color 0.25s, box-shadow 0.25s',
          boxShadow: focused ? '0 0 0 4px rgba(108,99,255,0.12)' : 'none',
        }}
      />
    </div>
  );
}

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:8000/users/login', { email, password });
      onLogin(res.data.access_token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%', fontFamily: 'var(--font)' }}>
      {/* Left — branded panel */}
      <div style={{ flex: 1, background: 'var(--grad-primary)', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 60, overflow: 'hidden' }}>
        <div className="blob-1" style={{ position: 'absolute', top: -80, left: -80, background: 'rgba(255,255,255,0.08)' }} />
        <div className="blob-2" style={{ position: 'absolute', bottom: -60, right: -60, background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', color: '#fff' }}>
          <div className="float" style={{
            width: 80, height: 80, borderRadius: 24,
            background: 'rgba(255,255,255,0.18)', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 28px', backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.3)',
          }}>
            <BrandIcon />
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 14 }}>SmartStock</h1>
          <p style={{ opacity: 0.85, fontSize: '1rem', lineHeight: 1.7, maxWidth: 280 }}>
            Your all-in-one platform for managing inventory, tracking sales, and growing your business.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 36, flexWrap: 'wrap' }}>
            {['Products', 'Sales', 'Analytics'].map(tag => (
              <span key={tag} style={{ padding: '6px 16px', borderRadius: 99, background: 'rgba(255,255,255,0.18)', fontSize: '0.78rem', fontWeight: 600, backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,0.25)' }}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right — form */}
      <div style={{ width: '460px', minWidth: '360px', background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 52px', animation: 'slideInRight 0.5s var(--ease) both' }}>
        <div style={{ width: '100%', maxWidth: 360 }}>
          <div style={{ marginBottom: 36 }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8, letterSpacing: '-0.02em' }}>
              Welcome back
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Sign in to your SmartStock account
            </p>
          </div>

          {error && (
            <div className="alert-anim" style={{ padding: '12px 16px', background: 'rgba(252,92,101,0.1)', border: '1px solid rgba(252,92,101,0.3)', borderRadius: 10, color: '#c0392b', marginBottom: 20, fontSize: '0.87rem', display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <FloatingInput label="Email Address" type="email" value={email} onChange={e => setEmail(e.target.value)} disabled={loading} placeholder="you@example.com" />
            <FloatingInput label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} disabled={loading} placeholder="••••••••" />
            <button
              type="submit" disabled={loading}
              onMouseEnter={e => !loading && (e.currentTarget.style.transform = 'translateY(-2px)', e.currentTarget.style.boxShadow = '0 10px 30px rgba(108,99,255,0.4)')}
              onMouseLeave={e => (e.currentTarget.style.transform = '', e.currentTarget.style.boxShadow = '0 6px 20px rgba(108,99,255,0.25)')}
              style={{
                width: '100%', padding: '14px',
                background: loading ? '#a0a0c0' : 'var(--grad-primary)',
                border: 'none', borderRadius: 12, color: '#fff',
                fontFamily: 'var(--font)', fontWeight: 700, fontSize: '1rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 6px 20px rgba(108,99,255,0.25)', marginTop: 8,
                transition: 'transform 0.25s, box-shadow 0.25s',
              }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 28, color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            Don't have an account?{' '}
            <a href="/register" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>Create one</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
