// Sales.jsx — Premium sales management with analytics and charts
import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const CHART_COLORS = [
  '#6c63ff', '#8b5cf6', '#f093fb', '#f5576c', '#4facfe', '#43e97b', '#f7b731',
];

function FloatingInput({ label, type = 'text', value, onChange, disabled, placeholder, children }) {
  const [focused, setFocused] = useState(false);
  const style = {
    width: '100%', padding: '12px 16px',
    border: `2px solid ${focused ? 'var(--primary)' : 'var(--border)'}`,
    borderRadius: 10, outline: 'none', fontFamily: 'var(--font)', fontSize: '0.9rem',
    color: 'var(--text-primary)', background: '#fff',
    transition: 'border-color 0.25s, box-shadow 0.25s',
    boxShadow: focused ? '0 0 0 4px rgba(108,99,255,0.12)' : 'none',
  };
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: focused ? 'var(--primary)' : 'var(--text-secondary)', marginBottom: 6, fontFamily: 'var(--font)', transition: 'color 0.2s' }}>
        {label}
      </label>
      {children
        ? <select value={value} onChange={onChange} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} disabled={disabled} style={{ ...style, cursor: 'pointer' }}>
            {children}
          </select>
        : <input type={type} value={value} onChange={onChange} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} disabled={disabled} placeholder={placeholder} style={style} />
      }
    </div>
  );
}

function AnalyticsCard({ label, value, prefix = '', suffix = '', gradient, icon, delay }) {
  return (
    <div
      className="fade-slide-up"
      style={{
        animationDelay: delay, borderRadius: 18, padding: '22px 24px',
        background: gradient, color: '#fff', position: 'relative', overflow: 'hidden',
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        transition: 'transform 0.3s var(--ease), box-shadow 0.3s var(--ease)',
        cursor: 'default',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,0.2)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'; }}
    >
      <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
      <div style={{ fontSize: '1.6rem', marginBottom: 10 }}>{icon}</div>
      <div style={{ fontSize: '0.75rem', fontWeight: 700, opacity: 0.85, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: '1.7rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
        {prefix}{typeof value === 'number' ? value.toFixed(0) : value}{suffix}
      </div>
    </div>
  );
}

function StatCard({ label, value, prefix = '', gradient, delay }) {
  return (
    <div
      className="fade-slide-up"
      style={{
        animationDelay: delay, background: '#fff', borderRadius: 18, padding: '20px 22px',
        border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)',
        transition: 'transform 0.3s, box-shadow 0.3s', cursor: 'default',
        position: 'relative', overflow: 'hidden',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = 'var(--shadow-card)'; }}
    >
      <div style={{ position: 'absolute', top: -15, right: -15, width: 70, height: 70, borderRadius: '50%', background: gradient, opacity: 0.12 }} />
      <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
        {prefix}{typeof value === 'number' ? value.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : value}
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: '#fff', border: '1px solid var(--border)', borderRadius: 12,
        padding: '10px 16px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        fontFamily: 'var(--font)',
      }}>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 4, fontWeight: 600 }}>{label}</p>
        <p style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary)' }}>
          Rs. {Number(payload[0].value).toFixed(2)}
        </p>
      </div>
    );
  }
  return null;
};

