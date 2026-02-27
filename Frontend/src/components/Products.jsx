// Products.jsx — Professional inventory management (no emojis)
import React, { useEffect, useState } from 'react';
import axios from 'axios';

// ── SVG Icons ─────────────────────────────────────────────────
const IconSearch = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IconPlus  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IconTrash = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>;
const IconBox   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>;
const IconX     = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IconAlert = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
const IconCheck = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;

// ── Input field ───────────────────────────────────────────────
function Field({ label, type = 'text', value, onChange, disabled, placeholder, multiline }) {
  const [focused, setFocused] = useState(false);
  const base = {
    width: '100%', padding: '11px 14px',
    border: `1.5px solid ${focused ? 'var(--primary)' : 'var(--border)'}`,
    borderRadius: 10, outline: 'none', fontFamily: 'var(--font)', fontSize: '0.88rem',
    color: 'var(--text-primary)', background: '#fff', resize: 'vertical',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    boxShadow: focused ? '0 0 0 3px rgba(108,99,255,0.1)' : 'none',
  };
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: focused ? 'var(--primary)' : 'var(--text-secondary)', marginBottom: 5, fontFamily: 'var(--font)', transition: 'color 0.2s' }}>
        {label}
      </label>
      {multiline
        ? <textarea value={value} onChange={onChange} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} disabled={disabled} placeholder={placeholder} rows={2} style={base} />
        : <input type={type} value={value} onChange={onChange} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} disabled={disabled} placeholder={placeholder} style={base} />
      }
    </div>
  );
}

// ── Status badge ──────────────────────────────────────────────
function StockBadge({ qty }) {
  const cfg = qty === 0
    ? { label: 'Out of Stock', bg: 'rgba(252,92,101,0.1)', color: '#fc5c65', dot: '#fc5c65' }
    : qty < 10
    ? { label: 'Low Stock',    bg: 'rgba(247,183,49,0.12)', color: '#d4900a', dot: '#f7b731' }
    : { label: 'In Stock',     bg: 'rgba(67,233,123,0.1)', color: '#2eb86e', dot: '#43e97b' };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 99, background: cfg.bg, color: cfg.color, fontSize: '0.72rem', fontWeight: 700 }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.dot, display: 'inline-block' }} />
      {cfg.label}
    </span>
  );
}

