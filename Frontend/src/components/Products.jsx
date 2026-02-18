// ============================================================
// PRODUCTS COMPONENT
// ============================================================
// Displays inventory products in a table format.
// Allows admin users to add new products and delete existing ones.
// Includes form validation and error handling.

import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Alert, Dialog, DialogTitle, DialogContent, TextField, DialogActions, Container, CircularProgress } from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import axios from 'axios';

// ============================================================
// PRODUCTS COMPONENT
// ============================================================
function Products({ token, user }) {
  // ============================================================
  // STATE MANAGEMENT
  // ============================================================
  const [products, setProducts] = useState([]);                    // List of all products
  const [error, setError] = useState('');                          // Error message display
  const [success, setSuccess] = useState('');                      // Success message display
  const [open, setOpen] = useState(false);                         // Add product dialog visibility
  const [loading, setLoading] = useState(false);                   // Loading state for operations
  const [newProduct, setNewProduct] = useState({                   // New product form data
    name: '',
    description: '',
    price: '',
    quantity: ''
  });

  // ============================================================
  // FETCH PRODUCTS FROM API
  // ============================================================
  /**
   * Fetches all products from the backend API
   * Called on component mount to populate the product list
   */
  const fetchProducts = async () => {
    console.log('🔄 Fetching products...');
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:8000/products/');
      console.log('✅ Products fetched:', res.data);
      setProducts(res.data);
      setLoading(false);
      setError('');
    } catch (err) {
      console.error('❌ Error fetching products:', err.message, err.response);
      setError('Failed to fetch products: ' + (err.response?.data?.detail || err.message));
      setLoading(false);
    }
  };

  // ============================================================
  // COMPONENT LIFECYCLE
  // ============================================================
  // Fetch products when component mounts
  useEffect(() => {
    fetchProducts();
  }, []);

  // ============================================================
  // DELETE PRODUCT HANDLER
  // ============================================================
  /**
   * Handles product deletion with confirmation
   * Requires admin role and valid token
   * Updates UI and shows success/error message
   */
  const handleDelete = async (id) => {
    // Confirm deletion before proceeding
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        // Send delete request with authorization header
        await axios.delete(`http://localhost:8000/products/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Remove deleted product from state
        setProducts(products.filter(p => p.id !== id));
        setSuccess('✓ Product deleted successfully');

        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        console.error('Delete error:', err);
        setError('❌ Delete failed. Only admin can delete.');

        // Clear error message after 3 seconds
        setTimeout(() => setError(''), 3000);
      }
    }
  };

  // ============================================================
  // CREATE PRODUCT HANDLER
  // ============================================================
  /**
   * Validates and submits new product to backend
   * Updates product list on success
   * Shows appropriate error/success messages
   */
  const handleCreate = async () => {
    // Validate required fields
    if (!newProduct.name || !newProduct.price || newProduct.quantity === '') {
      setError('⚠️ Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      // Prepare product data with proper type conversions
      const payload = {
        name: newProduct.name,
        description: newProduct.description,
        price: parseFloat(newProduct.price),
        quantity: parseInt(newProduct.quantity),
      };

      // Send creation request to backend API
      const res = await axios.post('http://localhost:8000/products/', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Add new product to state
      setProducts([...products, res.data]);

      // Clear form and close dialog
      setOpen(false);
      setNewProduct({ name: '', description: '', price: '', quantity: '' });
      setSuccess('✓ Product created successfully');

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Create error:', err);
      setError(err.response?.data?.detail || '❌ Create failed. Only admin can create products.');

      // Clear error message after 3 seconds
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <Box sx={{ width: '100%', animation: 'fadeIn 0.4s ease-in-out' }}>
      {/* Page Title */}
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{
          mb: 3,
          fontWeight: 'bold',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        📦 Inventory Products
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

      {/* Add Product Button - Admin Only */}
      {user && user.role === 'admin' && (
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
          ➕ Add Product
        </Button>
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
      ) : products.length === 0 ? (
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
            📭 No products added yet. {user?.role === 'admin' ? 'Click "Add Product" to get started.' : 'Ask an admin to add products.'}
          </Typography>
        </Paper>
      ) : (
        // ============================================================
        // PRODUCTS TABLE
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
                <TableCell sx={{ fontWeight: 'bold', color: '#333' }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#333' }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#333' }} align="right">Price</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#333' }} align="right">Quantity</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#333' }} align="center">Actions</TableCell>
              </TableRow>
            </TableHead>

            {/* Table Body - Product Rows */}
            <TableBody>
              {products.map((product) => (
                <TableRow
                  key={product.id}
                  hover
                  sx={{
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(102, 126, 234, 0.05)',
                    }
                  }}
                >
                  <TableCell>{product.id}</TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>{product.name}</TableCell>
                  <TableCell>{product.description || '-'}</TableCell>
                  <TableCell align="right">
                    <span style={{ color: '#667eea', fontWeight: 'bold' }}>
                      Rs.  {parseFloat(product.price).toFixed(2)}
                    </span>
                  </TableCell>
                  <TableCell align="right">
                    <span style={{ color: product.quantity < 10 ? '#f5576c' : '#667eea', fontWeight: 'bold' }}>
                      {product.quantity}
                    </span>
                  </TableCell>
                  <TableCell align="center">
                    {/* Delete Button - Admin Only */}
                    {user && user.role === 'admin' && (
                      <Button
                        size="small"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDelete(product.id)}
                        sx={{
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            backgroundColor: 'rgba(245, 87, 108, 0.1)',
                          }
                        }}
                      >
                        Delete
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* ============================================================
          ADD PRODUCT MODAL DIALOG
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
          ➕ Add New Product
        </DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
          {/* Product Name Input */}
          <TextField
            label="Product Name"
            fullWidth
            margin="normal"
            value={newProduct.name}
            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
            required
            placeholder="Enter product name"
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

          {/* Product Description Input */}
          <TextField
            label="Description"
            fullWidth
            margin="normal"
            multiline
            rows={3}
            value={newProduct.description}
            onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
            placeholder="Enter product description (optional)"
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

          {/* Price Input */}
          <TextField
            label="Price"
            type="number"
            fullWidth
            margin="normal"
            value={newProduct.price}
            onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
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

          {/* Quantity Input */}
          <TextField
            label="Quantity"
            type="number"
            fullWidth
            margin="normal"
            value={newProduct.quantity}
            onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })}
            inputProps={{ min: '0' }}
            required
            placeholder="0"
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
            {loading ? '🔄 Creating...' : '✓ Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Products;
