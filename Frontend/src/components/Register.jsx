// Register.jsx — Split-screen premium register page (no emojis)
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

function FloatingInput({ label, type = 'text', name, value, onChange, disabled, placeholder }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: focused ? 'var(--primary)' : 'var(--text-secondary)', marginBottom: 6, transition: 'color 0.2s', fontFamily: 'var(--font)' }}>
        {label}
      </label>
      <input
        type={type} name={name} value={value} onChange={onChange}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        disabled={disabled} placeholder={placeholder} required
        style={{
          width: '100%', padding: '12px 16px',
          border: `2px solid ${focused ? 'var(--primary)' : 'var(--border)'}`,
          borderRadius: 12, outline: 'none', fontFamily: 'var(--font)', fontSize: '0.93rem',
          color: 'var(--text-primary)', background: '#fff',
          transition: 'border-color 0.25s, box-shadow 0.25s',
          boxShadow: focused ? '0 0 0 4px rgba(108,99,255,0.12)' : 'none',
        }}
      />
    </div>
  );
}

// Beautiful card-based role selector
function RoleSelector({ value, onChange, disabled }) {
  const roles = [
    {
      id: 'staff',
      label: 'Staff',
      description: 'View products, record sales, browse reports',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      ),
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      glow: 'rgba(79,172,254,0.25)',
      selectedBg: 'rgba(79,172,254,0.08)',
      selectedBorder: '#4facfe',
    },
    {
      id: 'admin',
      label: 'Admin',
      description: 'Full access — manage users, products & settings',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      ),
      gradient: 'linear-gradient(135deg, #6c63ff 0%, #8b5cf6 100%)',
      glow: 'rgba(108,99,255,0.28)',
      selectedBg: 'rgba(108,99,255,0.08)',
      selectedBorder: '#6c63ff',
    },
  ];

  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10, fontFamily: 'var(--font)' }}>
        Account Role
      </label>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {roles.map(role => {
          const isSelected = value === role.id;
          return (
            <button
              key={role.id} type="button"
              onClick={() => !disabled && onChange(role.id)} disabled={disabled}
              style={{
                position: 'relative', padding: '16px 14px',
                border: `2px solid ${isSelected ? role.selectedBorder : 'var(--border)'}`,
                borderRadius: 16, background: isSelected ? role.selectedBg : '#fff',
                cursor: disabled ? 'not-allowed' : 'pointer', textAlign: 'left',
                fontFamily: 'var(--font)', transition: 'all 0.25s var(--ease)',
                boxShadow: isSelected ? `0 6px 24px ${role.glow}` : 'none',
                transform: isSelected ? 'scale(1.02)' : 'scale(1)', overflow: 'hidden',
              }}
              onMouseEnter={e => { if (!isSelected && !disabled) { e.currentTarget.style.borderColor = role.selectedBorder; e.currentTarget.style.background = role.selectedBg; e.currentTarget.style.boxShadow = `0 4px 16px ${role.glow}`; } }}
              onMouseLeave={e => { if (!isSelected) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = '#fff'; e.currentTarget.style.boxShadow = 'none'; } }}
            >
              {isSelected && (
                <div style={{ position: 'absolute', top: 10, right: 10, width: 20, height: 20, borderRadius: '50%', background: role.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 3px 10px ${role.glow}`, animation: 'scaleIn 0.25s var(--ease-bounce)' }}>
                  <CheckIcon />
                </div>
              )}
              <div style={{ width: 44, height: 44, borderRadius: 12, marginBottom: 10, background: isSelected ? role.gradient : 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isSelected ? '#fff' : 'var(--text-muted)', transition: 'all 0.25s', boxShadow: isSelected ? `0 4px 14px ${role.glow}` : 'none' }}>
                {role.icon}
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: isSelected ? role.selectedBorder : 'var(--text-primary)', marginBottom: 4, transition: 'color 0.2s' }}>
                {role.label}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: 1.5, fontWeight: 400 }}>
                {role.description}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'staff' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleRoleChange = (role) => setForm({ ...form, role });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    try {
      await axios.post('http://localhost:8000/users/register', form);
      setSuccess('Account created! Redirecting to login...');
      setForm({ username: '', email: '', password: '', role: 'staff' });
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    'Real-time inventory tracking',
    'Sales analytics dashboard',
    'Role-based access control',
    'Product management tools',
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%', fontFamily: 'var(--font)' }}>
      {/* Left — branded */}
      <div style={{ flex: 1, background: 'var(--grad-pink)', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 60, overflow: 'hidden' }}>
        <div className="blob-1" style={{ position: 'absolute', top: -60, right: -80, background: 'rgba(255,255,255,0.08)' }} />
        <div className="blob-2" style={{ position: 'absolute', bottom: -40, left: -60, background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', color: '#fff' }}>
          <div className="float" style={{ width: 80, height: 80, borderRadius: 24, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.3)' }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="8.5" cy="7" r="4"/>
              <line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>
            </svg>
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 14 }}>Join SmartStock</h1>
          <p style={{ opacity: 0.85, fontSize: '1rem', lineHeight: 1.7, maxWidth: 280, margin: '0 auto' }}>
            Create your account and start managing your inventory with powerful tools.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 36, maxWidth: 260, margin: '36px auto 0' }}>
            {features.map(item => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.15)', fontSize: '0.82rem', fontWeight: 500, backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,0.2)', textAlign: 'left' }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <CheckIcon />
                </div>
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — form */}
      <div style={{ width: '500px', minWidth: '380px', background: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 52px', animation: 'slideInRight 0.5s var(--ease) both', overflowY: 'auto' }}>
        <div style={{ width: '100%', maxWidth: 380 }}>
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8, letterSpacing: '-0.02em' }}>Create account</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Fill in the details below to get started</p>
          </div>

          {error && (
            <div className="alert-anim" style={{ padding: '12px 16px', background: 'rgba(252,92,101,0.1)', border: '1px solid rgba(252,92,101,0.3)', borderRadius: 10, color: '#c0392b', marginBottom: 20, fontSize: '0.87rem', display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {error}
            </div>
          )}
          {success && (
            <div className="alert-anim" style={{ padding: '12px 16px', background: 'rgba(67,233,123,0.12)', border: '1px solid rgba(67,233,123,0.35)', borderRadius: 10, color: '#2eb86e', marginBottom: 20, fontSize: '0.87rem', display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <FloatingInput label="Username" name="username" value={form.username} onChange={handleChange} disabled={loading} placeholder="Choose a username" />
            <FloatingInput label="Email Address" type="email" name="email" value={form.email} onChange={handleChange} disabled={loading} placeholder="you@example.com" />
            <FloatingInput label="Password" type="password" name="password" value={form.password} onChange={handleChange} disabled={loading} placeholder="Create a strong password" />
            <RoleSelector value={form.role} onChange={handleRoleChange} disabled={loading} />

            <button
              type="submit" disabled={loading}
              onMouseEnter={e => !loading && (e.currentTarget.style.transform = 'translateY(-2px)', e.currentTarget.style.boxShadow = '0 10px 30px rgba(240,93,251,0.4)')}
              onMouseLeave={e => (e.currentTarget.style.transform = '', e.currentTarget.style.boxShadow = '0 6px 20px rgba(240,93,251,0.2)')}
              style={{ width: '100%', padding: '14px', marginTop: 4, background: loading ? '#a0a0c0' : 'var(--grad-pink)', border: 'none', borderRadius: 12, color: '#fff', fontFamily: 'var(--font)', fontWeight: 700, fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 6px 20px rgba(240,93,251,0.2)', transition: 'transform 0.25s, box-shadow 0.25s' }}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
            Already have an account?{' '}
            <a href="/login" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>Sign in</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
