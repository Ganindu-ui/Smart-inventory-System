// ============================================================
// SALES COMPONENT
// ============================================================
// Displays sales transactions and statistics.
// Allows users to record new sales and delete existing ones.
// Shows sales metrics for today, this week, and this month.

import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Dialog, DialogTitle, DialogContent, TextField, DialogActions, Alert, CircularProgress, MenuItem } from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

// ============================================================
// SALES COMPONENT
// ============================================================
function Sales({ token, user }) {
  // ============================================================
  // STATE MANAGEMENT
  // ============================================================
  const [sales, setSales] = useState([]);                      // List of all sales
  const [products, setProducts] = useState([]);                // List of products for dropdown
  const [loading, setLoading] = useState(false);               // Loading state for operations
  const [error, setError] = useState('');                      // Error message display
  const [success, setSuccess] = useState('');                  // Success message display
  const [open, setOpen] = useState(false);                     // Add sale dialog visibility
  const [newSale, setNewSale] = useState({                     // New sale form data
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

  // ============================================================
  // FETCH SALES AND PRODUCTS WITH STATISTICS
  // ============================================================
  /**
   * Fetches all sales and products from API
   * Calculates sales metrics for multiple time periods
   * Updates component state with all data
   */
  const fetchSalesAndProducts = async () => {
    try {
      setLoading(true);

      // Fetch sales and products data in parallel for performance
      const [salesRes, productsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/sales/`),
        axios.get(`${API_BASE_URL}/products/`),
      ]);

      setProducts(productsRes.data);
      setSales(salesRes.data);

      // ============================================================
      // CALCULATE SALES STATISTICS
      // ============================================================
      const allSales = salesRes.data;

      // Total sales all time
      const totalAmount = allSales.reduce((sum, s) => sum + s.total_price, 0);

      // Get time boundaries for period calculations
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      // Calculate today's sales
      const todayAmount = allSales
        .filter(s => new Date(s.sale_date) >= today)
        .reduce((sum, s) => sum + s.total_price, 0);

      // Calculate this week's sales (last 7 days)
      const weekAmount = allSales
        .filter(s => new Date(s.sale_date) >= weekAgo)
        .reduce((sum, s) => sum + s.total_price, 0);

      // Calculate this month's sales
      const monthAmount = allSales
        .filter(s => new Date(s.sale_date) >= monthStart)
        .reduce((sum, s) => sum + s.total_price, 0);

      // Update stats state
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
  // Fetch sales and products when component mounts
  useEffect(() => {
    fetchSalesAndProducts();
  }, []);

  // ============================================================
  // CREATE SALE HANDLER
  // ============================================================
  /**
   * Validates and submits new sale to backend
   * Automatically updates inventory
   * Shows success/error messages
   */
  const handleCreate = async () => {
    // Validate all required fields
    if (!newSale.product_id || !newSale.quantity || !newSale.total_price) {
      setError('⚠️ Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      // Prepare sale data with proper type conversions
      const payload = {
        product_id: parseInt(newSale.product_id),
        quantity: parseInt(newSale.quantity),
        total_price: parseFloat(newSale.total_price),
      };

      // Send sale creation request
      await axios.post(`${API_BASE_URL}/sales/`, payload);

      // Clear form and close dialog
      setOpen(false);
      setNewSale({ product_id: '', quantity: '', total_price: '' });
      setSuccess('✓ Sale recorded successfully');

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);

      // Refresh sales data and recalculate statistics
      fetchSalesAndProducts();
    } catch (err) {
      console.error('Create error:', err);
      setError(err.response?.data?.detail || '❌ Failed to create sale');

      // Clear error message after 3 seconds
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // DELETE SALE HANDLER
  // ============================================================
  /**
   * Handles sale deletion with confirmation
   * Automatically restores inventory when sale is deleted
   * Updates UI and statistics
   */
  const handleDelete = async (id) => {
    // Confirm deletion before proceeding
    if (window.confirm('Are you sure you want to delete this sale?')) {
      try {
        // Send delete request
        await axios.delete(`${API_BASE_URL}/sales/${id}`);

        // Remove deleted sale from state
        setSales(sales.filter(s => s.id !== id));
        setSuccess('✓ Sale deleted successfully');

        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);

        // Refresh sales data and recalculate statistics
        fetchSalesAndProducts();
      } catch (err) {
        console.error('Delete error:', err);
        setError('❌ Failed to delete sale');

        // Clear error message after 3 seconds
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  // ============================================================
  // RENDER - LOADING STATE
  // ============================================================
  if (loading && sales.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px'
        }}
      >
        <CircularProgress
          sx={{
            animation: 'spin 1s linear infinite',
          }}
        />
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
        <Alert
          severity="error"
          sx={{
            mb: 2,
            animation: 'slideInAlert 0.3s ease-in-out',
          }}
        >
          {error}
        </Alert>
      )}
      {success && (
        <Alert
          severity="success"
          sx={{
            mb: 2,
            animation: 'slideInAlert 0.3s ease-in-out',
          }}
        >
          {success}
        </Alert>
      )}

      {/* Loading State */}
      {loading && !error ? (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            py: 8,
          }}
        >
          <CircularProgress
            sx={{
              color: '#667eea',
            }}
          />
        </Box>
      ) : (
        <>
          {/* ============================================================
          SALES STATISTICS CARDS
          ============================================================
      */}
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
                  <Typography
                    color="textSecondary"
                    gutterBottom
                    sx={{ fontWeight: 'bold' }}
                  >
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
                  <Typography
                    color="textSecondary"
                    gutterBottom
                    sx={{ fontWeight: 'bold' }}
                  >
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
                  <Typography
                    color="textSecondary"
                    gutterBottom
                    sx={{ fontWeight: 'bold' }}
                  >
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
                  <Typography
                    color="textSecondary"
                    gutterBottom
                    sx={{ fontWeight: 'bold' }}
                  >
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
              <Typography
                variant="body1"
                color="textSecondary"
                sx={{ fontSize: '1.1rem' }}
              >
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
                    <TableCell sx={{ fontWeight: 'bold', color: '#333' }}>Product ID</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#333' }} align="right">Quantity</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#333' }} align="right">Total Price</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#333' }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#333' }} align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>

                {/* Table Body - Sale Rows */}
                <TableBody>
                  {sales.map((sale) => (
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
                      <TableCell>{sale.product_id}</TableCell>
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
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* ============================================================
          RECORD SALE MODAL DIALOG
          ============================================================
      */}
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
                    '&:hover fieldset': {
                      borderColor: '#667eea',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#667eea',
                      boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)',
                    },
                  },
                }}
              >
                {/* Generate menu items from available products */}
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
                    '&:hover fieldset': {
                      borderColor: '#667eea',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#667eea',
                      boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)',
                    },
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
                    '&:hover fieldset': {
                      borderColor: '#667eea',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#667eea',
                      boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)',
                    },
                  },
                }}
              />
            </DialogContent>

            {/* Dialog Actions */}
            <DialogActions sx={{ p: 2 }}>
              <Button
                onClick={() => setOpen(false)}
                disabled={loading}
                sx={{
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  }
                }}
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
