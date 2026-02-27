// Products.jsx — Premium inventory products table (no emojis)
import React, { useEffect, useState } from 'react';
import axios from 'axios';

function FloatingInput({ label, type = 'text', value, onChange, disabled, placeholder, multiline }) {
  const [focused, setFocused] = useState(false);
  const shared = {
    width: '100%', padding: '12px 16px',
    border: `2px solid ${focused ? 'var(--primary)' : 'var(--border)'}`,
    borderRadius: 10, outline: 'none',
    fontFamily: 'var(--font)', fontSize: '0.9rem',
    color: 'var(--text-primary)', background: '#fff',
    transition: 'border-color 0.25s, box-shadow 0.25s',
    boxShadow: focused ? '0 0 0 4px rgba(108,99,255,0.12)' : 'none',
    resize: 'vertical',
  };
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: focused ? 'var(--primary)' : 'var(--text-secondary)', marginBottom: 6, fontFamily: 'var(--font)', transition: 'color 0.2s' }}>
        {label}
      </label>
      {multiline
        ? <textarea value={value} onChange={onChange} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} disabled={disabled} placeholder={placeholder} rows={3} style={shared} />
        : <input type={type} value={value} onChange={onChange} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} disabled={disabled} placeholder={placeholder} style={shared} />
      }
    </div>
  );
}