// ── Main component ────────────────────────────────────────────
export default function Products({ token, user }) {
  const [products, setProducts] = useState([]);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');
  const [open, setOpen]         = useState(false);
  const [loading, setLoading]   = useState(false);
  const [search, setSearch]     = useState('');
  const [sortKey, setSortKey]   = useState('name');
  const [form, setForm]         = useState({ name: '', description: '', price: '', quantity: '' });

  const autoHide = setter => setTimeout(() => setter(''), 3500);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:8000/products/');
      setProducts(res.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch products: ' + (err.response?.data?.detail || err.message));
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product and its sales records?')) return;
    try {
      await axios.delete(`http://localhost:8000/products/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setProducts(products.filter(p => p.id !== id));
      setSuccess('Product deleted'); autoHide(setSuccess);
    } catch { setError('Delete failed — admin permission required.'); autoHide(setError); }
  };

  const handleCreate = async () => {
    if (!form.name || !form.price || form.quantity === '') { setError('Please fill in all required fields'); return; }
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:8000/products/', {
        name: form.name, description: form.description,
        price: parseFloat(form.price), quantity: parseInt(form.quantity),
      }, { headers: { Authorization: `Bearer ${token}` } });
      setProducts([...products, res.data]);
      setOpen(false);
      setForm({ name: '', description: '', price: '', quantity: '' });
      setSuccess('Product added successfully'); autoHide(setSuccess);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed — admin permission required.'); autoHide(setError);
    } finally { setLoading(false); }
  };

  const sorted = [...products]
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || (p.description || '').toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortKey === 'price') return a.price - b.price;
      if (sortKey === 'quantity') return b.quantity - a.quantity;
      return a.name.localeCompare(b.name);
    });

  return (
    <div style={{ width: '100%', maxWidth: 1100, fontFamily: 'var(--font)' }}>

      {/* ── Header ── */}
      <div className="fade-slide-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14, marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>Products</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 3, fontSize: '0.83rem' }}>{products.length} items in catalog</p>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', opacity: 0.35, display: 'flex' }}><IconSearch /></span>
            <input type="text" placeholder="Search products…" value={search} onChange={e => setSearch(e.target.value)}
              style={{ padding: '9px 14px 9px 32px', borderRadius: 10, border: '1.5px solid var(--border)', outline: 'none', fontFamily: 'var(--font)', fontSize: '0.84rem', color: 'var(--text-primary)', background: '#fff', width: 220, transition: 'border-color 0.2s' }}
              onFocus={e => e.target.style.borderColor = 'var(--primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
          {/* Sort */}
          <select value={sortKey} onChange={e => setSortKey(e.target.value)}
            style={{ padding: '9px 14px', borderRadius: 10, border: '1.5px solid var(--border)', outline: 'none', fontFamily: 'var(--font)', fontSize: '0.84rem', color: 'var(--text-secondary)', background: '#fff', cursor: 'pointer' }}>
            <option value="name">Sort: Name</option>
            <option value="price">Sort: Price</option>
            <option value="quantity">Sort: Stock</option>
          </select>
          {user?.role === 'admin' && (
            <button onClick={() => setOpen(true)}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 22px rgba(108,99,255,0.35)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 14px rgba(108,99,255,0.2)'; }}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', background: 'var(--grad-primary)', border: 'none', borderRadius: 10, color: '#fff', fontFamily: 'var(--font)', fontWeight: 600, fontSize: '0.84rem', cursor: 'pointer', boxShadow: '0 4px 14px rgba(108,99,255,0.2)', transition: 'transform 0.2s, box-shadow 0.2s' }}>
              <IconPlus /> Add Product
            </button>
          )}
        </div>
      </div>

      {/* ── Alerts ── */}
      {error && (
        <div className="alert-anim" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 16px', background: 'rgba(252,92,101,0.08)', border: '1px solid rgba(252,92,101,0.25)', borderRadius: 10, color: '#c0392b', marginBottom: 16, fontSize: '0.85rem' }}>
          <IconAlert />{error}
        </div>
      )}
      {success && (
        <div className="alert-anim" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 16px', background: 'rgba(67,233,123,0.1)', border: '1px solid rgba(67,233,123,0.3)', borderRadius: 10, color: '#2eb86e', marginBottom: 16, fontSize: '0.85rem' }}>
          <IconCheck />{success}
        </div>
      )}

      {/* ── Table Card ── */}
      {loading && products.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[...Array(5)].map((_, i) => <div key={i} style={{ height: 52, borderRadius: 10, background: 'var(--surface-2)', animation: 'pulse 1.5s ease-in-out infinite', animationDelay: `${i * 0.1}s` }} />)}
        </div>
      ) : sorted.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 20px', background: '#fff', borderRadius: 18, border: '1.5px dashed var(--border)' }}>
          <div style={{ marginBottom: 12, opacity: 0.25 }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', fontWeight: 500 }}>
            {search ? 'No products match your search.' : user?.role === 'admin' ? 'No products yet — click "Add Product" to create one.' : 'No products found.'}
          </div>
        </div>
      ) : (
        <div className="fade-slide-up" style={{ background: '#fff', borderRadius: 18, border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)', overflow: 'hidden', animationDelay: '0.1s' }}>
          {/* Table header row */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 3fr 1fr 1fr 1fr auto', gap: 0, padding: '0 0', borderBottom: '1px solid var(--border)', background: 'rgba(108,99,255,0.03)' }}>
            {['Product', 'Description', 'Price', 'Stock', 'Status', ...(user?.role === 'admin' ? [''] : [])].map(h => (
              <div key={h} style={{ padding: '12px 18px', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</div>
            ))}
          </div>
          {sorted.map((product, idx) => (
            <div key={product.id}
              style={{ display: 'grid', gridTemplateColumns: '2fr 3fr 1fr 1fr 1fr auto', alignItems: 'center', borderBottom: idx < sorted.length - 1 ? '1px solid var(--border)' : 'none', transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(108,99,255,0.025)'}
              onMouseLeave={e => e.currentTarget.style.background = ''}
            >
              {/* Product name + icon */}
              <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(108,99,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <IconBox />
                </div>
                <span style={{ fontWeight: 600, fontSize: '0.87rem', color: 'var(--text-primary)' }}>{product.name}</span>
              </div>
              {/* Description */}
              <div style={{ padding: '14px 18px', color: 'var(--text-secondary)', fontSize: '0.82rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 260 }}>
                {product.description || <span style={{ opacity: 0.4 }}>—</span>}
              </div>
              {/* Price */}
              <div style={{ padding: '14px 18px', fontWeight: 700, color: 'var(--primary)', fontSize: '0.87rem' }}>
                Rs.&nbsp;{parseFloat(product.price).toFixed(2)}
              </div>
              {/* Stock qty */}
              <div style={{ padding: '14px 18px', fontWeight: 600, fontSize: '0.87rem', color: product.quantity < 10 ? '#fc5c65' : 'var(--text-primary)' }}>
                {product.quantity}
              </div>
              {/* Badge */}
              <div style={{ padding: '14px 18px' }}><StockBadge qty={product.quantity} /></div>
              {/* Actions */}
              {user?.role === 'admin' && (
                <div style={{ padding: '14px 18px' }}>
                  <button onClick={() => handleDelete(product.id)}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(252,92,101,0.1)'; e.currentTarget.style.color = '#fc5c65'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                    style={{ border: '1.5px solid var(--border)', borderRadius: 8, padding: '6px 10px', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font)', fontSize: '0.78rem', fontWeight: 600, transition: 'all 0.2s' }}>
                    <IconTrash /> Delete
                  </button>
                </div>
              )}
            </div>
          ))}
          {/* Footer summary */}
          <div style={{ padding: '12px 18px', borderTop: '1px solid var(--border)', background: 'rgba(108,99,255,0.02)', display: 'flex', alignItems: 'center', gap: 20 }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>{sorted.length} of {products.length} products shown</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total stock: <strong style={{ color: 'var(--text-primary)' }}>{products.reduce((s, p) => s + p.quantity, 0)} units</strong></span>
          </div>
        </div>
      )}

      {/* ── Add Product Modal ── */}
      {open && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(10,10,30,0.45)', backdropFilter: 'blur(5px)' }}
          onClick={e => e.target === e.currentTarget && setOpen(false)}
        >
          <div className="scale-in" style={{ background: '#fff', borderRadius: 22, padding: 32, width: '100%', maxWidth: 450, boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 22 }}>
              <div>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Add New Product</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: 4 }}>Fill in the details below</p>
              </div>
              <button onClick={() => setOpen(false)} style={{ border: 'none', background: 'var(--surface-2)', borderRadius: 8, width: 30, height: 30, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}><IconX /></button>
            </div>

            <Field label="Product Name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} disabled={loading} placeholder="e.g. Wireless Keyboard" />
            <Field label="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} disabled={loading} placeholder="Optional description" multiline />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Price (Rs.) *" type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} disabled={loading} placeholder="0.00" />
              <Field label="Quantity *" type="number" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} disabled={loading} placeholder="0" />
            </div>
            {error && <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#c0392b', fontSize: '0.82rem', marginBottom: 12 }}><IconAlert />{error}</div>}

            <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
              <button onClick={() => setOpen(false)} disabled={loading} style={{ flex: 1, padding: '11px', border: '1.5px solid var(--border)', borderRadius: 10, background: 'transparent', color: 'var(--text-secondary)', fontFamily: 'var(--font)', fontWeight: 600, cursor: 'pointer', fontSize: '0.87rem' }}>Cancel</button>
              <button onClick={handleCreate} disabled={loading}
                onMouseEnter={e => !loading && (e.currentTarget.style.transform = 'translateY(-1px)', e.currentTarget.style.boxShadow = '0 8px 20px rgba(108,99,255,0.35)')}
                onMouseLeave={e => (e.currentTarget.style.transform = '', e.currentTarget.style.boxShadow = '0 4px 14px rgba(108,99,255,0.2)')}
                style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '11px', background: loading ? '#a0a0c0' : 'var(--grad-primary)', border: 'none', borderRadius: 10, color: '#fff', fontFamily: 'var(--font)', fontWeight: 600, fontSize: '0.87rem', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 4px 14px rgba(108,99,255,0.2)', transition: 'transform 0.2s, box-shadow 0.2s' }}>
                {loading ? 'Adding…' : <><IconPlus /> Add Product</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
