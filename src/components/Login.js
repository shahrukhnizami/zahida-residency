import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { Button, Card, Typography, Divider, message, Spin } from 'antd';
import { GoogleOutlined, LoadingOutlined } from '@ant-design/icons';
import './Login.css';

const { Title, Text } = Typography;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const { setCurrentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      message.loading('Signing in with Google...', 0);
      
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Check if user exists in Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        // Create new user document
        const username = user.email.split('@')[0] + Math.floor(Math.random() * 1000);
        await setDoc(doc(db, 'users', user.uid), {
          username: username,
          email: user.email,
          name: user.displayName || '',
          role: 'user',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        message.success('Account created successfully! Welcome to Zahida Residency.');
      } else {
        message.success('Welcome back to Zahida Residency!');
      }
      
      setCurrentUser(user);
      message.destroy();
      navigate('/user');
      
    } catch (error) {
      message.destroy();
      console.error('Error during Google login:', error);
      
      if (error.code === 'auth/popup-closed-by-user') {
        message.info('Login cancelled. Please try again.');
      } else if (error.code === 'auth/popup-blocked') {
        message.error('Popup blocked by browser. Please allow popups and try again.');
      } else {
        message.error('Failed to sign in with Google. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="login-content">
          <Card className="login-card">
            <div className="login-header">
              <div className="logo">
                <span role="img" aria-label="building">🏢</span>
              </div>
              <Title level={2} className="login-title">
                Welcome to Zahida Residency
              </Title>
              <Text type="secondary" className="login-subtitle">
                Sign in to access your account
              </Text>
            </div>

            <div className="login-form">
              <Button
                type="primary"
                size="large"
                icon={loading ? <LoadingOutlined /> : <GoogleOutlined />}
                onClick={handleGoogleLogin}
                disabled={loading}
                className="google-login-btn"
                block
              >
                {loading ? 'Signing in...' : 'Continue with Google'}
              </Button>

              <Divider>
                <Text type="secondary">Secure Login</Text>
              </Divider>

              <div className="login-info">
                <div className="info-item">
                  <span role="img" aria-label="security">🔒</span>
                  <Text type="secondary">Secure authentication with Google</Text>
                </div>
                <div className="info-item">
                  <span role="img" aria-label="speed">⚡</span>
                  <Text type="secondary">Quick and easy sign-in process</Text>
                </div>
                <div className="info-item">
                  <span role="img" aria-label="privacy">🛡️</span>
                  <Text type="secondary">Your data is protected and private</Text>
                </div>
              </div>
            </div>

            <div className="login-footer">
              <Text type="secondary" className="footer-text">
                By signing in, you agree to our Terms of Service and Privacy Policy
              </Text>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login; 