function Sales({ token, user }) {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [newSale, setNewSale] = useState({ product_id: '', quantity: '', total_price: '' });
  const [stats, setStats] = useState({ totalSales: 0, todaySales: 0, thisWeekSales: 0, thisMonthSales: 0, orderCount: 0 });
  const [analytics, setAnalytics] = useState({ daily_revenue: 0, monthly_revenue: 0, top_selling_product: null, daily_sales_chart: [] });

  const autoHide = (setter) => setTimeout(() => setter(''), 3500);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [salesRes, productsRes, analyticsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/sales/`),
        axios.get(`${API_BASE_URL}/products/`),
        axios.get(`${API_BASE_URL}/sales/analytics`),
      ]);
      setProducts(productsRes.data);
      setSales(salesRes.data);
      setAnalytics(analyticsRes.data);

      const allSales = salesRes.data;
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      setStats({
        totalSales: allSales.reduce((s, x) => s + x.total_price, 0),
        todaySales: allSales.filter(s => new Date(s.sale_date) >= today).reduce((s, x) => s + x.total_price, 0),
        thisWeekSales: allSales.filter(s => new Date(s.sale_date) >= weekAgo).reduce((s, x) => s + x.total_price, 0),
        thisMonthSales: allSales.filter(s => new Date(s.sale_date) >= monthStart).reduce((s, x) => s + x.total_price, 0),
        orderCount: allSales.length,
      });
    } catch (err) {
      setError('Failed to load sales data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async () => {
    if (!newSale.product_id || !newSale.quantity || !newSale.total_price) {
      setError('Please fill in all fields'); return;
    }
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/sales/`, {
        product_id: parseInt(newSale.product_id),
        quantity: parseInt(newSale.quantity),
        total_price: parseFloat(newSale.total_price),
      });
      setOpen(false);
      setNewSale({ product_id: '', quantity: '', total_price: '' });
      setSuccess('Sale recorded successfully'); autoHide(setSuccess);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create sale'); autoHide(setError);
    } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this sale record?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/sales/${id}`);
      setSales(sales.filter(s => s.id !== id));
      setSuccess('Sale deleted'); autoHide(setSuccess);
      fetchData();
    } catch {
      setError('Failed to delete sale'); autoHide(setError);
    }
  };

  const filteredSales = sales.filter(s => {
    const prod = products.find(p => p.id === s.product_id);
    const name = prod ? prod.name : `#${s.product_id}`;
    return name.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div style={{ width: '100%', maxWidth: 1100, fontFamily: 'var(--font)' }}>
      {/* Header */}
      <div className="fade-slide-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>💹 Sales</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 4, fontSize: '0.9rem' }}>
            {sales.length} records · Track your revenue and transactions
          </p>
        </div>
        <button
          onClick={() => setOpen(true)}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 25px rgba(108,99,255,0.35)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 15px rgba(108,99,255,0.2)'; }}
          style={{
            padding: '10px 22px', background: 'var(--grad-primary)', border: 'none', borderRadius: 10,
            color: '#fff', fontFamily: 'var(--font)', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(108,99,255,0.2)', transition: 'transform 0.25s, box-shadow 0.25s',
            display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          <span>+</span> Record Sale
        </button>
      </div>

      {/* Alerts */}
      {error && <div className="alert-anim" style={{ padding: '12px 16px', background: 'rgba(252,92,101,0.1)', border: '1px solid rgba(252,92,101,0.3)', borderRadius: 10, color: '#c0392b', marginBottom: 16, fontSize: '0.87rem' }}>⚠️ {error}</div>}
      {success && <div className="alert-anim" style={{ padding: '12px 16px', background: 'rgba(67,233,123,0.12)', border: '1px solid rgba(67,233,123,0.35)', borderRadius: 10, color: '#2eb86e', marginBottom: 16, fontSize: '0.87rem' }}>✅ {success}</div>}

      {loading && sales.length === 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{ height: 110, borderRadius: 18, background: 'var(--surface-2)', animation: `pulse 1.5s ease-in-out infinite`, animationDelay: `${i * 0.1}s` }} />
          ))}
        </div>
      ) : (
        <>
          {/* Stats row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
            <StatCard label="Today's Sales" value={stats.todaySales} prefix="Rs. " gradient="var(--grad-primary)" delay="0s" />
            <StatCard label="This Week" value={stats.thisWeekSales} prefix="Rs. " gradient="var(--grad-pink)" delay="0.07s" />
            <StatCard label="This Month" value={stats.thisMonthSales} prefix="Rs. " gradient="var(--grad-cyan)" delay="0.14s" />
            <StatCard label="Total Orders" value={stats.orderCount} prefix="" gradient="var(--grad-gold)" delay="0.21s" />
          </div>

          {/* Analytics section */}
          <h2 className="fade-slide-up" style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16, animationDelay: '0.25s' }}>
            Revenue Analytics
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16, marginBottom: 28 }}>
            <AnalyticsCard label="Today's Revenue" value={analytics.daily_revenue} prefix="Rs. " gradient="var(--grad-primary)" icon="💰" delay="0.28s" />
            <AnalyticsCard label="Monthly Revenue" value={analytics.monthly_revenue} prefix="Rs. " gradient="var(--grad-pink)" icon="📅" delay="0.34s" />
            <AnalyticsCard
              label="Top Product"
              value={analytics.top_selling_product ? analytics.top_selling_product.name : 'N/A'}
              gradient="var(--grad-cyan)" icon="🏆" delay="0.40s"
            />
          </div>

          {/* Chart */}
          {analytics.daily_sales_chart && analytics.daily_sales_chart.length > 0 && (
            <div className="fade-slide-up" style={{ background: '#fff', borderRadius: 20, padding: '24px 28px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)', marginBottom: 28, animationDelay: '0.44s' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20 }}>
                📈 Last 7 Days Revenue
              </h2>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={analytics.daily_sales_chart} margin={{ top: 5, right: 10, left: 10, bottom: 5 }} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: '#9999bb', fontSize: 12, fontFamily: 'var(--font)', fontWeight: 600 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#9999bb', fontSize: 11, fontFamily: 'var(--font)' }} axisLine={false} tickLine={false} tickFormatter={v => `Rs.${v}`} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(108,99,255,0.06)', radius: 8 }} />
                  <Bar dataKey="revenue" radius={[10, 10, 3, 3]} maxBarSize={56}>
                    {analytics.daily_sales_chart.map((_, idx) => (
                      <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Table header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Transaction History
            </h2>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: '0.9rem', opacity: 0.4 }}>🔍</span>
              <input
                type="text" placeholder="Search by product..."
                value={search} onChange={e => setSearch(e.target.value)}
                style={{
                  padding: '9px 16px 9px 34px', borderRadius: 10, border: '1.5px solid var(--border)',
                  outline: 'none', fontFamily: 'var(--font)', fontSize: '0.86rem',
                  color: 'var(--text-primary)', background: '#fff', width: 210, transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                onBlur={e => e.target.style.borderColor = 'var(--border)'}
              />
            </div>
          </div>

          {/* Sales Table */}
          {filteredSales.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px 20px', background: '#fff', borderRadius: 20, border: '1px dashed var(--border)' }}>
              <div style={{ fontSize: '3rem', marginBottom: 12 }}>📭</div>
              <div style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
                {search ? 'No matching sales found' : 'No sales records yet. Click "Record Sale" to add one.'}
              </div>
            </div>
          ) : (
            <div className="fade-slide-up" style={{ background: '#fff', borderRadius: 20, border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)', overflow: 'hidden', animationDelay: '0.5s' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font)' }}>
                <thead>
                  <tr style={{ background: 'rgba(108,99,255,0.04)', borderBottom: '1px solid var(--border)' }}>
                    {['#', 'Product', 'Qty', 'Total Price', 'Date', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '14px 18px', textAlign: 'left', fontSize: '0.73rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredSales.map((sale, idx) => {
                    const prod = products.find(p => p.id === sale.product_id);
                    return (
                      <tr
                        key={sale.id}
                        style={{ borderBottom: idx < filteredSales.length - 1 ? '1px solid var(--border)' : 'none', transition: 'background 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(108,99,255,0.03)'}
                        onMouseLeave={e => e.currentTarget.style.background = ''}
                      >
                        <td style={{ padding: '13px 18px', color: 'var(--text-muted)', fontSize: '0.82rem', fontWeight: 600 }}>{sale.id}</td>
                        <td style={{ padding: '13px 18px', fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                          {prod ? prod.name : `Product #${sale.product_id}`}
                        </td>
                        <td style={{ padding: '13px 18px', fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{sale.quantity}</td>
                        <td style={{ padding: '13px 18px', fontWeight: 700, color: 'var(--primary)', fontSize: '0.9rem' }}>
                          Rs. {parseFloat(sale.total_price).toFixed(2)}
                        </td>
                        <td style={{ padding: '13px 18px', color: 'var(--text-secondary)', fontSize: '0.83rem' }}>
                          {new Date(sale.sale_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </td>
                        <td style={{ padding: '13px 18px' }}>
                          <button
                            onClick={() => handleDelete(sale.id)}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(252,92,101,0.12)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            style={{
                              border: '1.5px solid rgba(252,92,101,0.4)', borderRadius: 8,
                              padding: '5px 12px', background: 'transparent', color: '#fc5c65',
                              fontFamily: 'var(--font)', fontWeight: 600, fontSize: '0.78rem',
                              cursor: 'pointer', transition: 'background 0.2s',
                            }}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Record Sale Modal */}
      {open && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(10,10,30,0.5)', backdropFilter: 'blur(6px)' }}
          onClick={e => e.target === e.currentTarget && setOpen(false)}
        >
          <div className="scale-in" style={{ background: '#fff', borderRadius: 24, padding: 36, width: '100%', maxWidth: 440, boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <div>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Record New Sale</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.83rem', marginTop: 4 }}>Enter the details of the sale</p>
              </div>
              <button onClick={() => setOpen(false)} style={{ border: 'none', background: 'var(--surface-2)', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>×</button>
            </div>

            <FloatingInput label="Product *" value={newSale.product_id} onChange={e => setNewSale({ ...newSale, product_id: e.target.value })} disabled={loading}>
              <option value="">Select a product</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name} (Stock: {p.quantity})</option>)}
            </FloatingInput>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <FloatingInput label="Quantity *" type="number" value={newSale.quantity} onChange={e => setNewSale({ ...newSale, quantity: e.target.value })} disabled={loading} placeholder="1" />
              <FloatingInput label="Total Price (Rs.) *" type="number" value={newSale.total_price} onChange={e => setNewSale({ ...newSale, total_price: e.target.value })} disabled={loading} placeholder="0.00" />
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button onClick={() => setOpen(false)} disabled={loading} style={{ flex: 1, padding: '12px', border: '1.5px solid var(--border)', borderRadius: 10, background: 'transparent', color: 'var(--text-secondary)', fontFamily: 'var(--font)', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}>
                Cancel
              </button>
              <button
                onClick={handleCreate} disabled={loading}
                onMouseEnter={e => !loading && (e.currentTarget.style.transform = 'translateY(-2px)', e.currentTarget.style.boxShadow = '0 8px 20px rgba(108,99,255,0.35)')}
                onMouseLeave={e => (e.currentTarget.style.transform = '', e.currentTarget.style.boxShadow = '0 4px 14px rgba(108,99,255,0.2)')}
                style={{
                  flex: 2, padding: '12px', background: loading ? '#a0a0c0' : 'var(--grad-primary)',
                  border: 'none', borderRadius: 10, color: '#fff', fontFamily: 'var(--font)',
                  fontWeight: 700, fontSize: '0.9rem', cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 14px rgba(108,99,255,0.2)', transition: 'transform 0.25s, box-shadow 0.25s',
                }}
              >
                {loading ? '⏳ Recording...' : '+ Record Sale'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Sales;
