// Sidebar.jsx — Premium vertical navigation sidebar
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
  {
    label: 'Dashboard',
    path: '/',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
  },
  {
    label: 'Products',
    path: '/products',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
        <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
      </svg>
    ),
  },
  {
    label: 'Sales',
    path: '/sales',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="16"/><polyline points="2 20 22 20"/>
      </svg>
    ),
  },
];

const BOTTOM_ITEMS = [
  {
    label: 'Login',
    path: '/login',
    authShow: false,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
        <polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>
      </svg>
    ),
  },
  {
    label: 'Register',
    path: '/register',
    authShow: false,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>
      </svg>
    ),
  },
];

function Sidebar({ isAuthenticated, user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [hovered, setHovered] = useState(null);

  const displayName = user
    ? (user.sub || user.email || user.username || 'User')
    : 'Guest';
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <aside
      style={{
        width: 'var(--sidebar-width)',
        minWidth: 'var(--sidebar-width)',
        height: '100vh',
        position: 'sticky',
        top: 0,
        background: 'var(--sidebar-bg)',
        borderRight: '1px solid var(--sidebar-border)',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 14px',
        animation: 'slideInSidebar 0.45s var(--ease) both',
        boxShadow: '2px 0 20px rgba(108,99,255,0.06)',
        zIndex: 100,
        overflowY: 'auto',
      }}
    >
      {/* ---- Logo / Brand ---- */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 6px', marginBottom: 32 }}>
        <div
          className="float"
          style={{
            width: 38, height: 38,
            borderRadius: 12,
            background: 'var(--grad-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 6px 18px rgba(108,99,255,0.4)',
            flexShrink: 0,
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
          </svg>
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: 1.2 }}>
            SmartStock
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            Inventory System
          </div>
        </div>
      </div>

      {/* ---- Main Nav ---- */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
        <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '0 6px', marginBottom: 8 }}>
          Main Menu
        </div>
        {NAV_ITEMS.map((item, i) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              onMouseEnter={() => setHovered(item.path)}
              onMouseLeave={() => setHovered(null)}
              className={`nav-item fade-slide-in delay-${i + 1} ${isActive ? 'active' : ''}`}
              style={{
                border: 'none',
                background: isActive
                  ? 'var(--grad-primary)'
                  : hovered === item.path
                  ? 'var(--primary-light)'
                  : 'transparent',
                color: isActive ? '#fff' : hovered === item.path ? 'var(--primary)' : 'var(--text-secondary)',
                cursor: 'pointer',
                width: '100%',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '11px 14px',
                borderRadius: 12,
                fontFamily: 'var(--font)',
                fontWeight: 500,
                fontSize: '0.875rem',
                transition: 'all 0.25s var(--ease)',
                transform: isActive ? 'none' : hovered === item.path ? 'translateX(3px)' : 'none',
                boxShadow: isActive ? '0 6px 20px rgba(108,99,255,0.35)' : 'none',
              }}
            >
              <span style={{ opacity: isActive ? 1 : 0.8, transition: 'opacity 0.2s' }}>
                {item.icon}
              </span>
              {item.label}
              {isActive && (
                <span style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,0.7)' }} />
              )}
            </button>
          );
        })}

        {/* ---- Auth links (when not logged in) ---- */}
        {!isAuthenticated && (
          <>
            <div style={{ height: 1, background: 'var(--border)', margin: '12px 6px' }} />
            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '0 6px', marginBottom: 8 }}>
              Account
            </div>
            {BOTTOM_ITEMS.map((item, i) => {
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  onMouseEnter={() => setHovered(item.path)}
                  onMouseLeave={() => setHovered(null)}
                  style={{
                    border: 'none',
                    background: isActive ? 'var(--grad-primary)' : hovered === item.path ? 'var(--primary-light)' : 'transparent',
                    color: isActive ? '#fff' : hovered === item.path ? 'var(--primary)' : 'var(--text-secondary)',
                    cursor: 'pointer', width: '100%', textAlign: 'left',
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '11px 14px', borderRadius: 12,
                    fontFamily: 'var(--font)', fontWeight: 500, fontSize: '0.875rem',
                    transition: 'all 0.25s var(--ease)',
                    boxShadow: isActive ? '0 6px 20px rgba(108,99,255,0.35)' : 'none',
                  }}
                >
                  {item.icon}
                  {item.label}
                </button>
              );
            })}
          </>
        )}
      </nav>

      {/* ---- Bottom: User Profile / Logout ---- */}
      {isAuthenticated && (
        <div style={{ marginTop: 'auto' }}>
          <div style={{ height: 1, background: 'var(--border)', marginBottom: 16 }} />
          {/* User card */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '12px 14px', borderRadius: 12,
            background: 'var(--primary-light)',
            marginBottom: 8,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'var(--grad-primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 700, fontSize: '0.85rem',
              flexShrink: 0, boxShadow: '0 4px 12px rgba(108,99,255,0.3)',
            }}>
              {initials}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {displayName}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                {user?.role || 'staff'}
              </div>
            </div>
          </div>
          {/* Logout button */}
          <button
            onClick={onLogout}
            onMouseEnter={() => setHovered('logout')}
            onMouseLeave={() => setHovered(null)}
            style={{
              border: 'none', cursor: 'pointer', width: '100%',
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 14px', borderRadius: 12,
              fontFamily: 'var(--font)', fontWeight: 500, fontSize: '0.875rem',
              background: hovered === 'logout' ? 'rgba(252, 92, 101, 0.1)' : 'transparent',
              color: hovered === 'logout' ? '#fc5c65' : 'var(--text-secondary)',
              transition: 'all 0.25s var(--ease)',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Logout
          </button>
        </div>
      )}
    </aside>
  );
}

export default Sidebar;
