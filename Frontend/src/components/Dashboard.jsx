// Dashboard.jsx — Ecomic-style: Overview Performance, Sales Report, Recent Activities, Top Selling Products
import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

// ── Animated counter ────────────────────────────────────────────
function useCounter(target, duration = 1000) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!target) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target]);
  return count;
}

// ── Mini sparkline bar ──────────────────────────────────────────
function MiniBar({ data, color }) {
  const max = Math.max(...data);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 36 }}>
      {data.map((v, i) => (
        <div key={i} style={{
          flex: 1, borderRadius: 3,
          background: i === data.length - 1 ? color : `${color}55`,
          height: `${(v / max) * 100}%`,
          minHeight: 3, transition: 'height 0.4s',
        }} />
      ))}
    </div>
  );
}

// ── Trend badge ─────────────────────────────────────────────────
function TrendBadge({ value, positive = true }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '3px 8px', borderRadius: 99, background: positive ? 'rgba(67,233,123,0.13)' : 'rgba(252,92,101,0.12)', color: positive ? '#2eb86e' : '#fc5c65', fontSize: '0.72rem', fontWeight: 700 }}>
      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        {positive ? <polyline points="18 15 12 9 6 15"/> : <polyline points="6 9 12 15 18 9"/>}
      </svg>
      {value}
    </span>
  );
}

// ── Section header ───────────────────────────────────────────────
function SectionHeader({ title, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
      <h2 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', margin: 0 }}>{title}</h2>
      {action}
    </div>
  );
}

// ── Custom area chart tooltip ────────────────────────────────────
const AreaTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 10, padding: '8px 14px', boxShadow: '0 6px 20px rgba(0,0,0,0.1)', fontFamily: 'var(--font)' }}>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 3 }}>{label}</div>
        <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '0.95rem' }}>Rs. {Number(payload[0].value).toFixed(0)}</div>
      </div>
    );
  }
  return null;
};

