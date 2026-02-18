// ============================================================
// LOGIN COMPONENT
// ============================================================
// User login form with email/password authentication.
// Handles API calls to authenticate user and store JWT token.
// Includes error handling and loading states.

import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, Alert, Container } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// ============================================================
// LOGIN COMPONENT
// ============================================================
function Login({ onLogin }) {
  // ============================================================
  // STATE MANAGEMENT
  // ============================================================
  const [email, setEmail] = useState('');           // Email input value
  const [password, setPassword] = useState('');     // Password input value
  const [error, setError] = useState('');           // Error message display
  const [loading, setLoading] = useState(false);    // Loading state for submit button
  const navigate = useNavigate();

  // ============================================================
  // FORM SUBMISSION HANDLER
  // ============================================================
  /**
   * Handles form submission and user authentication
   * Makes API request to backend login endpoint
   * On success: stores token and redirects to dashboard
   * On failure: displays error message to user
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Send login request to backend API
      const res = await axios.post('http://localhost:8000/users/login', { email, password });
      
      // Call parent component's login handler with token
      onLogin(res.data.access_token);
      
      // Redirect to dashboard
      navigate('/');
    } catch (err) {
      console.error('Login error:', err);
      // Display error message from API or generic message
      setError(err.response?.data?.detail || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
        }}
      >
        {/* Login Form Card */}
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            width: '100%',
            animation: 'scaleUp 0.4s ease-in-out',
            backdropFilter: 'blur(10px)',
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '15px',
            boxShadow: '0 8px 32px rgba(31, 38, 135, 0.37)',
          }}
        >
          {/* Page Title */}
          <Typography 
            variant="h5" 
            component="h1" 
            gutterBottom 
            sx={{ 
              mb: 3, 
              textAlign: 'center', 
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            🔐 Login
          </Typography>

          {/* Error Alert */}
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

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            {/* Email Input Field */}
            <TextField
              label="Email"
              type="email"
              fullWidth
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              placeholder="Enter your email"
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

            {/* Password Input Field */}
            <TextField
              label="Password"
              type="password"
              fullWidth
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              placeholder="Enter your password"
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

            {/* Submit Button */}
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ 
                mt: 3,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: '10px 20px',
                fontSize: '1rem',
                fontWeight: 'bold',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 5px 20px rgba(102, 126, 234, 0.4)',
                },
              }}
              disabled={loading}
            >
              {loading ? '🔄 Logging in...' : '✓ Login'}
            </Button>
          </form>

          {/* Register Link */}
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2">
              Don't have an account? {' '}
              <a 
                href="/register" 
                style={{ 
                  color: '#667eea', 
                  textDecoration: 'none', 
                  fontWeight: 'bold',
                  transition: 'color 0.3s ease',
                }}
                onMouseEnter={(e) => e.target.style.color = '#764ba2'}
                onMouseLeave={(e) => e.target.style.color = '#667eea'}
              >
                Register here
              </a>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

export default Login;
