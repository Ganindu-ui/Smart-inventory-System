// Sales.jsx — Professional sales management (no emojis)
import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

// ── SVG Icons ──────────────────────────────────────────────────
const IconSearch    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IconPlus      = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IconTrash     = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>;
const IconX         = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IconAlert     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
const IconCheck     = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IconTrendUp   = () => <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"/></svg>;
const IconCalendar  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IconDollar    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;
const IconCart      = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>;
const IconTrophy    = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="8 21 12 17 16 21"/><line x1="12" y1="17" x2="12" y2="11"/><path d="M7 4V2H17V4"/><path d="M7 4C7 7.866 9.239 11 12 11C14.761 11 17 7.866 17 4"/><path d="M3 4H7"/><path d="M17 4H21"/></svg>;

// ── Input / Select field ───────────────────────────────────────
function Field({ label, type = 'text', value, onChange, disabled, placeholder, children }) {
  const [focused, setFocused] = useState(false);
  const base = {
    width: '100%', padding: '11px 14px',
    border: `1.5px solid ${focused ? 'var(--primary)' : 'var(--border)'}`,
    borderRadius: 10, outline: 'none', fontFamily: 'var(--font)', fontSize: '0.88rem',
    color: 'var(--text-primary)', background: '#fff', transition: 'border-color 0.2s, box-shadow 0.2s',
    boxShadow: focused ? '0 0 0 3px rgba(108,99,255,0.1)' : 'none',
  };
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: focused ? 'var(--primary)' : 'var(--text-secondary)', marginBottom: 5, fontFamily: 'var(--font)', transition: 'color 0.2s' }}>
        {label}
      </label>
      {children
        ? <select value={value} onChange={onChange} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} disabled={disabled} style={{ ...base, cursor: 'pointer' }}>{children}</select>
        : <input type={type} value={value} onChange={onChange} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} disabled={disabled} placeholder={placeholder} style={base} />
      }
    </div>
  );
}

// ── Stat card ─────────────────────────────────────────────────
function StatCard({ label, value, prefix = '', icon, iconBg, iconColor, gradient, delay }) {
  return (
    <div className="fade-slide-up" style={{ animationDelay: delay, background: '#fff', borderRadius: 16, padding: '18px 20px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)', transition: 'transform 0.25s, box-shadow 0.25s', cursor: 'default', position: 'relative', overflow: 'hidden' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = 'var(--shadow-card)'; }}
    >
      <div style={{ position: 'absolute', top: -14, right: -14, width: 72, height: 72, borderRadius: '50%', background: gradient, opacity: 0.09 }} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
        <div style={{ width: 30, height: 30, borderRadius: 9, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: iconColor }}>{icon}</div>
      </div>
      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
        {prefix}{typeof value === 'number' ? value.toLocaleString('en', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : value}
      </div>
    </div>
  );
}

// ── Chart tooltip ─────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 10, padding: '8px 14px', boxShadow: '0 6px 20px rgba(0,0,0,0.1)', fontFamily: 'var(--font)' }}>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 3 }}>{label}</div>
        <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '0.92rem' }}>Rs. {Number(payload[0].value).toFixed(2)}</div>
      </div>
    );
  }
  return null;
};

const COLORS = ['#6c63ff', '#8b5cf6', '#f093fb', '#f5576c', '#4facfe', '#43e97b', '#f7b731'];

