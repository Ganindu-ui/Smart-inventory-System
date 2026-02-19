// ============================================================
// SALES COMPONENT
// ============================================================
// Displays sales transactions, statistics, and analytics.
// Allows users to record new sales and delete existing ones.
// Shows sales metrics, revenue analytics, and bar chart.

import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Dialog, DialogTitle, DialogContent, TextField, DialogActions, Alert, CircularProgress, MenuItem } from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

// ============================================================
// SALES COMPONENT
// ============================================================
function Sales({ token, user }) {
  // ============================================================
  // STATE MANAGEMENT
  // ============================================================
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [open, setOpen] = useState(false);
  const [newSale, setNewSale] = useState({
    product_id: '',
    quantity: '',
    total_price: ''
  });

  // Sales statistics (daily, weekly, monthly)
  const [stats, setStats] = useState({
    totalSales: 0,
    todaySales: 0,
    thisWeekSales: 0,
    thisMonthSales: 0,
    orderCount: 0,
  });

  // Analytics data from backend
  const [analytics, setAnalytics] = useState({
    daily_revenue: 0,
    monthly_revenue: 0,
    top_selling_product: null,
    daily_sales_chart: [],
  });

  // ============================================================
  // FETCH SALES AND PRODUCTS WITH STATISTICS
  // ============================================================
  const fetchSalesAndProducts = async () => {
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

      // Calculate local stats
      const allSales = salesRes.data;
      const totalAmount = allSales.reduce((sum, s) => sum + s.total_price, 0);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      const todayAmount = allSales.filter(s => new Date(s.sale_date) >= today).reduce((sum, s) => sum + s.total_price, 0);
      const weekAmount = allSales.filter(s => new Date(s.sale_date) >= weekAgo).reduce((sum, s) => sum + s.total_price, 0);
      const monthAmount = allSales.filter(s => new Date(s.sale_date) >= monthStart).reduce((sum, s) => sum + s.total_price, 0);

      setStats({
        totalSales: totalAmount,
        todaySales: todayAmount,
        thisWeekSales: weekAmount,
        thisMonthSales: monthAmount,
        orderCount: allSales.length,
      });
      setError('');
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load sales data');
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // COMPONENT LIFECYCLE
  // ============================================================
  useEffect(() => {
    fetchSalesAndProducts();
  }, []);

  // ============================================================
  // CREATE SALE HANDLER
  // ============================================================
  const handleCreate = async () => {
    if (!newSale.product_id || !newSale.quantity || !newSale.total_price) {
      setError('⚠️ Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        product_id: parseInt(newSale.product_id),
        quantity: parseInt(newSale.quantity),
        total_price: parseFloat(newSale.total_price),
      };

      await axios.post(`${API_BASE_URL}/sales/`, payload);

      setOpen(false);
      setNewSale({ product_id: '', quantity: '', total_price: '' });
      setSuccess('✓ Sale recorded successfully');
      setTimeout(() => setSuccess(''), 3000);
      fetchSalesAndProducts();
    } catch (err) {
      console.error('Create error:', err);
      setError(err.response?.data?.detail || '❌ Failed to create sale');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // DELETE SALE HANDLER
  // ============================================================
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this sale?')) {
      try {
        await axios.delete(`${API_BASE_URL}/sales/${id}`);
        setSales(sales.filter(s => s.id !== id));
        setSuccess('✓ Sale deleted successfully');
        setTimeout(() => setSuccess(''), 3000);
        fetchSalesAndProducts();
      } catch (err) {
        console.error('Delete error:', err);
        setError('❌ Failed to delete sale');
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  // Bar chart gradient colors
  const chartColors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe', '#fa709a'];

  // ============================================================
  // RENDER - LOADING STATE
  // ============================================================
  if (loading && sales.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress sx={{ animation: 'spin 1s linear infinite' }} />
      </Box>
    );
  }

  // ============================================================
  // RENDER - MAIN CONTENT
  // ============================================================
  return (
    <Box sx={{ width: '100%', animation: 'fadeIn 0.4s ease-in-out' }}>
      {/* Page Title */}
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{
          mb: 4,
          fontWeight: 'bold',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        💹 Sales Management
      </Typography>

      {/* Alert Messages */}
      {error && (
        <Alert severity="error" sx={{ mb: 2, animation: 'slideInAlert 0.3s ease-in-out' }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2, animation: 'slideInAlert 0.3s ease-in-out' }}>
          {success}
        </Alert>
      )}

      {/* Loading State */}
      {loading && !error ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
          <CircularProgress sx={{ color: '#667eea' }} />
        </Box>
      ) : (
        <>
          {/* ============================================================
              SALES STATISTICS CARDS
              ============================================================ */}
          <Grid container spacing={3} sx={{ mb: 4 }}>

            {/* Today's Sales Card */}
            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  animation: 'scaleUp 0.4s ease-in-out',
                  backgroundImage: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 24px rgba(102, 126, 234, 0.2)',
                  }
                }}
              >
                <CardContent>
                  <Typography color="textSecondary" gutterBottom sx={{ fontWeight: 'bold' }}>
                    📅 Today's Sales
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      fontWeight: 'bold',
                    }}
                  >
                    Rs. {stats.todaySales.toFixed(2)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* This Week's Sales Card */}
            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  animation: 'scaleUp 0.5s ease-in-out',
                  backgroundImage: 'linear-gradient(135deg, #f093fb15 0%, #f5576c15 100%)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 24px rgba(245, 87, 108, 0.2)',
                  }
                }}
              >
                <CardContent>
                  <Typography color="textSecondary" gutterBottom sx={{ fontWeight: 'bold' }}>
                    📊 This Week
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{
                      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      fontWeight: 'bold',
                    }}
                  >
                    Rs. {stats.thisWeekSales.toFixed(2)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* This Month's Sales Card */}
            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  animation: 'scaleUp 0.6s ease-in-out',
                  backgroundImage: 'linear-gradient(135deg, #4facfe15 0%, #00f2fe15 100%)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 24px rgba(79, 172, 254, 0.2)',
                  }
                }}
              >
                <CardContent>
                  <Typography color="textSecondary" gutterBottom sx={{ fontWeight: 'bold' }}>
                    📈 This Month
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{
                      background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      fontWeight: 'bold',
                    }}
                  >
                    Rs. {stats.thisMonthSales.toFixed(2)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Total Orders Card */}
            <Grid item xs={12} sm={6} md={3}>
              <Card
                sx={{
                  animation: 'scaleUp 0.7s ease-in-out',
                  backgroundImage: 'linear-gradient(135deg, #fa709a15 0%, #fee14015 100%)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 24px rgba(250, 112, 154, 0.2)',
                  }
                }}
              >
                <CardContent>
                  <Typography color="textSecondary" gutterBottom sx={{ fontWeight: 'bold' }}>
                    📦 Total Orders
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{
                      background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      fontWeight: 'bold',
                    }}
                  >
                    {stats.orderCount || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* ============================================================
              SALES ANALYTICS SECTION
              ============================================================ */}
          <Typography
            variant="h5"
            component="h2"
            gutterBottom
            sx={{
              mb: 3,
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            📊 Revenue Analytics
          </Typography>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* Daily Revenue Card */}
            <Grid item xs={12} sm={6} md={4}>
              <Card
                sx={{
                  animation: 'scaleUp 0.4s ease-in-out',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 30px rgba(102, 126, 234, 0.4)',
                  }
                }}
              >
                <CardContent>
                  <Typography sx={{ fontWeight: 'bold', opacity: 0.9, fontSize: '0.9rem' }}>
                    💰 Today's Revenue
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1 }}>
                    Rs. {analytics.daily_revenue.toFixed(2)}
                  </Typography>
                  <Typography sx={{ opacity: 0.8, mt: 0.5, fontSize: '0.85rem' }}>
                    Revenue earned today
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Monthly Revenue Card */}
            <Grid item xs={12} sm={6} md={4}>
              <Card
                sx={{
                  animation: 'scaleUp 0.5s ease-in-out',
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  color: 'white',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 30px rgba(245, 87, 108, 0.4)',
                  }
                }}
              >
                <CardContent>
                  <Typography sx={{ fontWeight: 'bold', opacity: 0.9, fontSize: '0.9rem' }}>
                    📅 Monthly Revenue
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1 }}>
                    Rs. {analytics.monthly_revenue.toFixed(2)}
                  </Typography>
                  <Typography sx={{ opacity: 0.8, mt: 0.5, fontSize: '0.85rem' }}>
                    Revenue this month
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Top Selling Product Card */}
            <Grid item xs={12} sm={6} md={4}>
              <Card
                sx={{
                  animation: 'scaleUp 0.6s ease-in-out',
                  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                  color: 'white',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 30px rgba(79, 172, 254, 0.4)',
                  }
                }}
              >
                <CardContent>
                  <Typography sx={{ fontWeight: 'bold', opacity: 0.9, fontSize: '0.9rem' }}>
                    🏆 Top Selling Product
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mt: 1 }}>
                    {analytics.top_selling_product ? analytics.top_selling_product.name : 'N/A'}
                  </Typography>
                  <Typography sx={{ opacity: 0.8, mt: 0.5, fontSize: '0.85rem' }}>
                    {analytics.top_selling_product
                      ? `${analytics.top_selling_product.total_quantity_sold} units sold`
                      : 'No sales yet'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* ============================================================
              REVENUE BAR CHART - LAST 7 DAYS
              ============================================================ */}
          <Paper
            sx={{
              p: 3,
              mb: 4,
              borderRadius: '15px',
              animation: 'slideInTop 0.5s ease-in-out',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            }}
          >
            <Typography
              variant="h6"
              gutterBottom
              sx={{
                fontWeight: 'bold',
                mb: 3,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              📈 Last 7 Days Revenue
            </Typography>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={analytics.daily_sales_chart} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#666', fontSize: 12, fontWeight: 500 }}
                  axisLine={{ stroke: '#e0e0e0' }}
                />
                <YAxis
                  tick={{ fill: '#666', fontSize: 12 }}
                  axisLine={{ stroke: '#e0e0e0' }}
                  tickFormatter={(value) => `Rs.${value}`}
                />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    border: 'none',
                    borderRadius: '10px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                    padding: '10px 15px',
                  }}
                  formatter={(value) => [`Rs. ${value.toFixed(2)}`, 'Revenue']}
                  cursor={{ fill: 'rgba(102, 126, 234, 0.08)' }}
                />
                <Bar dataKey="revenue" radius={[8, 8, 0, 0]} barSize={40}>
                  {analytics.daily_sales_chart.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Paper>

          {/* Record Sale Button */}
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpen(true)}
            sx={{
              mb: 2,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 5px 20px rgba(102, 126, 234, 0.4)',
              }
            }}
          >
            ➕ Record Sale
          </Button>

          {/* Empty State */}
          {sales.length === 0 ? (
            <Paper
              sx={{
                p: 3,
                textAlign: 'center',
                animation: 'fadeIn 0.4s ease-in-out',
                backgroundImage: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                borderRadius: '15px',
              }}
            >
              <Typography variant="body1" color="textSecondary" sx={{ fontSize: '1.1rem' }}>
                📭 No sales records yet. Click "Record Sale" to add one.
              </Typography>
            </Paper>
          ) : (
            // ============================================================
            // SALES TABLE
            // ============================================================
            <TableContainer
              component={Paper}
              sx={{
                animation: 'slideInTop 0.4s ease-in-out',
                borderRadius: '15px',
                overflow: 'hidden',
              }}
            >
              <Table>
                {/* Table Header */}
                <TableHead>
                  <TableRow
                    sx={{
                      backgroundColor: '#f5f5f5',
                      background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
                    }}
                  >
                    <TableCell sx={{ fontWeight: 'bold', color: '#333' }}>ID</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#333' }}>Product</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#333' }} align="right">Quantity</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#333' }} align="right">Total Price</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#333' }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#333' }} align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>

                {/* Table Body - Sale Rows */}
                <TableBody>
                  {sales.map((sale) => {
                    const product = products.find(p => p.id === sale.product_id);
                    return (
                      <TableRow
                        key={sale.id}
                        hover
                        sx={{
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            backgroundColor: 'rgba(102, 126, 234, 0.05)',
                          }
                        }}
                      >
                        <TableCell>{sale.id}</TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>
                          {product ? product.name : `Product #${sale.product_id}`}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 500 }}>{sale.quantity}</TableCell>
                        <TableCell align="right">
                          <span style={{ color: '#667eea', fontWeight: 'bold' }}>
                            Rs. {parseFloat(sale.total_price).toFixed(2)}
                          </span>
                        </TableCell>
                        <TableCell>{new Date(sale.sale_date).toLocaleDateString()}</TableCell>
                        <TableCell align="center">
                          {/* Delete Button */}
                          <Button
                            size="small"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={() => handleDelete(sale.id)}
                            sx={{
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                backgroundColor: 'rgba(245, 87, 108, 0.1)',
                              }
                            }}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* ============================================================
              RECORD SALE MODAL DIALOG
              ============================================================ */}
          <Dialog
            open={open}
            onClose={() => setOpen(false)}
            maxWidth="sm"
            fullWidth
            sx={{
              '& .MuiPaper-root': {
                animation: 'scaleUp 0.3s ease-in-out',
                borderRadius: '15px',
              }
            }}
          >
            <DialogTitle sx={{ fontWeight: 'bold', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
              ➕ Record New Sale
            </DialogTitle>

            <DialogContent sx={{ pt: 2 }}>
              {/* Product Selection Dropdown */}
              <TextField
                select
                label="Product"
                fullWidth
                margin="normal"
                value={newSale.product_id}
                onChange={(e) => setNewSale({ ...newSale, product_id: e.target.value })}
                required
                disabled={loading}
                placeholder="Select a product"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    transition: 'all 0.3s ease',
                    '&:hover fieldset': { borderColor: '#667eea' },
                    '&.Mui-focused fieldset': { borderColor: '#667eea', boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)' },
                  },
                }}
              >
                {products.map((product) => (
                  <MenuItem key={product.id} value={product.id}>
                    {product.name} (Stock: {product.quantity})
                  </MenuItem>
                ))}
              </TextField>

              {/* Quantity Input */}
              <TextField
                label="Quantity"
                type="number"
                fullWidth
                margin="normal"
                value={newSale.quantity}
                onChange={(e) => setNewSale({ ...newSale, quantity: e.target.value })}
                inputProps={{ min: '1' }}
                required
                placeholder="Enter quantity"
                disabled={loading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    transition: 'all 0.3s ease',
                    '&:hover fieldset': { borderColor: '#667eea' },
                    '&.Mui-focused fieldset': { borderColor: '#667eea', boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)' },
                  },
                }}
              />

              {/* Total Price Input */}
              <TextField
                label="Total Price"
                type="number"
                fullWidth
                margin="normal"
                value={newSale.total_price}
                onChange={(e) => setNewSale({ ...newSale, total_price: e.target.value })}
                inputProps={{ step: '0.01', min: '0' }}
                required
                placeholder="0.00"
                disabled={loading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    transition: 'all 0.3s ease',
                    '&:hover fieldset': { borderColor: '#667eea' },
                    '&.Mui-focused fieldset': { borderColor: '#667eea', boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)' },
                  },
                }}
              />
            </DialogContent>

            {/* Dialog Actions */}
            <DialogActions sx={{ p: 2 }}>
              <Button
                onClick={() => setOpen(false)}
                disabled={loading}
                sx={{ transition: 'all 0.2s ease', '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' } }}
              >
                ✕ Cancel
              </Button>
              <Button
                onClick={handleCreate}
                variant="contained"
                sx={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 5px 15px rgba(102, 126, 234, 0.4)',
                  }
                }}
                disabled={loading}
              >
                {loading ? '🔄 Recording...' : '✓ Record Sale'}
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </Box>
  );
}

export default Sales;
