// ============================================================
// MAIN APP COMPONENT
// ============================================================
// Root component that manages routing, authentication state,
// theme configuration, and global layout structure.

import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, Box, Container } from '@mui/material';

// Import page components
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import Products from './components/Products';
import Sales from './components/Sales';

// ============================================================
// MATERIAL UI THEME CONFIGURATION
// ============================================================
// Defines color scheme, typography, and component styling
// for consistent Material Design throughout the application
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',  // Primary blue color
    },
    secondary: {
      main: '#dc004e',  // Secondary pink/red color
    },
    background: {
      default: '#fafafa',  // Light gray background
      paper: '#ffffff',    // White paper color
    },
  },
  typography: {
    fontFamily: 'system-ui, Avenir, Helvetica, Arial, sans-serif',
  },
});

// ============================================================
// JWT TOKEN PARSING UTILITY
// ============================================================
// Decodes JWT token from localStorage to extract user claims
function parseJwt(token) {
  if (!token) return null;
  try {
    // JWT format: header.payload.signature
    // Decode the payload (middle part) from base64
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

// ============================================================
// MAIN APP COMPONENT
// ============================================================
function App() {
  // ============================================================
  // STATE MANAGEMENT
  // ============================================================
  // token: JWT token for API authentication
  // user: Decoded user data from JWT payload
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [user, setUser] = useState(() => parseJwt(localStorage.getItem('token')));

  // ============================================================
  // AUTHENTICATION HANDLERS
  // ============================================================
  
  /**
   * Handle user login
   * Stores token in state and localStorage
   * Extracts user info from JWT payload
   */
  const handleLogin = (tok) => {
    setToken(tok);
    localStorage.setItem('token', tok);
    setUser(parseJwt(tok));
  };

  /**
   * Handle user logout
   * Clears token and user info from state and localStorage
   */
  const handleLogout = () => {
    setToken('');
    setUser(null);
    localStorage.removeItem('token');
  };

  // ============================================================
  // RENDER
  // ============================================================
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>
          {/* Navigation Bar - Always visible */}
          <Navbar isAuthenticated={!!token} onLogout={handleLogout} />
          
          {/* Main Content Area - Routes rendered here */}
          <Container maxWidth="lg" sx={{ flex: 1, py: 3 }}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Dashboard user={user} />} />
              <Route path="/login" element={<Login onLogin={handleLogin} />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected Routes - Redirect to login if not authenticated */}
              <Route 
                path="/products" 
                element={token ? <Products token={token} user={user} /> : <Navigate to="/login" />} 
              />
              <Route 
                path="/sales" 
                element={token ? <Sales token={token} user={user} /> : <Navigate to="/login" />} 
              />
            </Routes>
          </Container>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;