// ═══════════════════════════════════════════════════════════
export default function Sales({ token }) {
  const [sales, setSales]         = useState([]);
  const [products, setProducts]   = useState([]);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');
  const [open, setOpen]           = useState(false);
  const [search, setSearch]       = useState('');
  const [form, setForm]           = useState({ product_id: '', quantity: '', total_price: '' });
  const [analytics, setAnalytics] = useState({ daily_revenue: 0, monthly_revenue: 0, top_selling_product: null, daily_sales_chart: [] });

  const autoHide = setter => setTimeout(() => setter(''), 3500);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sRes, pRes, aRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/sales/`),
        axios.get(`${API_BASE_URL}/products/`),
        axios.get(`${API_BASE_URL}/sales/analytics`),
      ]);
      setSales(sRes.data);
      setProducts(pRes.data);
      setAnalytics(aRes.data);
    } catch { setError('Failed to load sales data'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async () => {
    if (!form.product_id || !form.quantity || !form.total_price) { setError('Please fill in all fields'); return; }
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/sales/`, {
        product_id: parseInt(form.product_id),
        quantity: parseInt(form.quantity),
        total_price: parseFloat(form.total_price),
      });
      setOpen(false);
      setForm({ product_id: '', quantity: '', total_price: '' });
      setSuccess('Sale recorded successfully'); autoHide(setSuccess);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to record sale'); autoHide(setError);
    } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this sale record?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/sales/${id}`);
      setSales(sales.filter(s => s.id !== id));
      setSuccess('Sale deleted'); autoHide(setSuccess);
      fetchData();
    } catch { setError('Failed to delete sale'); autoHide(setError); }
  };

  // ── Derived stats ──────────────────────────────────────────
  const today      = new Date(); today.setHours(0,0,0,0);
  const weekAgo    = new Date(today.getTime() - 7 * 86400000);
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  const todaySales  = sales.filter(s => new Date(s.sale_date) >= today).reduce((sum, x) => sum + x.total_price, 0);
  const weekSales   = sales.filter(s => new Date(s.sale_date) >= weekAgo).reduce((sum, x) => sum + x.total_price, 0);
  const monthSales  = sales.filter(s => new Date(s.sale_date) >= monthStart).reduce((sum, x) => sum + x.total_price, 0);

  // ── Build chart from raw sales (last 7 days) ───────────────
  const chartData = analytics.daily_sales_chart?.length > 0
    ? analytics.daily_sales_chart
    : Array.from({ length: 7 }, (_, i) => {
        const d = new Date(today.getTime() - (6 - i) * 86400000);
        const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const rev = sales.filter(s => { const sd = new Date(s.sale_date); sd.setHours(0,0,0,0); return sd.getTime() === d.getTime(); }).reduce((sum, x) => sum + x.total_price, 0);
        return { date: label, revenue: rev };
      });

  const filtered = sales.filter(s => {
    const prod = products.find(p => p.id === s.product_id);
    return (prod?.name || '').toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div style={{ width: '100%', maxWidth: 1100, fontFamily: 'var(--font)' }}>

      {/* ── Header ── */}
      <div className="fade-slide-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14, marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>Sales</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 3, fontSize: '0.83rem' }}>{sales.length} transactions recorded</p>
        </div>
        <button onClick={() => setOpen(true)}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 22px rgba(108,99,255,0.35)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 14px rgba(108,99,255,0.2)'; }}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: 'var(--grad-primary)', border: 'none', borderRadius: 10, color: '#fff', fontFamily: 'var(--font)', fontWeight: 600, fontSize: '0.84rem', cursor: 'pointer', boxShadow: '0 4px 14px rgba(108,99,255,0.2)', transition: 'transform 0.2s, box-shadow 0.2s' }}>
          <IconPlus /> Record Sale
        </button>
      </div>

      {/* ── Alerts ── */}
      {error && <div className="alert-anim" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 16px', background: 'rgba(252,92,101,0.08)', border: '1px solid rgba(252,92,101,0.25)', borderRadius: 10, color: '#c0392b', marginBottom: 16, fontSize: '0.85rem' }}><IconAlert />{error}</div>}
      {success && <div className="alert-anim" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 16px', background: 'rgba(67,233,123,0.1)', border: '1px solid rgba(67,233,123,0.3)', borderRadius: 10, color: '#2eb86e', marginBottom: 16, fontSize: '0.85rem' }}><IconCheck />{success}</div>}

      {/* ── Stat Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14, marginBottom: 24 }}>
        <StatCard label="Today's Revenue" value={todaySales} prefix="Rs. " icon={<IconDollar />} iconBg="rgba(108,99,255,0.12)" iconColor="var(--primary)" gradient="var(--grad-primary)" delay="0s" />
        <StatCard label="This Week" value={weekSales} prefix="Rs. " icon={<IconTrendUp />} iconBg="rgba(240,93,251,0.12)" iconColor="#f05dfb" gradient="var(--grad-pink)" delay="0.06s" />
        <StatCard label="This Month" value={monthSales} prefix="Rs. " icon={<IconCalendar />} iconBg="rgba(79,172,254,0.12)" iconColor="#4facfe" gradient="var(--grad-cyan)" delay="0.12s" />
        <StatCard label="Total Orders" value={sales.length} icon={<IconCart />} iconBg="rgba(247,183,49,0.12)" iconColor="#f7b731" gradient="var(--grad-gold)" delay="0.18s" />
      </div>

      {/* ── Analytics Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 24 }}>
        {/* Daily Revenue */}
        <div className="fade-slide-up" style={{ animationDelay: '0.22s', background: 'var(--grad-primary)', borderRadius: 16, padding: '20px 22px', color: '#fff', position: 'relative', overflow: 'hidden', boxShadow: '0 8px 24px rgba(108,99,255,0.25)', transition: 'transform 0.25s', cursor: 'default' }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
          onMouseLeave={e => e.currentTarget.style.transform = ''}
        >
          <div style={{ position: 'absolute', top: -12, right: -12, width: 70, height: 70, borderRadius: '50%', background: 'rgba(255,255,255,0.12)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, opacity: 0.9 }}><IconDollar /><span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Today's Revenue</span></div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>Rs. {analytics.daily_revenue?.toFixed(0) || '0'}</div>
        </div>
        {/* Monthly Revenue */}
        <div className="fade-slide-up" style={{ animationDelay: '0.28s', background: 'var(--grad-pink)', borderRadius: 16, padding: '20px 22px', color: '#fff', position: 'relative', overflow: 'hidden', boxShadow: '0 8px 24px rgba(240,93,251,0.2)', transition: 'transform 0.25s', cursor: 'default' }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
          onMouseLeave={e => e.currentTarget.style.transform = ''}
        >
          <div style={{ position: 'absolute', top: -12, right: -12, width: 70, height: 70, borderRadius: '50%', background: 'rgba(255,255,255,0.12)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, opacity: 0.9 }}><IconCalendar /><span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Monthly Revenue</span></div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>Rs. {analytics.monthly_revenue?.toFixed(0) || '0'}</div>
        </div>
        {/* Top Product */}
        <div className="fade-slide-up" style={{ animationDelay: '0.34s', background: 'var(--grad-cyan)', borderRadius: 16, padding: '20px 22px', color: '#fff', position: 'relative', overflow: 'hidden', boxShadow: '0 8px 24px rgba(79,172,254,0.2)', transition: 'transform 0.25s', cursor: 'default' }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
          onMouseLeave={e => e.currentTarget.style.transform = ''}
        >
          <div style={{ position: 'absolute', top: -12, right: -12, width: 70, height: 70, borderRadius: '50%', background: 'rgba(255,255,255,0.12)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, opacity: 0.9 }}><IconTrophy /><span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Top Product</span></div>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, lineHeight: 1.3 }}>{analytics.top_selling_product?.name || '—'}</div>
        </div>
      </div>

      {/* ── Revenue Bar Chart ── */}
      {chartData.some(d => d.revenue > 0) && (
        <div className="fade-slide-up" style={{ background: '#fff', borderRadius: 18, padding: '22px 24px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)', marginBottom: 24, animationDelay: '0.38s' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <h2 style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', margin: 0 }}>Revenue — Last 7 Days</h2>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} margin={{ top: 0, right: 8, left: -10, bottom: 0 }} barCategoryGap="28%">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: '#9999bb', fontSize: 11, fontFamily: 'var(--font)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#9999bb', fontSize: 10, fontFamily: 'var(--font)' }} axisLine={false} tickLine={false} tickFormatter={v => `Rs.${v}`} width={52} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(108,99,255,0.06)', radius: 6 }} />
              <Bar dataKey="revenue" radius={[8, 8, 2, 2]} maxBarSize={48}>
                {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── Transaction Table ── */}
      <div className="fade-slide-up" style={{ animationDelay: '0.42s' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
          <h2 style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', margin: 0 }}>Transaction History</h2>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', opacity: 0.35, display: 'flex' }}><IconSearch /></span>
            <input type="text" placeholder="Search by product…" value={search} onChange={e => setSearch(e.target.value)}
              style={{ padding: '8px 14px 8px 32px', borderRadius: 10, border: '1.5px solid var(--border)', outline: 'none', fontFamily: 'var(--font)', fontSize: '0.83rem', color: 'var(--text-primary)', background: '#fff', width: 210, transition: 'border-color 0.2s' }}
              onFocus={e => e.target.style.borderColor = 'var(--primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '56px 20px', background: '#fff', borderRadius: 18, border: '1.5px dashed var(--border)' }}>
            <div style={{ marginBottom: 12, opacity: 0.25 }}>
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/><polyline points="2 20 22 20"/></svg>
            </div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.87rem', fontWeight: 500 }}>{search ? 'No transactions match your search.' : 'No sales recorded yet — click "Record Sale" to begin.'}</div>
          </div>
        ) : (
          <div style={{ background: '#fff', borderRadius: 18, border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)', overflow: 'hidden' }}>
            {/* Table header */}
            <div style={{ display: 'grid', gridTemplateColumns: '48px 2fr 80px 1fr 1fr 90px', borderBottom: '1px solid var(--border)', background: 'rgba(108,99,255,0.03)' }}>
              {['#', 'Product', 'Qty', 'Total', 'Date', ''].map(h => (
                <div key={h} style={{ padding: '12px 16px', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</div>
              ))}
            </div>
            {filtered.map((sale, idx) => {
              const prod = products.find(p => p.id === sale.product_id);
              return (
                <div key={sale.id}
                  style={{ display: 'grid', gridTemplateColumns: '48px 2fr 80px 1fr 1fr 90px', alignItems: 'center', borderBottom: idx < filtered.length - 1 ? '1px solid var(--border)' : 'none', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(108,99,255,0.025)'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}
                >
                  <div style={{ padding: '13px 16px', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{sale.id}</div>
                  <div style={{ padding: '13px 16px', fontWeight: 600, fontSize: '0.86rem', color: 'var(--text-primary)' }}>
                    {prod ? prod.name : <span style={{ color: 'var(--text-muted)' }}>Product #{sale.product_id}</span>}
                  </div>
                  <div style={{ padding: '13px 16px', fontWeight: 600, fontSize: '0.86rem', color: 'var(--text-secondary)' }}>{sale.quantity}</div>
                  <div style={{ padding: '13px 16px', fontWeight: 700, fontSize: '0.87rem', color: 'var(--primary)' }}>Rs. {parseFloat(sale.total_price).toFixed(2)}</div>
                  <div style={{ padding: '13px 16px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {new Date(sale.sale_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                  <div style={{ padding: '13px 16px' }}>
                    <button onClick={() => handleDelete(sale.id)}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(252,92,101,0.1)'; e.currentTarget.style.color = '#fc5c65'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                      style={{ border: '1.5px solid var(--border)', borderRadius: 8, padding: '5px 10px', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font)', fontSize: '0.76rem', fontWeight: 600, transition: 'all 0.2s' }}>
                      <IconTrash /> Delete
                    </button>
                  </div>
                </div>
              );
            })}
            {/* Footer */}
            <div style={{ padding: '11px 16px', borderTop: '1px solid var(--border)', background: 'rgba(108,99,255,0.02)', display: 'flex', gap: 24 }}>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{filtered.length} transactions shown</span>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Total: <strong style={{ color: 'var(--text-primary)' }}>Rs. {filtered.reduce((s, x) => s + x.total_price, 0).toFixed(2)}</strong></span>
            </div>
          </div>
        )}
      </div>

      {/* ── Record Sale Modal ── */}
      {open && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(10,10,30,0.45)', backdropFilter: 'blur(5px)' }}
          onClick={e => e.target === e.currentTarget && setOpen(false)}
        >
          <div className="scale-in" style={{ background: '#fff', borderRadius: 22, padding: 32, width: '100%', maxWidth: 430, boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 22 }}>
              <div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Record New Sale</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: 4 }}>Enter the transaction details</p>
              </div>
              <button onClick={() => setOpen(false)} style={{ border: 'none', background: 'var(--surface-2)', borderRadius: 8, width: 30, height: 30, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}><IconX /></button>
            </div>

            <Field label="Product *" value={form.product_id} onChange={e => setForm({ ...form, product_id: e.target.value })} disabled={loading}>
              <option value="">Select a product…</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name} (Stock: {p.quantity})</option>)}
            </Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Quantity *" type="number" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} disabled={loading} placeholder="1" />
              <Field label="Total Price (Rs.) *" type="number" value={form.total_price} onChange={e => setForm({ ...form, total_price: e.target.value })} disabled={loading} placeholder="0.00" />
            </div>
            {error && <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#c0392b', fontSize: '0.82rem', marginBottom: 10 }}><IconAlert />{error}</div>}

            <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
              <button onClick={() => setOpen(false)} disabled={loading} style={{ flex: 1, padding: '11px', border: '1.5px solid var(--border)', borderRadius: 10, background: 'transparent', color: 'var(--text-secondary)', fontFamily: 'var(--font)', fontWeight: 600, cursor: 'pointer', fontSize: '0.87rem' }}>Cancel</button>
              <button onClick={handleCreate} disabled={loading}
                onMouseEnter={e => !loading && (e.currentTarget.style.transform = 'translateY(-1px)', e.currentTarget.style.boxShadow = '0 8px 20px rgba(108,99,255,0.35)')}
                onMouseLeave={e => (e.currentTarget.style.transform = '', e.currentTarget.style.boxShadow = '0 4px 14px rgba(108,99,255,0.2)')}
                style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '11px', background: loading ? '#a0a0c0' : 'var(--grad-primary)', border: 'none', borderRadius: 10, color: '#fff', fontFamily: 'var(--font)', fontWeight: 600, fontSize: '0.87rem', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 4px 14px rgba(108,99,255,0.2)', transition: 'transform 0.2s, box-shadow 0.2s' }}>
                {loading ? 'Recording…' : <><IconPlus /> Record Sale</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
