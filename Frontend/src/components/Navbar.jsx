// ============================================================
// NAVIGATION BAR COMPONENT
// ============================================================
// Displays the application header with navigation links and
// authentication buttons (Login/Register/Logout).
// Responsive and uses Material-UI AppBar component.

import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

// ============================================================
// NAVBAR COMPONENT
// ============================================================
function Navbar({ isAuthenticated, onLogout }) {
  return (
    <AppBar 
      position="static" 
      sx={{ 
        mb: 2,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        animation: 'slideInTop 0.5s ease-in-out',
      }}
    >
      <Toolbar>
        {/* ============================================================
            APP LOGO / TITLE
            ============================================================
        */}
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            flexGrow: 1, 
            fontWeight: 'bold',
            fontSize: '1.3rem',
            transition: 'transform 0.3s ease',
            '&:hover': {
              transform: 'scale(1.05)',
            }
          }}
        >
          📦 Smart Inventory System
        </Typography>

        {/* ============================================================
            NAVIGATION LINKS
            ============================================================
        */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          {/* Dashboard Link */}
          <Button 
            color="inherit" 
            component={RouterLink} 
            to="/"
            sx={{
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                transform: 'translateY(-2px)',
              }
            }}
          >
            Dashboard
          </Button>

          {/* Products Link */}
          <Button 
            color="inherit" 
            component={RouterLink} 
            to="/products"
            sx={{
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                transform: 'translateY(-2px)',
              }
            }}
          >
            Products
          </Button>

          {/* Sales Link */}
          <Button 
            color="inherit" 
            component={RouterLink} 
            to="/sales"
            sx={{
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                transform: 'translateY(-2px)',
              }
            }}
          >
            Sales
          </Button>

          {/* ============================================================
              AUTHENTICATION BUTTONS
              ============================================================
          */}
          {!isAuthenticated ? (
            // Show Login and Register buttons when user is not authenticated
            <>
              <Button 
                color="inherit" 
                component={RouterLink} 
                to="/login"
                sx={{
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    transform: 'translateY(-2px)',
                  }
                }}
              >
                Login
              </Button>
              <Button 
                color="inherit" 
                component={RouterLink} 
                to="/register"
                sx={{
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    transform: 'translateY(-2px)',
                  }
                }}
              >
                Register
              </Button>
            </>
          ) : (
            // Show Logout button when user is authenticated
            <Button 
              color="inherit" 
              onClick={onLogout}
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.3)',
                  transform: 'translateY(-2px)',
                }
              }}
            >
              Logout
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
