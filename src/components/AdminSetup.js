import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import './AdminSetup.css';

const AdminSetup = () => {
  const { currentUser, userRole } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const promoteToAdmin = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    setMessage('');
    
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        role: 'admin',
        updatedAt: new Date()
      });
      
      setMessage('Successfully promoted to admin! Please refresh the page.');
    } catch (error) {
      setMessage('Error promoting to admin: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Only show this component if user is not already admin
  if (userRole === 'admin') {
    return null;
  }

  return (
    <div className="admin-setup">
      <div className="admin-setup-card">
        <h2>🔧 Admin Setup</h2>
        <p>This appears to be the first user. Would you like to promote yourself to admin?</p>
        <p className="warning">⚠️ This action cannot be undone easily.</p>
        
        <button 
          onClick={promoteToAdmin}
          disabled={loading}
          className="promote-button"
        >
          {loading ? 'Promoting...' : 'Promote to Admin'}
        </button>
        
        {message && (
          <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSetup; 