// ============================================================
// REGISTER COMPONENT
// ============================================================
// User registration form for creating new accounts.
// Allows users to set username, email, password, and role.
// Includes form validation and error handling.

import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, MenuItem, Alert, Container } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// ============================================================
// REGISTER COMPONENT
// ============================================================
function Register() {
  // ============================================================
  // STATE MANAGEMENT
  // ============================================================
  const [form, setForm] = useState({ 
    username: '', 
    email: '', 
    password: '', 
    role: 'staff' 
  });
  const [error, setError] = useState('');        // Error message display
  const [success, setSuccess] = useState('');    // Success message display
  const [loading, setLoading] = useState(false); // Loading state for submit button
  const navigate = useNavigate();

  // ============================================================
  // FORM INPUT HANDLER
  // ============================================================
  /**
   * Updates form state when any input field changes
   * Maintains all form field values in single state object
   */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ============================================================
  // FORM SUBMISSION HANDLER
  // ============================================================
  /**
   * Handles form submission and user registration
   * Makes API request to backend register endpoint
   * On success: shows success message and redirects to login
   * On failure: displays error message to user
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      // Send registration request to backend API
      await axios.post('http://localhost:8000/users/register', form);
      
      // Show success message
      setSuccess('✓ Registration successful! Redirecting to login...');
      
      // Clear form fields
      setForm({ username: '', email: '', password: '', role: 'staff' });
      
      // Redirect to login page after 2 seconds
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      console.error('Register error:', err);
      // Display error message from API or generic message
      setError(err.response?.data?.detail || 'Registration failed');
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
        {/* Registration Form Card */}
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
            📝 Create Account
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

          {/* Success Alert */}
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

          {/* Registration Form */}
          <form onSubmit={handleSubmit}>
            {/* Username Input Field */}
            <TextField
              label="Username"
              name="username"
              fullWidth
              margin="normal"
              value={form.username}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="Choose a username (3+ characters)"
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

            {/* Email Input Field */}
            <TextField
              label="Email"
              name="email"
              type="email"
              fullWidth
              margin="normal"
              value={form.email}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="Enter your email address"
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
              name="password"
              type="password"
              fullWidth
              margin="normal"
              value={form.password}
              onChange={handleChange}
              required
              disabled={loading}
              placeholder="Create a strong password (6+ characters)"
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

            {/* Role Selection Dropdown */}
            <TextField
              select
              label="Role"
              name="role"
              fullWidth
              margin="normal"
              value={form.role}
              onChange={handleChange}
              required
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
            >
              <MenuItem value="admin">👨‍💼 Admin</MenuItem>
              <MenuItem value="staff">👤 Staff</MenuItem>
            </TextField>

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
              {loading ? '🔄 Registering...' : '✓ Register'}
            </Button>
          </form>

          {/* Login Link */}
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2">
              Already have an account? {' '}
              <a 
                href="/login" 
                style={{ 
                  color: '#667eea', 
                  textDecoration: 'none', 
                  fontWeight: 'bold',
                  transition: 'color 0.3s ease',
                }}
                onMouseEnter={(e) => e.target.style.color = '#764ba2'}
                onMouseLeave={(e) => e.target.style.color = '#667eea'}
              >
                Login here
              </a>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

export default Register;
