import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import AdminPanel from './components/AdminPanel';
import UserPanel from './components/UserPanel';
import AdminSetup from './components/AdminSetup';
import 'antd/dist/reset.css';
import './App.css';

// Protected Route Component
function ProtectedRoute({ children, allowedRoles = [] }) {
  const { currentUser, userRole } = useAuth();

  console.log('ProtectedRoute Check:', {
    currentUser: !!currentUser,
    userRole,
    allowedRoles,
    hasAccess: currentUser && (allowedRoles.length === 0 || allowedRoles.includes(userRole))
  });

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    console.log('Access denied: User role', userRole, 'not in allowed roles', allowedRoles);
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

// Unauthorized Component
function Unauthorized() {
  const { userRole } = useAuth();
  
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh',
      textAlign: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        padding: '40px',
        borderRadius: '15px',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        maxWidth: '500px',
        width: '90%'
      }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '20px' }}>🚫 Access Denied</h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '15px' }}>
          You don't have permission to access this page.
        </p>
        <p style={{ fontSize: '1rem', marginBottom: '30px', opacity: 0.9 }}>
          Your current role: <strong>{userRole || 'Unknown'}</strong>
        </p>
        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button 
            onClick={() => window.history.back()}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'}
            onMouseOut={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
          >
            ← Go Back
          </button>
          <button 
            onClick={() => window.location.href = userRole === 'admin' ? '/admin' : '/user'}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'}
            onMouseOut={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
          >
            Go to Dashboard
          </button>
        </div>
        <p style={{ fontSize: '0.9rem', marginTop: '20px', opacity: 0.7 }}>
          Please contact your administrator if you believe this is an error.
        </p>
      </div>
    </div>
  );
}

function AppContent() {
  const { currentUser, userRole } = useAuth();

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={
          currentUser ? <Navigate to={userRole === 'admin' ? '/admin' : '/user'} replace /> : <Login />
        } />
        
        {/* Home Route */}
        <Route path="/home" element={
          <ProtectedRoute allowedRoles={['user', 'admin']}>
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              height: '100vh',
              textAlign: 'center'
            }}>
              <h1>🏠 Welcome to Zahida Residency</h1>
              <p>Choose your destination:</p>
              <div style={{ marginTop: 20 }}>
                {userRole === 'admin' && (
                  <button 
                    onClick={() => window.location.href = '/admin'}
                    style={{ 
                      margin: '0 10px', 
                      padding: '10px 20px', 
                      fontSize: '16px',
                      backgroundColor: '#1890ff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer'
                    }}
                  >
                    Admin Panel
                  </button>
                )}
                <button 
                  onClick={() => window.location.href = '/user'}
                  style={{ 
                    margin: '0 10px', 
                    padding: '10px 20px', 
                    fontSize: '16px',
                    backgroundColor: '#52c41a',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  User Panel
                </button>
              </div>
            </div>
          </ProtectedRoute>
        } />
        
        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={['admin']}>
            {userRole === 'admin' ? <AdminPanel /> : <Navigate to="/unauthorized" replace />}
          </ProtectedRoute>
        } />
        
        {/* User Routes */}
        <Route path="/user" element={
          <ProtectedRoute allowedRoles={['user', 'admin']}>
            <UserPanel />
          </ProtectedRoute>
        } />
        
        {/* Admin Setup Route */}
        <Route path="/admin-setup" element={
          <ProtectedRoute allowedRoles={['user']}>
            <AdminSetup />
          </ProtectedRoute>
        } />
        
        {/* Unauthorized Route */}
        <Route path="/unauthorized" element={<Unauthorized />} />
        
        {/* Default Route - Redirect based on user role */}
        <Route path="/" element={
          currentUser ? (
            <Navigate to={userRole === 'admin' ? '/admin' : '/user'} replace />
          ) : (
            <Navigate to="/login" replace />
          )
        } />
        
        {/* Catch all route */}
        <Route path="*" element={
          <Navigate to="/" replace />
        } />
      </Routes>
    </Router>
  );
}

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>
        <p>Loading Zahida Residency...</p>
      </div>
    );
  }

  return (
    <AuthProvider>
      <div className="App">
        <AppContent />
      </div>
    </AuthProvider>
  );
}

export default App; 