// ============================================================
// DASHBOARD COMPONENT
// ============================================================
// Home page displaying key business metrics and statistics.
// Shows total products, inventory quantity, and sales revenue.
// Provides quick access to main features.

import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent, Button, CircularProgress } from '@mui/material';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

// ============================================================
// DASHBOARD COMPONENT
// ============================================================
function Dashboard({ user }) {
  // ============================================================
  // STATE MANAGEMENT
  // ============================================================
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalQuantity: 0,
    totalSales: 0,
    salesAmount: 0,
  });
  const [loading, setLoading] = useState(true);  // Loading state for data fetching
  const [error, setError] = useState('');        // Error message display

  // ============================================================
  // FETCH DASHBOARD STATISTICS
  // ============================================================
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);

        // Fetch products and sales data in parallel
        const [productsRes, salesRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/products/`),
          axios.get(`${API_BASE_URL}/sales/`),
        ]);

        const products = productsRes.data;
        const sales = salesRes.data;

        // Calculate statistics from fetched data
        const totalQuantity = products.reduce((sum, p) => sum + p.quantity, 0);
        const totalSalesAmount = sales.reduce((sum, s) => sum + s.total_price, 0);

        setStats({
          totalProducts: products.length,
          totalQuantity: totalQuantity,
          totalSales: sales.length,
          salesAmount: totalSalesAmount,
        });
        setError('');
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError('Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // ============================================================
  // RENDER - LOADING STATE
  // ============================================================
  if (loading) {
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
      {/* Page Title with User Greeting */}
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
        Welcome, {user ? user.sub || user.email : 'Guest'}! 👋
      </Typography>

      {/* Error Message Display */}
      {error && (
        <Typography
          color="error"
          sx={{
            mb: 2,
            animation: 'slideInAlert 0.3s ease-in-out',
          }}
        >
          ⚠️ {error}
        </Typography>
      )}

      {/* ============================================================
          STATISTICS CARDS GRID
          ============================================================
      */}
      <Grid container spacing={3} sx={{ mb: 4 }}>

        {/* Total Products Card */}
        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
              height: '100%',
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
                📦 Total Products
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
                {stats.totalProducts}
              </Typography>
              <Typography color="textSecondary" sx={{ mt: 1 }}>
                Items in catalog
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Total Inventory Card */}
        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
              height: '100%',
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
                📊 Total Inventory
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
                {stats.totalQuantity}
              </Typography>
              <Typography color="textSecondary" sx={{ mt: 1 }}>
                Units in stock
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Total Sales Revenue Card */}
        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
              height: '100%',
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
                💰 Total Sales
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
                Rs. {stats.salesAmount.toFixed(2)}
              </Typography>
              <Typography color="textSecondary" sx={{ mt: 1 }}>
                Total sales revenue
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ============================================================
          GETTING STARTED SECTION
          ============================================================
      */}
      <Paper
        sx={{
          p: 3,
          animation: 'slideInLeft 0.5s ease-in-out',
          backgroundImage: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          borderRadius: '15px',
        }}
      >
        <Typography
          variant="h6"
          gutterBottom
          sx={{ fontWeight: 'bold', color: '#333' }}
        >
          🚀 Getting Started
        </Typography>
        <Typography variant="body1" paragraph>
          Welcome to the Smart Inventory System! This is your central hub for managing inventory, products, and sales.
          Use the navigation menu to explore different sections.
        </Typography>

        {/* Quick Action Buttons */}
        <Box sx={{ mt: 2 }}>
          <Typography
            variant="subtitle2"
            gutterBottom
            sx={{ fontWeight: 'bold', color: '#333' }}
          >
            📌 Quick Actions:
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 1 }}>
            <Button
              variant="contained"
              href="/products"
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 5px 15px rgba(102, 126, 234, 0.4)',
                }
              }}
            >
              → View Products
            </Button>
            <Button
              variant="outlined"
              href="/sales"
              sx={{
                borderColor: '#667eea',
                color: '#667eea',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: 'rgba(102, 126, 234, 0.1)',
                  transform: 'translateY(-2px)',
                }
              }}
            >
              → View Sales
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}

export default Dashboard;
