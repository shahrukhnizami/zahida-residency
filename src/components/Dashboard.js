import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const { currentUser, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome to Zahida Residency</h1>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>
      
      <div className="dashboard-content">
        <div className="user-info-card">
          <h2>User Information</h2>
          <div className="user-details">
            <p><strong>Email:</strong> {currentUser?.email}</p>
            <p><strong>User ID:</strong> {currentUser?.uid}</p>
            <p><strong>Email Verified:</strong> {currentUser?.emailVerified ? 'Yes' : 'No'}</p>
            <p><strong>Account Created:</strong> {currentUser?.metadata?.creationTime ? new Date(currentUser.metadata.creationTime).toLocaleDateString() : 'N/A'}</p>
          </div>
        </div>
        
        <div className="welcome-message">
          <h3>🎉 Successfully Logged In!</h3>
          <p>You are now authenticated with Firebase. This is your dashboard where you can manage your Zahida Residency account.</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 