import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

const AuthContext = createContext();

export { AuthContext };

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // Check if user document exists in Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        
        if (!userDoc.exists()) {
          // Create new user document if it doesn't exist
          // This should not happen with the new username-based system
          // but keeping it as a fallback
          await setDoc(doc(db, 'users', user.uid), {
            username: user.email?.split('@')[0] || 'user',
            email: user.email,
            uid: user.uid,
            role: 'user', // Default role
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
          setUserRole('user');
          setUserProfile({
            username: user.email?.split('@')[0] || 'user',
            email: user.email,
            role: 'user'
          });
        } else {
          // Get existing user data
          const userData = userDoc.data();
          setUserRole(userData.role || 'user');
          setUserProfile(userData);
        }
      } else {
        setUserRole(null);
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const value = {
    currentUser,
    userRole,
    userProfile,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 