// ── Activity dot ─────────────────────────────────────────────────
function ActivityItem({ type, title, sub, time }) {
  const colors = { update: '#4facfe', price: '#f093fb', new: '#43e97b', info: '#f7b731' };
  const icons = {
    update: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>,
    price: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
    new: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    info: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  };
  const c = colors[type] || colors.info;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ width: 32, height: 32, borderRadius: '50%', background: c, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 4px 12px ${c}55` }}>
        {icons[type]}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: '0.83rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 1 }}>{sub}</div>
      </div>
      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', flexShrink: 0 }}>{time}</div>
    </div>
  );
}

// ── Status badge ─────────────────────────────────────────────────
function StatusBadge({ qty }) {
  const label = qty === 0 ? 'Out of Stock' : qty < 10 ? 'Low Stock' : 'In Stock';
  const colors = { 'In Stock': ['rgba(67,233,123,0.12)', '#2eb86e'], 'Low Stock': ['rgba(247,183,49,0.15)', '#e5a000'], 'Out of Stock': ['rgba(252,92,101,0.12)', '#fc5c65'] };
  const [bg, fg] = colors[label];
  return <span style={{ padding: '3px 10px', borderRadius: 99, background: bg, color: fg, fontSize: '0.72rem', fontWeight: 700 }}>{label}</span>;
}

// ═══════════════════════════════════════════════════════════
// DASHBOARD COMPONENT
// ═══════════════════════════════════════════════════════════
export default function Dashboard({ user }) {
  const [products, setProducts] = useState([]);
  const [sales, setSales]       = useState([]);
  const [analytics, setAnalytics] = useState({ daily_revenue: 0, monthly_revenue: 0, top_selling_product: null, daily_sales_chart: [] });
  const [loading, setLoading]   = useState(true);
  const [activityTab, setActivityTab] = useState('today');
  const [productSearch, setProductSearch] = useState('');
  const [chartPeriod, setChartPeriod] = useState('weekly'); // 'weekly' | 'monthly'

  const displayName = user ? (user.username || user.sub || 'there') : 'there';
  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  useEffect(() => {
    (async () => {
      try {
        const [pRes, sRes, aRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/products/`),
          axios.get(`${API_BASE_URL}/sales/`),
          axios.get(`${API_BASE_URL}/sales/analytics`),
        ]);
        setProducts(pRes.data);
        setSales(sRes.data);
        setAnalytics(aRes.data);
      } catch (e) { /* silently handle */ }
      finally { setLoading(false); }
    })();
  }, []);

  // ── Derived metrics ──────────────────────────────────────
  const totalRevenue  = sales.reduce((s, x) => s + x.total_price, 0);
  const totalUnits    = products.reduce((s, p) => s + p.quantity, 0);

  const today     = new Date(); today.setHours(0,0,0,0);
  const weekAgo   = new Date(today.getTime() - 7 * 86400000);
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  const weeklyRev  = sales.filter(s => new Date(s.sale_date) >= weekAgo).reduce((s,x) => s+x.total_price, 0);
  const monthlyRev = sales.filter(s => new Date(s.sale_date) >= monthStart).reduce((s,x) => s+x.total_price, 0);

  // ── Chart data builders ────────────────────────────────
  const baseToday = new Date(); baseToday.setHours(0, 0, 0, 0);

  // Weekly: last 7 individual days, labeled by day abbreviation
  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(baseToday.getTime() - (6 - i) * 86400000);
    const dEnd = new Date(d.getTime()); dEnd.setHours(23, 59, 59, 999);
    const label = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    const rev = sales
      .filter(s => { const sd = new Date(s.sale_date); return sd >= d && sd <= dEnd; })
      .reduce((sum, x) => sum + x.total_price, 0);
    return { date: label, revenue: rev };
  });

  // Monthly: last 30 individual days
  const monthlyData = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(baseToday.getTime() - (29 - i) * 86400000);
    const dEnd = new Date(d.getTime()); dEnd.setHours(23, 59, 59, 999);
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const rev = sales
      .filter(s => { const sd = new Date(s.sale_date); return sd >= d && sd <= dEnd; })
      .reduce((sum, x) => sum + x.total_price, 0);
    return { date: label, revenue: rev };
  });

  // Active chart dataset (weekly default)
  const chartData = chartPeriod === 'monthly' ? monthlyData : weeklyData;

  // Sparklines always use weekly (daily) data
  const spark = weeklyData.map(d => d.revenue || 0);
  const sparkFallback = (seed) => [seed*2, seed*1.5, seed*3, seed*2.5, seed*4, seed*3.5, seed*5].map(Math.floor);

  // ── Activity feed: recent sales as activity ─────────────
  const saltToday     = sales.filter(s => new Date(s.sale_date) >= today);
  const saltYesterday = sales.filter(s => { const d = new Date(s.sale_date); return d >= new Date(today.getTime()-86400000) && d < today; });
  const saltWeek      = sales.filter(s => new Date(s.sale_date) >= weekAgo);

  const buildActivities = (list) => {
    if (!list.length) return [{ type: 'info', title: 'No activity', sub: 'Nothing recorded yet', time: '' }];
    return list.slice(0, 5).map(s => {
      const prod = products.find(p => p.id === s.product_id);
      return {
        type: 'new',
        title: `Sale recorded — ${prod?.name || `Product #${s.product_id}`}`,
        sub: `Qty: ${s.quantity} · Rs. ${s.total_price.toFixed(2)}`,
        time: new Date(s.sale_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      };
    });
  };
  const activityMap = { today: buildActivities(saltToday), yesterday: buildActivities(saltYesterday), week: buildActivities(saltWeek) };

  // Also add product-related activities for today
  if (products.length) {
    const lowStock = products.filter(p => p.quantity < 10 && p.quantity > 0);
    if (lowStock.length) {
      activityMap.today.unshift({ type: 'price', title: `Low stock alert — ${lowStock[0].name}`, sub: `Only ${lowStock[0].quantity} units remaining`, time: 'Now' });
    }
  }

  // ── Top selling products ─────────────────────────────────
  const salesByProduct = products
    .map(p => {
      const productSales = sales.filter(s => s.product_id === p.id);
      const totalQtySold = productSales.reduce((s, x) => s + x.quantity, 0);
      const totalRev     = productSales.reduce((s, x) => s + x.total_price, 0);
      return { ...p, totalQtySold, totalRev, salesCount: productSales.length };
    })
    .sort((a, b) => b.totalQtySold - a.totalQtySold)
    .filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()));

  const countedRevenue = useCounter(Math.floor(totalRevenue));
  const countedProducts = useCounter(products.length);
  const countedSales = useCounter(sales.length);

  const card = {
    background: '#fff', borderRadius: 18, padding: '20px 22px',
    border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)',
  };

  return (
    <div style={{ width: '100%', maxWidth: 1140, fontFamily: 'var(--font)' }}>

      {/* ── Page header ── */}
      <div className="fade-slide-up" style={{ marginBottom: 28 }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4 }}>{dateStr}</div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
          Hello, <span style={{ background: 'var(--grad-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{displayName}</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: 4, fontSize: '0.88rem' }}>Here's your business overview for today.</p>
      </div>

      {/* ══ ROW 1: Overview Performance + (right later) ══ */}

      {/* ── Overview Performance ── */}
      <div className="fade-slide-up" style={{ ...card, marginBottom: 20, animationDelay: '0.05s' }}>
        <SectionHeader title="Overview Performance" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
          {/* Total Revenue */}
          <div style={{ padding: '16px', borderRadius: 14, border: '1px solid var(--border)', background: 'rgba(108,99,255,0.03)', transition: 'box-shadow 0.25s', cursor: 'default' }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(108,99,255,0.12)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Revenue</div>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(108,99,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              </div>
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
              Rs. {loading ? '—' : countedRevenue.toLocaleString()}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <TrendBadge value="+4.5%" positive />
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>vs last month</span>
            </div>
            <div style={{ marginTop: 14 }}>
              <MiniBar data={spark.length >= 4 ? spark : sparkFallback(5)} color="#6c63ff" />
            </div>
          </div>

          {/* Total Products */}
          <div style={{ padding: '16px', borderRadius: 14, border: '1px solid var(--border)', background: 'rgba(240,93,251,0.03)', transition: 'box-shadow 0.25s', cursor: 'default' }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(240,93,251,0.12)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Products</div>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(240,93,251,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f05dfb" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
              </div>
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
              {loading ? '—' : countedProducts}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <TrendBadge value={`${totalUnits} units`} positive />
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>in stock</span>
            </div>
            <div style={{ marginTop: 14 }}>
              <MiniBar data={sparkFallback(3)} color="#f05dfb" />
            </div>
          </div>

          {/* Total Sales */}
          <div style={{ padding: '16px', borderRadius: 14, border: '1px solid var(--border)', background: 'rgba(67,233,123,0.03)', transition: 'box-shadow 0.25s', cursor: 'default' }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(67,233,123,0.12)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Orders</div>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(67,233,123,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2eb86e" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
              </div>
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
              {loading ? '—' : countedSales}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <TrendBadge value="+2.1%" positive />
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>vs last week</span>
            </div>
            <div style={{ marginTop: 14 }}>
              <MiniBar data={sparkFallback(7)} color="#43e97b" />
            </div>
          </div>
        </div>
      </div>

      {/* ══ ROW 2: Sales Report (left) + Recent Activities (right) ══ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, marginBottom: 20, alignItems: 'start' }}>

        {/* ── Sales Report ── */}
        <div className="fade-slide-up" style={{ ...card, animationDelay: '0.1s' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <h2 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', margin: 0 }}>Sales Report</h2>
            {/* Period toggle - Weekly / Monthly only */}
            <div style={{ display: 'flex', gap: 4, background: 'var(--surface-2)', padding: 4, borderRadius: 10 }}>
              {[['weekly', 'Weekly'], ['monthly', 'Monthly']].map(([key, label]) => (
                <button key={key} onClick={() => setChartPeriod(key)} style={{
                  padding: '5px 16px', border: 'none', borderRadius: 7,
                  background: chartPeriod === key ? '#fff' : 'transparent',
                  color: chartPeriod === key ? 'var(--primary)' : 'var(--text-muted)',
                  fontFamily: 'var(--font)', fontWeight: 600, fontSize: '0.75rem',
                  cursor: 'pointer', transition: 'all 0.2s',
                  boxShadow: chartPeriod === key ? 'var(--shadow-card)' : 'none',
                }}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          <ResponsiveContainer key={chartPeriod} width="100%" height={220}>
            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: chartPeriod === 'weekly' ? 0 : 10 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="10%" stopColor="#6c63ff" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#6c63ff" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fill: '#9999bb', fontSize: 10, fontFamily: 'var(--font)' }}
                axisLine={false} tickLine={false}
                interval={chartPeriod === 'weekly' ? 0 : 4}
              />
              <YAxis tick={{ fill: '#9999bb', fontSize: 10, fontFamily: 'var(--font)' }} axisLine={false} tickLine={false} tickFormatter={v => `Rs.${v}`} width={55}/>
              <Tooltip content={<AreaTooltip />} />
              <Area type="monotone" dataKey="revenue" stroke="#6c63ff" strokeWidth={2.5} fill="url(#revGrad)" dot={{ r: 3, fill: '#6c63ff', strokeWidth: 0 }} activeDot={{ r: 5, fill: '#6c63ff', stroke: '#fff', strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>

          {/* Weekly / Monthly / Yearly summary */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
            {[
              { label: 'Weekly', value: weeklyRev, badge: '+19.6%', positive: true, sub: 'Compared to last week' },
              { label: 'Monthly', value: monthlyRev, badge: '+1.9%', positive: true, sub: 'Compared to last month' },
              { label: 'All Time', value: totalRevenue, badge: '+22%', positive: true, sub: 'Total recorded revenue' },
            ].map(item => (
              <div key={item.label}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4, fontWeight: 600 }}>{item.label}</div>
                <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: 4 }}>Rs. {item.value.toFixed(0)}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <TrendBadge value={item.badge} positive={item.positive} />
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{item.sub}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Recent Activities ── */}
        <div className="fade-slide-up" style={{ ...card, animationDelay: '0.15s' }}>
          <SectionHeader
            title="Recent Activities"
            action={<span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600, cursor: 'pointer' }}>See All</span>}
          />

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 16, background: 'var(--surface-2)', padding: 4, borderRadius: 10 }}>
            {[['today', 'Today'], ['yesterday', 'Yesterday'], ['week', 'This Week']].map(([key, label]) => (
              <button key={key} onClick={() => setActivityTab(key)} style={{
                flex: 1, padding: '6px 4px', border: 'none', borderRadius: 8,
                background: activityTab === key ? '#fff' : 'transparent',
                color: activityTab === key ? 'var(--text-primary)' : 'var(--text-muted)',
                fontFamily: 'var(--font)', fontWeight: 600, fontSize: '0.74rem',
                cursor: 'pointer', boxShadow: activityTab === key ? 'var(--shadow-card)' : 'none',
                transition: 'all 0.2s',
              }}>
                {label}
              </button>
            ))}
          </div>

          {loading
            ? [...Array(3)].map((_, i) => <div key={i} style={{ height: 44, borderRadius: 8, background: 'var(--surface-2)', marginBottom: 10, animation: 'pulse 1.5s ease-in-out infinite', animationDelay: `${i * 0.1}s` }} />)
            : activityMap[activityTab]?.map((item, i) => <ActivityItem key={i} {...item} />)
          }
        </div>
      </div>

      {/* ══ ROW 3: Top Selling Products ══ */}
      <div className="fade-slide-up" style={{ ...card, animationDelay: '0.2s' }}>
        <SectionHeader
          title="Top Selling Products"
          action={
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', opacity: 0.4, display: 'flex' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </span>
              <input
                type="text" placeholder="Search products..."
                value={productSearch} onChange={e => setProductSearch(e.target.value)}
                style={{ padding: '7px 14px 7px 30px', borderRadius: 8, border: '1.5px solid var(--border)', outline: 'none', fontFamily: 'var(--font)', fontSize: '0.8rem', color: 'var(--text-primary)', background: '#fff', width: 190, transition: 'border-color 0.2s' }}
                onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
          }
        />

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[...Array(4)].map((_, i) => <div key={i} style={{ height: 44, borderRadius: 8, background: 'var(--surface-2)', animation: 'pulse 1.5s ease-in-out infinite', animationDelay: `${i*0.1}s` }} />)}
          </div>
        ) : salesByProduct.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px 0', color: 'var(--text-muted)' }}>
            <div style={{ marginBottom: 8, opacity: 0.3 }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            </div>
            No data yet
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font)' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Product', 'Category', 'Price', 'Units Sold', 'Revenue', 'Status'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {salesByProduct.slice(0, 8).map((product, idx) => (
                  <tr key={product.id} style={{ borderBottom: idx < salesByProduct.slice(0,8).length - 1 ? '1px solid var(--border)' : 'none', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(108,99,255,0.03)'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}>
                    <td style={{ padding: '13px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg, rgba(108,99,255,0.12), rgba(108,99,255,0.06))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>{product.name}</div>
                          {product.description && <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.description}</div>}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '13px 14px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>General</td>
                    <td style={{ padding: '13px 14px', fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.85rem' }}>Rs. {parseFloat(product.price).toFixed(2)}</td>
                    <td style={{ padding: '13px 14px', fontWeight: 600, color: product.totalQtySold > 0 ? 'var(--primary)' : 'var(--text-muted)', fontSize: '0.85rem' }}>{product.totalQtySold}</td>
                    <td style={{ padding: '13px 14px', fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.85rem' }}>Rs. {product.totalRev.toFixed(0)}</td>
                    <td style={{ padding: '13px 14px' }}><StatusBadge qty={product.quantity} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