function Products({ token, user }) {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [newProduct, setNewProduct] = useState({ name: '', description: '', price: '', quantity: '' });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:8000/products/');
      setProducts(res.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch products: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const autoHide = (setter) => { setTimeout(() => setter(''), 3500); };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await axios.delete(`http://localhost:8000/products/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setProducts(products.filter(p => p.id !== id));
      setSuccess('Product deleted successfully'); autoHide(setSuccess);
    } catch (err) {
      setError('Delete failed. Admin permission required.'); autoHide(setError);
    }
  };

  const handleCreate = async () => {
    if (!newProduct.name || !newProduct.price || newProduct.quantity === '') {
      setError('Please fill in all required fields'); return;
    }
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:8000/products/', {
        name: newProduct.name, description: newProduct.description,
        price: parseFloat(newProduct.price), quantity: parseInt(newProduct.quantity),
      }, { headers: { Authorization: `Bearer ${token}` } });
      setProducts([...products, res.data]);
      setOpen(false);
      setNewProduct({ name: '', description: '', price: '', quantity: '' });
      setSuccess('Product created successfully'); autoHide(setSuccess);
    } catch (err) {
      setError(err.response?.data?.detail || 'Create failed. Admin permission required.'); autoHide(setError);
    } finally { setLoading(false); }
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.description || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ width: '100%', maxWidth: 1100, fontFamily: 'var(--font)' }}>
      {/* Header */}
      <div className="fade-slide-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
            📦 Products
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 4, fontSize: '0.9rem' }}>
            {products.length} items in your catalog
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', opacity: 0.4, display: 'flex' }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></span>
            <input
              type="text" placeholder="Search products..."
              value={search} onChange={e => setSearch(e.target.value)}
              style={{
                padding: '10px 16px 10px 36px', borderRadius: 10,
                border: '1.5px solid var(--border)', outline: 'none',
                fontFamily: 'var(--font)', fontSize: '0.88rem',
                color: 'var(--text-primary)', background: '#fff',
                width: 220, transition: 'border-color 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
          {user?.role === 'admin' && (
            <button
              onClick={() => setOpen(true)}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 25px rgba(108,99,255,0.35)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 15px rgba(108,99,255,0.2)'; }}
              style={{
                padding: '10px 22px', background: 'var(--grad-primary)',
                border: 'none', borderRadius: 10, color: '#fff',
                fontFamily: 'var(--font)', fontWeight: 700, fontSize: '0.9rem',
                cursor: 'pointer', boxShadow: '0 4px 15px rgba(108,99,255,0.2)',
                transition: 'transform 0.25s, box-shadow 0.25s',
                display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              <span>+</span> Add Product
            </button>
          )}
        </div>
      </div>

      {/* Alerts */}
      {error && <div className="alert-anim" style={{ padding: '12px 16px', background: 'rgba(252,92,101,0.1)', border: '1px solid rgba(252,92,101,0.3)', borderRadius: 10, color: '#c0392b', marginBottom: 16, fontSize: '0.87rem' }}>⚠️ {error}</div>}
      {success && <div className="alert-anim" style={{ padding: '12px 16px', background: 'rgba(67,233,123,0.12)', border: '1px solid rgba(67,233,123,0.35)', borderRadius: 10, color: '#2eb86e', marginBottom: 16, fontSize: '0.87rem' }}>✅ {success}</div>}

      {/* Loading skeletons */}
      {loading && products.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[...Array(5)].map((_, i) => (
            <div key={i} style={{ height: 56, borderRadius: 12, background: 'var(--surface-2)', animation: `pulse 1.5s ease-in-out infinite`, animationDelay: `${i * 0.1}s` }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', borderRadius: 20, border: '1px dashed var(--border)' }}>
          <div style={{ marginBottom: 16, opacity: 0.35 }}><svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg></div>
          <div style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
            {search ? 'No products match your search' : (user?.role === 'admin' ? 'No products yet. Click "Add Product" to get started.' : 'No products found. Ask an admin to add products.')}
          </div>
        </div>
      ) : (
        /* Table */
        <div className="fade-slide-up" style={{ background: '#fff', borderRadius: 20, border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)', overflow: 'hidden', animationDelay: '0.1s' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font)' }}>
            <thead>
              <tr style={{ background: 'rgba(108,99,255,0.04)', borderBottom: '1px solid var(--border)' }}>
                {['#', 'Product Name', 'Description', 'Price', 'Quantity', 'Status', ...(user?.role === 'admin' ? ['Actions'] : [])].map(h => (
                  <th key={h} style={{ padding: '14px 18px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((product, idx) => (
                <tr
                  key={product.id}
                  style={{ borderBottom: idx < filtered.length - 1 ? '1px solid var(--border)' : 'none', transition: 'background 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(108,99,255,0.03)'}
                  onMouseLeave={e => e.currentTarget.style.background = ''}
                >
                  <td style={{ padding: '14px 18px', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>{product.id}</td>
                  <td style={{ padding: '14px 18px', fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{product.name}</td>
                  <td style={{ padding: '14px 18px', color: 'var(--text-secondary)', fontSize: '0.85rem', maxWidth: 200 }}>
                    <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {product.description || '—'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 18px', fontWeight: 700, color: 'var(--primary)', fontSize: '0.9rem' }}>
                    Rs. {parseFloat(product.price).toFixed(2)}
                  </td>
                  <td style={{ padding: '14px 18px', fontWeight: 700, color: product.quantity < 10 ? '#fc5c65' : 'var(--text-primary)', fontSize: '0.9rem' }}>
                    {product.quantity}
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <span style={{
                      display: 'inline-block', padding: '4px 12px', borderRadius: 99, fontSize: '0.75rem', fontWeight: 700,
                      background: product.quantity === 0 ? 'rgba(252,92,101,0.12)' : product.quantity < 10 ? 'rgba(247,183,49,0.15)' : 'rgba(67,233,123,0.12)',
                      color: product.quantity === 0 ? '#fc5c65' : product.quantity < 10 ? '#e5a000' : '#2eb86e',
                    }}>
                      {product.quantity === 0 ? 'Out of Stock' : product.quantity < 10 ? 'Low Stock' : 'In Stock'}
                    </span>
                  </td>
                  {user?.role === 'admin' && (
                    <td style={{ padding: '14px 18px' }}>
                      <button
                        onClick={() => handleDelete(product.id)}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(252,92,101,0.12)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        style={{
                          border: '1.5px solid rgba(252,92,101,0.4)', borderRadius: 8,
                          padding: '6px 14px', background: 'transparent',
                          color: '#fc5c65', fontFamily: 'var(--font)', fontWeight: 600,
                          fontSize: '0.8rem', cursor: 'pointer', transition: 'background 0.2s',
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Product Modal */}
      {open && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(10,10,30,0.5)', backdropFilter: 'blur(6px)',
        }}
        onClick={e => e.target === e.currentTarget && setOpen(false)}
        >
          <div className="scale-in" style={{
            background: '#fff', borderRadius: 24, padding: 36,
            width: '100%', maxWidth: 460, boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--border)',
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <div>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Add New Product</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.83rem', marginTop: 4 }}>Fill in the product details below</p>
              </div>
              <button onClick={() => setOpen(false)} style={{ border: 'none', background: 'var(--surface-2)', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>×</button>
            </div>

            <FloatingInput label="Product Name *" value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} disabled={loading} placeholder="e.g. Wireless Mouse" />
            <FloatingInput label="Description" value={newProduct.description} onChange={e => setNewProduct({ ...newProduct, description: e.target.value })} disabled={loading} placeholder="Product description (optional)" multiline />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <FloatingInput label="Price (Rs.) *" type="number" value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} disabled={loading} placeholder="0.00" />
              <FloatingInput label="Quantity *" type="number" value={newProduct.quantity} onChange={e => setNewProduct({ ...newProduct, quantity: e.target.value })} disabled={loading} placeholder="0" />
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
                  border: 'none', borderRadius: 10, color: '#fff',
                  fontFamily: 'var(--font)', fontWeight: 700, fontSize: '0.9rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 14px rgba(108,99,255,0.2)',
                  transition: 'transform 0.25s, box-shadow 0.25s',
                }}
              >
                {loading ? '⏳ Creating...' : '+ Create Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Products;
