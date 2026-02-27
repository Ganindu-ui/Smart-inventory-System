// Dashboard.jsx — Premium animated dashboard
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

// Animated counter hook
function useCounter(target, duration = 1200) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target === 0) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

function StatCard({ icon, label, value, prefix = '', suffix = '', gradient, delay, trend }) {
  const animated = useCounter(parseFloat(value) || 0);
  return (
    <div
      className="fade-slide-up"
      style={{
        animationDelay: delay,
        background: '#fff',
        borderRadius: 20,
        padding: '24px',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-card)',
        transition: 'transform 0.3s var(--ease), box-shadow 0.3s var(--ease)',
        cursor: 'default',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = 'var(--shadow-card)'; }}
    >
      {/* Decorative circle */}
      <div style={{
        position: 'absolute', top: -20, right: -20, width: 100, height: 100,
        borderRadius: '50%', background: gradient, opacity: 0.1,
      }} />
      {/* Icon */}
      <div style={{
        width: 48, height: 48, borderRadius: 14,
        background: gradient,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 16, boxShadow: '0 6px 18px rgba(0,0,0,0.15)',
        fontSize: '1.3rem',
      }}>
        {icon}
      </div>
      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.03em', marginBottom: 6, textTransform: 'uppercase' }}>
        {label}
      </div>
      <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>
        {prefix}{typeof value === 'number' ? animated.toLocaleString() : value}{suffix}
      </div>
      {trend && (
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          marginTop: 10, padding: '3px 10px', borderRadius: 99,
          background: 'rgba(67, 233, 123, 0.12)', color: '#2eb86e',
          fontSize: '0.75rem', fontWeight: 600,
        }}>
          ↑ {trend}
        </div>
      )}
    </div>
  );
}

function Dashboard({ user }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalProducts: 0, totalQuantity: 0, totalSales: 0, salesAmount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const now = new Date();
  const timeStr = now.toLocaleString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const [productsRes, salesRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/products/`),
          axios.get(`${API_BASE_URL}/sales/`),
        ]);
        const products = productsRes.data;
        const sales = salesRes.data;
        setStats({
          totalProducts: products.length,
          totalQuantity: products.reduce((sum, p) => sum + p.quantity, 0),
          totalSales: sales.length,
          salesAmount: sales.reduce((sum, s) => sum + s.total_price, 0),
        });
      } catch (err) {
        setError('Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const displayName = user ? (user.sub || user.email || user.username || 'there') : 'there';

  const cards = [
    {
      icon: '📦', label: 'Total Products', value: stats.totalProducts,
      gradient: 'var(--grad-primary)', trend: null,
    },
    {
      icon: '🗃️', label: 'Inventory Units', value: stats.totalQuantity,
      gradient: 'var(--grad-pink)', trend: 'In Stock',
    },
    {
      icon: '🛒', label: 'Total Orders', value: stats.totalSales,
      gradient: 'var(--grad-cyan)', trend: null,
    },
    {
      icon: '💰', label: 'Total Revenue', value: stats.salesAmount, prefix: 'Rs. ',
      gradient: 'var(--grad-gold)', trend: '+ Revenue',
    },
  ];

  return (
    <div style={{ width: '100%', maxWidth: 1100 }}>
      {/* Header */}
      <div className="fade-slide-up" style={{ marginBottom: 36 }}>
        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 4 }}>{timeStr}</div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
          Hi, <span style={{ background: 'var(--grad-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{displayName}</span>! 👋
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: 6, fontSize: '0.95rem' }}>
          Welcome back to SmartStock — here's your inventory overview.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="alert-anim" style={{
          padding: '12px 18px', background: 'rgba(252,92,101,0.1)',
          border: '1px solid rgba(252,92,101,0.3)', borderRadius: 12,
          color: '#c0392b', marginBottom: 24, fontSize: '0.9rem',
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Stat Cards */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20, marginBottom: 36 }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{ height: 160, borderRadius: 20, background: 'var(--surface-2)', animation: 'pulse 1.5s ease-in-out infinite', animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20, marginBottom: 36 }}>
          {cards.map((card, i) => (
            <StatCard
              key={card.label}
              {...card}
              delay={`${i * 0.08}s`}
            />
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div className="fade-slide-up" style={{ animationDelay: '0.35s' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>
          Quick Actions
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {[
            {
              label: 'Manage Products', desc: 'Add, view, and remove inventory items', path: '/products',
              gradient: 'var(--grad-primary)', icon: '📦',
            },
            {
              label: 'View Sales', desc: 'Analyze revenue, track transactions', path: '/sales',
              gradient: 'var(--grad-pink)', icon: '💹',
            },
          ].map((action) => (
            <button
              key={action.path}
              onClick={() => navigate(action.path)}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = 'var(--shadow-card)'; }}
              style={{
                border: 'none', cursor: 'pointer',
                background: '#fff', borderRadius: 18,
                padding: '22px 24px',
                display: 'flex', alignItems: 'center', gap: 18,
                boxShadow: 'var(--shadow-card)',
                transition: 'transform 0.3s var(--ease), box-shadow 0.3s var(--ease)',
                textAlign: 'left', fontFamily: 'var(--font)',
              }}
            >
              <div style={{
                width: 52, height: 52, borderRadius: 16,
                background: action.gradient, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.5rem', boxShadow: '0 6px 16px rgba(0,0,0,0.12)',
              }}>
                {action.icon}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: 4 }}>
                  {action.label}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {action.desc}
                </div>
              </div>
              <div style={{ marginLeft: 'auto', color: 'var(--text-muted)' }}>→</div>
            </button>
          ))}
        </div>
      </div>

      {/* Getting Started Banner */}
      {!user && (
        <div className="fade-slide-up" style={{
          animationDelay: '0.5s', marginTop: 24,
          borderRadius: 20, padding: '28px 32px',
          background: 'var(--grad-primary)',
          boxShadow: '0 12px 40px rgba(108,99,255,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 16,
        }}>
          <div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', marginBottom: 4 }}>
              🚀 Get Started
            </div>
            <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)' }}>
              Log in or create an account to manage products and sales.
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => navigate('/login')} style={{
              border: '2px solid rgba(255,255,255,0.8)', borderRadius: 12, padding: '10px 24px',
              background: 'transparent', color: '#fff', fontFamily: 'var(--font)',
              fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.25s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >Login</button>
            <button onClick={() => navigate('/register')} style={{
              border: 'none', borderRadius: 12, padding: '10px 24px',
              background: '#fff', color: 'var(--primary)', fontFamily: 'var(--font)',
              fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.25s',
              boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
            onMouseLeave={e => e.currentTarget.style.transform = ''}
            >Register</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
