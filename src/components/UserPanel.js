import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { doc, getDoc, updateDoc, collection, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import {
  Layout,
  Menu,
  Avatar,
  Typography,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Spin,
  Row,
  Col,
  Card,
  Statistic,
  Divider,
  Badge,
  Tabs,
  Progress,
  Tag,
  message,
  Result,
} from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  CreditCardOutlined,
  LogoutOutlined,
  HomeOutlined,
  EditOutlined,
  PieChartOutlined,
  BarChartOutlined,
  AreaChartOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
} from '@ant-design/icons';
import './UserPanel.css';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const UserPanel = () => {
  const { currentUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [form] = Form.useForm();
  const [editForm, setEditForm] = useState({});
  const [stats, setStats] = useState({
    totalPaidAmount: 0,
    blockA: 0,
    blockB: 0,
    blockC: 0,
    blockD: 0,
    flatsPaidAmount: 0,
    shopsPaidAmount: 0,
    totalFlats: 0,
    totalShops: 0,
    flatsPercentage: 0,
    shopsPercentage: 0,
    blockAUsers: 0,
    blockBUsers: 0,
    blockCUsers: 0,
    blockDUsers: 0,
    blockAPercentage: 0,
    blockBPercentage: 0,
    blockCPercentage: 0,
    blockDPercentage: 0,
    totalUsers: 0,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        message.loading('Loading your data...', 0);
        await Promise.all([fetchUserData(), fetchStats()]);
        message.destroy();
        message.success('Data loaded successfully!');
      } catch (error) {
        message.destroy();
        console.error('Error loading initial data:', error);
        message.error('Failed to load data. Please refresh the page.');
      }
    };
    
    if (currentUser) {
      loadData();
    }
  }, [currentUser]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (userDoc.exists()) {
        setUserData(userDoc.data());
      } else {
        message.error('User data not found. Please contact administrator.');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      message.error('Failed to load user data. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      const totalUsers = users.length;
      const totalPaidAmount = users.reduce((sum, user) => sum + (parseFloat(user.paidAmount) || 0), 0);
      const totalFlats = users.filter(user => user.category === 'Flat').length;
      const totalShops = users.filter(user => user.category === 'Shop').length;
      const flatsPaidAmount = users
        .filter(user => user.category === 'Flat')
        .reduce((sum, user) => sum + (parseFloat(user.paidAmount) || 0), 0);
      const shopsPaidAmount = users
        .filter(user => user.category === 'Shop')
        .reduce((sum, user) => sum + (parseFloat(user.paidAmount) || 0), 0);
      
      const blockAUsers = users.filter(user => user.block === 'A').length;
      const blockBUsers = users.filter(user => user.block === 'B').length;
      const blockCUsers = users.filter(user => user.block === 'C').length;
      const blockDUsers = users.filter(user => user.block === 'D').length;
      
      const blockA = users
        .filter(user => user.block === 'A')
        .reduce((sum, user) => sum + (parseFloat(user.paidAmount) || 0), 0);
      const blockB = users
        .filter(user => user.block === 'B')
        .reduce((sum, user) => sum + (parseFloat(user.paidAmount) || 0), 0);
      const blockC = users
        .filter(user => user.block === 'C')
        .reduce((sum, user) => sum + (parseFloat(user.paidAmount) || 0), 0);
      const blockD = users
        .filter(user => user.block === 'D')
        .reduce((sum, user) => sum + (parseFloat(user.paidAmount) || 0), 0);
      
      setStats({
        totalUsers,
        totalPaidAmount,
        totalFlats,
        totalShops,
        flatsPaidAmount,
        shopsPaidAmount,
        flatsPercentage: totalUsers > 0 ? ((totalFlats / totalUsers) * 100).toFixed(1) : '0',
        shopsPercentage: totalUsers > 0 ? ((totalShops / totalUsers) * 100).toFixed(1) : '0',
        blockA,
        blockB,
        blockC,
        blockD,
        blockAUsers,
        blockBUsers,
        blockCUsers,
        blockDUsers,
        blockAPercentage: totalUsers > 0 ? ((blockAUsers / totalUsers) * 100).toFixed(1) : '0',
        blockBPercentage: totalUsers > 0 ? ((blockBUsers / totalUsers) * 100).toFixed(1) : '0',
        blockCPercentage: totalUsers > 0 ? ((blockCUsers / totalUsers) * 100).toFixed(1) : '0',
        blockDPercentage: totalUsers > 0 ? ((blockDUsers / totalUsers) * 100).toFixed(1) : '0',
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      message.error('Failed to load statistics. Please refresh the page.');
    }
  };

  const handleLogout = async () => {
    try {
      message.loading('Logging out...', 0);
      await logout();
      message.destroy();
      message.success('Logged out successfully!');
      navigate('/login');
    } catch (error) {
      message.destroy();
      console.error('Error during logout:', error);
      message.error('Failed to logout. Please try again.');
    }
  };

  const handleEdit = () => {
    form.setFieldsValue({
      name: userData?.name || '',
      phone: userData?.phone || '',
      nic: userData?.nic || '',
      category: userData?.category || '',
      block: userData?.block || '',
      no: userData?.no || '',
      downPayment: userData?.downPayment || '',
      paidAmount: userData?.paidAmount || '',
      paymentType: userData?.paymentType || ''
    });
    setShowEditModal(true);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        ...values,
        updatedAt: serverTimestamp()
      });
      
      message.success('Profile updated successfully!');
      setShowEditModal(false);
      fetchUserData(); // Refresh user data
    } catch (error) {
      console.error('Error updating profile:', error);
      message.error('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    try {
      form.resetFields();
      setShowEditModal(false);
      message.info('Edit cancelled. No changes were saved.');
    } catch (error) {
      console.error('Error cancelling edit:', error);
      message.error('Error cancelling edit. Please try again.');
    }
  };

  const handleTabChange = (key) => {
    try {
      setActiveTab(key);
      message.success(`Switched to ${key.charAt(0).toUpperCase() + key.slice(1)}`);
    } catch (error) {
      console.error('Error switching tabs:', error);
      message.error('Failed to switch tabs. Please try again.');
    }
  };

  const renderContent = () => {
    try {
      switch (activeTab) {
        case 'dashboard':
          return renderDashboard();
        case 'profile':
          return renderProfile();
       
        default:
          return renderDashboard();
      }
    } catch (error) {
      console.error('Error rendering content:', error);
      return (
        <div style={{ padding: 24, textAlign: 'center' }}>
          <Result
            status="error"
            title="Something went wrong"
            subTitle="Please refresh the page or try again later."
            extra={
              <Button type="primary" onClick={() => window.location.reload()}>
                Refresh Page
              </Button>
            }
          />
        </div>
      );
    }
  };

  const renderDashboard = () => (
    <div className="dashboard-content">
      <Title level={2} style={{ marginBottom: 24 }}>Dashboard Overview</Title>
      
      {/* Main Summary Cards */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="Total Paid Amount"
              value={stats.totalPaidAmount}
              prefix="Rs."
              valueStyle={{ color: '#1890ff' }}
            />
            <Progress 
              percent={100} 
              showInfo={false} 
              strokeColor="#1890ff" 
              trailColor="#f0f0f0"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="Total Users"
              value={stats.totalUsers}
              valueStyle={{ color: '#52c41a' }}
            />
            <Progress 
              percent={100} 
              showInfo={false} 
              strokeColor="#52c41a" 
              trailColor="#f0f0f0"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="Total Flats"
              value={stats.totalFlats}
              suffix={`(${stats.flatsPercentage}%)`}
              valueStyle={{ color: '#faad14' }}
            />
            <Progress 
              percent={parseFloat(stats.flatsPercentage)} 
              showInfo={false} 
              strokeColor="#faad14" 
              trailColor="#f0f0f0"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false}>
            <Statistic
              title="Total Shops"
              value={stats.totalShops}
              suffix={`(${stats.shopsPercentage}%)`}
              valueStyle={{ color: '#f5222d' }}
            />
            <Progress 
              percent={parseFloat(stats.shopsPercentage)} 
              showInfo={false} 
              strokeColor="#f5222d" 
              trailColor="#f0f0f0"
            />
          </Card>
        </Col>
      </Row>

      {/* Block-wise Statistics */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Card title="Block-wise Statistics" bordered={false}>
            <Row gutter={16}>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ backgroundColor: '#f6ffed' }}>
                  <Statistic
                    title="Block A"
                    value={stats.blockA}
                    prefix="Rs."
                    valueStyle={{ color: '#1890ff' }}
                  />
                  <Text type="secondary">{stats.blockAUsers} Users ({stats.blockAPercentage}%)</Text>
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ backgroundColor: '#f6ffed' }}>
                  <Statistic
                    title="Block B"
                    value={stats.blockB}
                    prefix="Rs."
                    valueStyle={{ color: '#52c41a' }}
                  />
                  <Text type="secondary">{stats.blockBUsers} Users ({stats.blockBPercentage}%)</Text>
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ backgroundColor: '#fff7e6' }}>
                  <Statistic
                    title="Block C"
                    value={stats.blockC}
                    prefix="Rs."
                    valueStyle={{ color: '#faad14' }}
                  />
                  <Text type="secondary">{stats.blockCUsers} Users ({stats.blockCPercentage}%)</Text>
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" bordered={false} style={{ backgroundColor: '#fff1f0' }}>
                  <Statistic
                    title="Block D"
                    value={stats.blockD}
                    prefix="Rs."
                    valueStyle={{ color: '#f5222d' }}
                  />
                  <Text type="secondary">{stats.blockDUsers} Users ({stats.blockDPercentage}%)</Text>
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Property Distribution and User Distribution */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={24}>
          {/* <Card title="Property Distribution" bordered={false}>
            <Row gutter={16}>
              <Col span={12}>
                <Statistic
                  title="Flats"
                  value={stats.totalFlats}
                  suffix={`(${stats.flatsPercentage}%)`}
                  valueStyle={{ color: '#1890ff' }}
                />
                <Progress 
                  percent={parseFloat(stats.flatsPercentage)} 
                  showInfo={false} 
                  strokeColor="#1890ff" 
                  trailColor="#f0f0f0"
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Shops"
                  value={stats.totalShops}
                  suffix={`(${stats.shopsPercentage}%)`}
                  valueStyle={{ color: '#13c2c2' }}
                />
                <Progress 
                  percent={parseFloat(stats.shopsPercentage)} 
                  showInfo={false} 
                  strokeColor="#13c2c2" 
                  trailColor="#f0f0f0"
                />
              </Col>
            </Row>
          </Card> */}
        </Col>
        <Col span={24}>
          <Card title="User Distribution by Block" bordered={false}>
            
            {/* Pie Chart Visualization */}
            <div style={{ 
              width: '150px', 
              height: '150px', 
              borderRadius: '50%', 
              background: `conic-gradient(
                #1890ff 0deg ${parseFloat(stats.blockAPercentage) * 3.6}deg,
                #52c41a ${parseFloat(stats.blockAPercentage) * 3.6}deg ${(parseFloat(stats.blockAPercentage) + parseFloat(stats.blockBPercentage)) * 3.6}deg,
                #faad14 ${(parseFloat(stats.blockAPercentage) + parseFloat(stats.blockBPercentage)) * 3.6}deg ${(parseFloat(stats.blockAPercentage) + parseFloat(stats.blockBPercentage) + parseFloat(stats.blockCPercentage)) * 3.6}deg,
                #f5222d ${(parseFloat(stats.blockAPercentage) + parseFloat(stats.blockBPercentage) + parseFloat(stats.blockCPercentage)) * 3.6}deg 360deg
              )`,
              margin: '0 auto 20px auto',
              position: 'relative',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                fontWeight: 'bold',
                color: '#333'
              }}>
                {stats.totalUsers} Users
              </div>
            </div>
            
            {/* Legend */}
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#1890ff' }}></div>
                <span style={{ fontSize: '12px' }}>Block A</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#52c41a' }}></div>
                <span style={{ fontSize: '12px' }}>Block B</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#faad14' }}></div>
                <span style={{ fontSize: '12px' }}>Block C</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#f5222d' }}></div>
                <span style={{ fontSize: '12px' }}>Block D</span>
              </div>
            </div>
            
            {/* Progress Bars */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ color: '#1890ff', fontWeight: 500, fontSize: '12px' }}>Block A</span>
                <span style={{ fontSize: '12px' }}>{stats.blockAUsers} ({stats.blockAPercentage}%)</span>
              </div>
              <Progress 
                percent={parseFloat(stats.blockAPercentage)} 
                strokeColor="#1890ff" 
                trailColor="#f0f0f0"
                showInfo={false}
                strokeWidth={12}
              />
            </div>
            
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ color: '#52c41a', fontWeight: 500, fontSize: '12px' }}>Block B</span>
                <span style={{ fontSize: '12px' }}>{stats.blockBUsers} ({stats.blockBPercentage}%)</span>
              </div>
              <Progress 
                percent={parseFloat(stats.blockBPercentage)} 
                strokeColor="#52c41a" 
                trailColor="#f0f0f0"
                showInfo={false}
                strokeWidth={12}
              />
            </div>
            
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ color: '#faad14', fontWeight: 500, fontSize: '12px' }}>Block C</span>
                <span style={{ fontSize: '12px' }}>{stats.blockCUsers} ({stats.blockCPercentage}%)</span>
              </div>
              <Progress 
                percent={parseFloat(stats.blockCPercentage)} 
                strokeColor="#faad14" 
                trailColor="#f0f0f0"
                showInfo={false}
                strokeWidth={12}
              />
            </div>
            
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ color: '#f5222d', fontWeight: 500, fontSize: '12px' }}>Block D</span>
                <span style={{ fontSize: '12px' }}>{stats.blockDUsers} ({stats.blockDPercentage}%)</span>
              </div>
              <Progress 
                percent={parseFloat(stats.blockDPercentage)} 
                strokeColor="#f5222d" 
                trailColor="#f0f0f0"
                showInfo={false}
                strokeWidth={12}
              />
            </div>
          </Card>
        </Col>
      </Row>

      {/* Payment Statistics */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Card title="Payment Statistics" bordered={false}>
            <Row gutter={16}>
              <Col span={12}>
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <h3 style={{ color: '#faad14', marginBottom: '20px' }}>Flats vs Shops Payment</h3>
                  
                  {/* Bar Chart */}
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'flex-end', 
                    justifyContent: 'center', 
                    gap: '40px', 
                    height: '200px',
                    marginBottom: '20px'
                  }}>
                    {/* Flats Bar */}
                    <div style={{ textAlign: 'center' }}>
                      <div style={{
                        width: '60px',
                        height: `${Math.max(20, (stats.flatsPaidAmount / Math.max(stats.flatsPaidAmount, stats.shopsPaidAmount)) * 150)}px`,
                        backgroundColor: '#faad14',
                        borderRadius: '8px 8px 0 0',
                        marginBottom: '10px',
                        boxShadow: '0 4px 12px rgba(250, 173, 20, 0.3)',
                        transition: 'all 0.3s ease'
                      }}></div>
                      <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#faad14' }}>Flats</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>Rs. {stats.flatsPaidAmount.toLocaleString()}</div>
                    </div>
                    
                    {/* Shops Bar */}
                    <div style={{ textAlign: 'center' }}>
                      <div style={{
                        width: '60px',
                        height: `${Math.max(20, (stats.shopsPaidAmount / Math.max(stats.flatsPaidAmount, stats.shopsPaidAmount)) * 150)}px`,
                        backgroundColor: '#f5222d',
                        borderRadius: '8px 8px 0 0',
                        marginBottom: '10px',
                        boxShadow: '0 4px 12px rgba(245, 34, 45, 0.3)',
                        transition: 'all 0.3s ease'
                      }}></div>
                      <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#f5222d' }}>Shops</div>
                      <div style={{ fontSize: '12px', color: '#666' }}>Rs. {stats.shopsPaidAmount.toLocaleString()}</div>
                    </div>
                  </div>
                  
                  {/* Legend */}
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '12px', height: '12px', backgroundColor: '#faad14', borderRadius: '2px' }}></div>
                      <span style={{ fontSize: '12px' }}>Flats: {stats.totalFlats} properties</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '12px', height: '12px', backgroundColor: '#f5222d', borderRadius: '2px' }}></div>
                      <span style={{ fontSize: '12px' }}>Shops: {stats.totalShops} properties</span>
                    </div>
                  </div>
                </div>
              </Col>
              
              <Col span={12}>
                <div style={{ padding: '20px' }}>
                  <h3 style={{ color: '#333', marginBottom: '20px', textAlign: 'center' }}>Payment Summary</h3>
                  
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ color: '#faad14', fontWeight: 500 }}>Flats Paid Amount</span>
                      <span style={{ fontWeight: 'bold' }}>Rs. {stats.flatsPaidAmount.toLocaleString()}</span>
                    </div>
                    <div style={{ 
                      width: '100%', 
                      height: '8px', 
                      backgroundColor: '#f0f0f0', 
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <div style={{ 
                        width: `${stats.totalPaidAmount > 0 ? (stats.flatsPaidAmount / stats.totalPaidAmount) * 100 : 0}%`, 
                        height: '100%', 
                        backgroundColor: '#faad14',
                        transition: 'width 0.5s ease'
                      }}></div>
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ color: '#f5222d', fontWeight: 500 }}>Shops Paid Amount</span>
                      <span style={{ fontWeight: 'bold' }}>Rs. {stats.shopsPaidAmount.toLocaleString()}</span>
                    </div>
                    <div style={{ 
                      width: '100%', 
                      height: '8px', 
                      backgroundColor: '#f0f0f0', 
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <div style={{ 
                        width: `${stats.totalPaidAmount > 0 ? (stats.shopsPaidAmount / stats.totalPaidAmount) * 100 : 0}%`, 
                        height: '100%', 
                        backgroundColor: '#f5222d',
                        transition: 'width 0.5s ease'
                      }}></div>
                    </div>
                  </div>
                  
                  <div style={{ 
                    padding: '16px', 
                    backgroundColor: '#f6ffed', 
                    borderRadius: '8px', 
                    border: '1px solid #b7eb8f',
                    marginTop: '20px'
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#52c41a', marginBottom: '4px' }}>
                        Total Paid Amount
                      </div>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1890ff' }}>
                        Rs. {stats.totalPaidAmount.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* User's Personal Stats */}
      <Divider orientation="left">Your Statistics</Divider>
      <Row gutter={16}>
        <Col span={8}>
          <Card bordered={false}>
            <Statistic
              title="Your Paid Amount"
              value={parseFloat(userData?.paidAmount) || 0}
              prefix="Rs."
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false}>
            <Statistic
              title="Your Property"
              value={userData?.category || 'Not set'}
              valueStyle={{ color: '#13c2c2' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false}>
            <Statistic
              title="Your Block"
              value={userData?.block ? `Block ${userData.block}` : 'Not set'}
              valueStyle={{ color: '#eb2f96' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );

  const renderProfile = () => (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2}>Profile Information</Title>
        <Button type="primary" onClick={handleEdit} icon={<EditOutlined />}>
          Edit Profile
        </Button>
      </div>
      
      <Row gutter={24}>
        <Col span={16}>
          <Card title="Personal Information" bordered={false} style={{ marginBottom: 24 }}>
            <Row gutter={16}>
              <Col span={12}>
                <div style={{ marginBottom: 16 }}>
                  <Text strong style={{ color: '#666', fontSize: 14 }}>Full Name</Text>
                  <div style={{ fontSize: 16, marginTop: 4, color: '#333' }}>
                    {userData?.name || 'Not provided'}
                  </div>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ marginBottom: 16 }}>
                  <Text strong style={{ color: '#666', fontSize: 14 }}>Username</Text>
                  <div style={{ fontSize: 16, marginTop: 4, color: '#333' }}>
                    {userData?.username || 'Not provided'}
                  </div>
                </div>
              </Col>
            </Row>
            
            <Row gutter={16}>
              <Col span={12}>
                <div style={{ marginBottom: 16 }}>
                  <Text strong style={{ color: '#666', fontSize: 14 }}>Email</Text>
                  <div style={{ fontSize: 16, marginTop: 4, color: '#333' }}>
                    {userData?.email || 'Not provided'}
                  </div>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ marginBottom: 16 }}>
                  <Text strong style={{ color: '#666', fontSize: 14 }}>Phone Number</Text>
                  <div style={{ fontSize: 16, marginTop: 4, color: '#333' }}>
                    {userData?.phone || 'Not provided'}
                  </div>
                </div>
              </Col>
            </Row>
            
            <Row gutter={16}>
              <Col span={12}>
                <div style={{ marginBottom: 16 }}>
                  <Text strong style={{ color: '#666', fontSize: 14 }}>NIC Number</Text>
                  <div style={{ fontSize: 16, marginTop: 4, color: '#333' }}>
                    {userData?.nic || 'Not provided'}
                  </div>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ marginBottom: 16 }}>
                  <Text strong style={{ color: '#666', fontSize: 14 }}>Role</Text>
                  <div style={{ marginTop: 4 }}>
                    <Tag color={userData?.role === 'admin' ? 'red' : 'blue'}>
                      {userData?.role === 'admin' ? 'Administrator' : 'User'}
                    </Tag>
                  </div>
                </div>
              </Col>
            </Row>
          </Card>
          
          <Card title="Property Information" bordered={false} style={{ marginBottom: 24 }}>
            <Row gutter={16}>
              <Col span={8}>
                <div style={{ marginBottom: 16 }}>
                  <Text strong style={{ color: '#666', fontSize: 14 }}>Property Category</Text>
                  <div style={{ marginTop: 4 }}>
                    <Tag color={userData?.category === 'Flat' ? 'orange' : 'green'}>
                      {userData?.category || 'Not set'}
                    </Tag>
                  </div>
                </div>
              </Col>
              <Col span={8}>
                <div style={{ marginBottom: 16 }}>
                  <Text strong style={{ color: '#666', fontSize: 14 }}>Block</Text>
                  <div style={{ marginTop: 4 }}>
                    <Tag color="purple">
                      {userData?.block ? `Block ${userData.block}` : 'Not set'}
                    </Tag>
                  </div>
                </div>
              </Col>
              <Col span={8}>
                <div style={{ marginBottom: 16 }}>
                  <Text strong style={{ color: '#666', fontSize: 14 }}>Property Number</Text>
                  <div style={{ fontSize: 16, marginTop: 4, color: '#333' }}>
                    {userData?.no || 'Not set'}
                  </div>
                </div>
              </Col>
            </Row>
          </Card>
          
          <Card title="Payment Information" bordered={false}>
            <Row gutter={16}>
              <Col span={8}>
                <div style={{ marginBottom: 16 }}>
                  <Text strong style={{ color: '#666', fontSize: 14 }}>Down Payment</Text>
                  <div style={{ fontSize: 16, marginTop: 4, color: '#333' }}>
                    Rs. {(parseFloat(userData?.downPayment) || 0).toLocaleString()}
                  </div>
                </div>
              </Col>
              <Col span={8}>
                <div style={{ marginBottom: 16 }}>
                  <Text strong style={{ color: '#666', fontSize: 14 }}>Paid Amount</Text>
                  <div style={{ fontSize: 18, marginTop: 4, color: '#1890ff', fontWeight: 'bold' }}>
                    Rs. {(parseFloat(userData?.paidAmount) || 0).toLocaleString()}
                  </div>
                </div>
              </Col>
              <Col span={8}>
                <div style={{ marginBottom: 16 }}>
                  <Text strong style={{ color: '#666', fontSize: 14 }}>Payment Type</Text>
                  <div style={{ marginTop: 4 }}>
                    <Tag color={userData?.paymentType === 'Cash' ? 'green' : 'blue'}>
                      {userData?.paymentType || 'Not set'}
                    </Tag>
                  </div>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
        
        <Col span={8}>
          <Card title="Profile Summary" bordered={false}>
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <Avatar size={80} style={{ backgroundColor: '#1890ff', marginBottom: 16 }}>
                {userData?.name?.[0]?.toUpperCase() || 'U'}
              </Avatar>
              <Title level={3} style={{ marginBottom: 8 }}>
                {userData?.name || 'User Name'}
              </Title>
              <Text type="secondary" style={{ fontSize: 16, marginBottom: 16, display: 'block' }}>
                {userData?.username || 'username'}
              </Text>
              
              <Divider />
              
              <div style={{ textAlign: 'left' }}>
                <div style={{ marginBottom: 12 }}>
                  <Text strong>Status:</Text>
                  <Tag color="green" style={{ marginLeft: 8 }}>Active</Tag>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <Text strong>Member Since:</Text>
                  <div style={{ marginTop: 4, color: '#666' }}>
                    {userData?.createdAt ? new Date(userData.createdAt.toDate()).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <Text strong>Last Updated:</Text>
                  <div style={{ marginTop: 4, color: '#666' }}>
                    {userData?.updatedAt ? new Date(userData.updatedAt.toDate()).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          </Card>
          
          <Card title="Quick Actions" bordered={false} style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Button 
                type="primary" 
                icon={<EditOutlined />} 
                onClick={handleEdit}
                block
              >
                Edit Profile
              </Button>
            
              <Button 
                icon={<DashboardOutlined />} 
                onClick={() => setActiveTab('dashboard')}
                block
              >
                Go to Dashboard
              </Button>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );

  return (
    <Layout>
      {/* Sidebar */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={250}
        className="sidebar"
        breakpoint="lg"
        collapsedWidth="80"
        style={{
          backgroundColor: '#001529',
          height: '100vh',
          overflow: 'auto',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 1000,
        }}
      >
        {/* Sidebar Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'start',
            padding: '16px',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <Avatar size={collapsed ? 40 : 48} style={{ backgroundColor: '#1890ff' }}>
            {userData?.name?.[0]?.toUpperCase() || 'U'}
          </Avatar>
          {!collapsed && (
            <div style={{ marginLeft: 12 }}>
              <Text style={{ color: '#fff', fontSize: 16 }}>
                {userData?.name || 'User'}
              </Text>
              <div>
                <Text type="secondary" style={{ fontSize: 12, color: '#ccc' }}>
                  {userData?.category || 'Member'}
                </Text>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Menu */}
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[activeTab]}
          onSelect={({ key }) => handleTabChange(key)}
          style={{ marginTop: 16 }}
          items={[
            {
              key: 'dashboard',
              icon: <DashboardOutlined />,
              label: 'Dashboard',
            },
            {
              key: 'profile',
              icon: <UserOutlined />,
              label: 'Profile',
            },
           
            ...(userData?.role === 'admin'
              ? [
                  {
                    key: 'admin',
                    icon: <HomeOutlined />,
                    label: 'Admin Panel',
                    onClick: () => navigate('/admin'),
                  },
                ]
              : []),
            {
              key: 'logout',
              icon: <LogoutOutlined />,
              label: 'Logout',
              onClick: handleLogout,
              style: { marginTop: 'auto' },
            },
          ]}
        />
      </Sider>

      {/* Main Layout */}
      <Layout style={{ marginLeft: collapsed ? 80 : 250, minHeight: '100vh', transition: 'all 0.2s ease-in-out' }}>
        <Header style={{ background: '#1890ff', padding: '0 24px', display: 'flex', alignItems: 'center' }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: '18px', color: '#fff' }}
          />
          <Title level={4} style={{ color: '#fff', margin: '0 16px' }}>
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
          </Title>
        </Header>
        <Content style={{ margin: '24px 16px', overflow: 'initial' }}>
          {loading ? <Spin size="large" /> : renderContent()}
        </Content>
      </Layout>

      {/* Edit Modal */}
      <Modal
        title="Edit Profile"
        visible={showEditModal}
        onCancel={handleCancel}
        onOk={handleSave}
        okText="Save"
        cancelText="Cancel"
        width="90%"
        style={{ 
          maxWidth: '600px',
          top: window.innerWidth <= 768 ? 0 : 20,
          margin: window.innerWidth <= 768 ? 0 : '0 auto',
          height: window.innerWidth <= 768 ? '100vh' : 'auto',
          maxHeight: window.innerWidth <= 768 ? '100vh' : '90vh'
        }}
        bodyStyle={{ 
          maxHeight: '60vh',
          overflowY: 'auto',
          padding: '24px'
        }}
        confirmLoading={loading}
        okButtonProps={{ disabled: loading }}
        cancelButtonProps={{ disabled: loading }}
        destroyOnClose={true}
      >
        <div style={{ 
          minHeight: window.innerWidth <= 768 ? 'calc(100vh - 200px)' : 'auto',
          paddingBottom: window.innerWidth <= 768 ? '20px' : '0'
        }}>
          <Form form={form} layout="vertical" size={window.innerWidth <= 768 ? "small" : "default"}>
            <Row gutter={window.innerWidth <= 768 ? 8 : 16}>
              <Col span={window.innerWidth <= 768 ? 24 : 12}>
                <Form.Item name="name" label="Name" rules={[{ required: true }]}>
                  <Input disabled={loading} />
                </Form.Item>
              </Col>
              <Col span={window.innerWidth <= 768 ? 24 : 12}>
                <Form.Item name="phone" label="Phone" rules={[{ required: true }]}>
                  <Input disabled={loading} />
                </Form.Item>
              </Col>
            </Row>
            
            <Row gutter={window.innerWidth <= 768 ? 8 : 16}>
              <Col span={window.innerWidth <= 768 ? 24 : 12}>
                <Form.Item name="nic" label="NIC">
                  <Input disabled={loading} />
                </Form.Item>
              </Col>
              <Col span={window.innerWidth <= 768 ? 24 : 12}>
                <Form.Item name="no" label="Flat/Shop Number">
                  <Input disabled={loading} />
                </Form.Item>
              </Col>
            </Row>
            
            <Row gutter={window.innerWidth <= 768 ? 8 : 16}>
              <Col span={window.innerWidth <= 768 ? 24 : 12}>
                <Form.Item name="category" label="Category" rules={[{ required: true }]}>
                  <Select disabled={loading}>
                    <Option value="Flat">Flat</Option>
                    <Option value="Shop">Shop</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={window.innerWidth <= 768 ? 24 : 12}>
                <Form.Item name="block" label="Block" rules={[{ required: true }]}>
                  <Select disabled={loading}>
                    <Option value="A">A</Option>
                    <Option value="B">B</Option>
                    <Option value="C">C</Option>
                    <Option value="D">D</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            
            <Row gutter={window.innerWidth <= 768 ? 8 : 16}>
              <Col span={window.innerWidth <= 768 ? 24 : 12}>
                <Form.Item name="downPayment" label="Down Payment">
                  <Input type="number" disabled={loading} />
                </Form.Item>
              </Col>
              <Col span={window.innerWidth <= 768 ? 24 : 12}>
                <Form.Item name="paidAmount" label="Paid Amount">
                  <Input type="number" disabled={loading} />
                </Form.Item>
              </Col>
            </Row>
            
            <Row gutter={window.innerWidth <= 768 ? 8 : 16}>
              <Col span={24}>
                <Form.Item name="paymentType" label="Payment Type">
                  <Select disabled={loading}>
                    <Option value="Cash">Cash</Option>
                    <Option value="Installment">Installment</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </div>
      </Modal>
    </Layout>
  );
};

export default UserPanel;
