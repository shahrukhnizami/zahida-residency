import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { collection, getDocs, doc, updateDoc, deleteDoc, query, where, orderBy, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import * as XLSX from 'xlsx';
import './AdminPanel.css';

const AdminPanel = () => {
  const { currentUser, logout, userRole } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  // All hooks must be called before any conditional returns
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [sortBy, setSortBy] = useState('username');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPaidAmount: 0,
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
    blockA: 0,
    blockB: 0,
    blockC: 0,
    blockD: 0,
    blockAPercentage: 0,
    blockBPercentage: 0,
    blockCPercentage: 0,
    blockDPercentage: 0
  });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [adminData, setAdminData] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    nic: '',
    category: '',
    no: '',
    block: '',
    downPayment: '',
    paidAmount: '',
    paymentType: ''
  });

  // Role-based protection - redirect non-admin users
  useEffect(() => {
    console.log('AdminPanel Protection Check:', {
      currentUser: !!currentUser,
      userRole,
      isAdmin: userRole === 'admin'
    });
    
    if (currentUser && userRole !== 'admin') {
      console.log('Access denied: Non-admin user trying to access AdminPanel');
      navigate('/unauthorized');
      return;
    }
  }, [currentUser, userRole, navigate]);

  useEffect(() => {
    fetchUsers();
    if (currentUser) {
      fetchAdminData();
    }
  }, [currentUser]);

  // Don't render anything if user is not admin
  if (!currentUser || userRole !== 'admin') {
    return null;
  }

  const fetchAdminData = async () => {
    try {
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setAdminData(data);
        setEditForm({
          name: data.name || '',
          phone: data.phone || '',
          nic: data.nic || '',
          category: data.category || '',
          no: data.no || '',
          block: data.block || '',
          downPayment: data.downPayment || '',
          paidAmount: data.paidAmount || '',
          paymentType: data.paymentType || ''
        });
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const usersRef = collection(db, 'users');
      const querySnapshot = await getDocs(usersRef);
      const usersData = [];
      
      let totalPaidAmount = 0;
      let flatsPaidAmount = 0;
      let shopsPaidAmount = 0;
      let totalFlats = 0;
      let totalShops = 0;
      let blockAUsers = 0;
      let blockBUsers = 0;
      let blockCUsers = 0;
      let blockDUsers = 0;
      let blockA = 0;
      let blockB = 0;
      let blockC = 0;
      let blockD = 0;

      querySnapshot.forEach((doc) => {
        const userData = { id: doc.id, ...doc.data() };
        usersData.push(userData);
        
        const paidAmount = parseFloat(userData.paidAmount) || 0;
        totalPaidAmount += paidAmount;
        
        // Block-wise statistics
        switch (userData.block) {
          case 'A':
            blockA += paidAmount;
            blockAUsers++;
            break;
          case 'B':
            blockB += paidAmount;
            blockBUsers++;
            break;
          case 'C':
            blockC += paidAmount;
            blockCUsers++;
            break;
          case 'D':
            blockD += paidAmount;
            blockDUsers++;
            break;
        }
        
        if (userData.category === 'Flat') {
          flatsPaidAmount += paidAmount;
          totalFlats++;
        } else if (userData.category === 'Shop') {
          shopsPaidAmount += paidAmount;
          totalShops++;
        }
      });

      const totalProperties = totalFlats + totalShops;
      const flatsPercentage = totalProperties > 0 ? ((totalFlats / totalProperties) * 100).toFixed(1) : 0;
      const shopsPercentage = totalProperties > 0 ? ((totalShops / totalProperties) * 100).toFixed(1) : 0;

      const totalUsers = blockAUsers + blockBUsers + blockCUsers + blockDUsers;
      const blockAPercentage = totalUsers > 0 ? ((blockAUsers / totalUsers) * 100).toFixed(1) : 0;
      const blockBPercentage = totalUsers > 0 ? ((blockBUsers / totalUsers) * 100).toFixed(1) : 0;
      const blockCPercentage = totalUsers > 0 ? ((blockCUsers / totalUsers) * 100).toFixed(1) : 0;
      const blockDPercentage = totalUsers > 0 ? ((blockDUsers / totalUsers) * 100).toFixed(1) : 0;

      setUsers(usersData);
      setStats({
        totalUsers: usersData.length,
        totalPaidAmount,
        flatsPaidAmount,
        shopsPaidAmount,
        totalFlats,
        totalShops,
        flatsPercentage,
        shopsPercentage,
        blockAUsers,
        blockBUsers,
        blockCUsers,
        blockDUsers,
        blockA,
        blockB,
        blockC,
        blockD,
        blockAPercentage,
        blockBPercentage,
        blockCPercentage,
        blockDPercentage
      });
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleUpdateUser = async (userId, updates) => {
    try {
      await updateDoc(doc(db, 'users', userId), updates);
      setUsers(users.map(user => 
        user.id === userId ? { ...user, ...updates } : user
      ));
      setShowUserModal(false);
      fetchUsers(); // Refresh stats
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await deleteDoc(doc(db, 'users', userId));
        setUsers(users.filter(user => user.id !== userId));
        setShowUserModal(false);
        fetchUsers(); // Refresh stats
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const handleProfileEdit = () => {
    setShowProfileModal(true);
  };

  const handleProfileSave = async () => {
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), editForm);
      setAdminData({ ...adminData, ...editForm });
      setShowProfileModal(false);
    } catch (error) {
      console.error('Error updating admin profile:', error);
    }
  };

  const handleProfileCancel = () => {
    setShowProfileModal(false);
    fetchAdminData(); // Reset form data
  };

  const exportToExcel = () => {
    // Prepare data for export
    const exportData = filteredUsers.map(user => ({
      'Username': user.username || 'N/A',
      'Name': user.name || 'N/A',
      'Email': user.email || 'N/A',
      'Role': user.role || 'user',
      'Category': user.category || 'N/A',
      'Shop/Flat Number': user.no || 'N/A',
      'Block': user.block || 'N/A',
      'Phone': user.phone || 'N/A',
      'NIC': user.nic || 'N/A',
      'Down Payment': user.downPayment || '0',
      'Paid Amount': user.paidAmount || '0',
      'Payment Type': user.paymentType || 'N/A',
      'Created At': user.createdAt ? new Date(user.createdAt.toDate()).toLocaleString() : 'N/A',
      'Updated At': user.updatedAt ? new Date(user.updatedAt.toDate()).toLocaleString() : 'N/A'
    }));

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // Set column widths
    const columnWidths = [
      { wch: 15 }, // Username
      { wch: 20 }, // Name
      { wch: 25 }, // Email
      { wch: 10 }, // Role
      { wch: 12 }, // Category
      { wch: 15 }, // Shop/Flat Number
      { wch: 8 },  // Block
      { wch: 15 }, // Phone
      { wch: 15 }, // NIC
      { wch: 15 }, // Down Payment
      { wch: 15 }, // Paid Amount
      { wch: 15 }, // Payment Type
      { wch: 20 }, // Created At
      { wch: 20 }  // Updated At
    ];
    worksheet['!cols'] = columnWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');

    // Generate filename with current date
    const date = new Date().toISOString().split('T')[0];
    const filename = `Zahida_Residency_Users_${date}.xlsx`;

    // Save file
    XLSX.writeFile(workbook, filename);
  };

  const filteredUsers = users
    .filter(user => {
      const matchesSearch = user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = filterRole === 'all' || user.role === filterRole;
      return matchesSearch && matchesRole;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'username':
          return (a.username || '').localeCompare(b.username || '');
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'role':
          return (a.role || '').localeCompare(b.role || '');
        case 'paidAmount':
          return (parseFloat(b.paidAmount) || 0) - (parseFloat(a.paidAmount) || 0);
        default:
          return 0;
      }
    });

  const renderDashboard = () => (
    <div className="dashboard-content">
      <div className="admin-header">
        <h1>
          <span role="img" aria-label="admin">🛡️</span> Admin Dashboard
          <span className="admin-badge">Administrator</span>
        </h1>
        <button className="logout-btn" onClick={handleLogout}>
          <span role="img" aria-label="logout">🚪</span> Logout
        </button>
      </div>

      {/* Main Stats Section */}
      <div className="stats-section">
        <div className="stat-card">
          <h3><span className="stat-icon" role="img" aria-label="users">👥</span> Total Users</h3>
          <p className="stat-value">{stats.totalUsers}</p>
        </div>
        <div className="stat-card">
          <h3><span className="stat-icon" role="img" aria-label="money">💰</span> Total Paid Amount</h3>
          <p className="stat-value">Rs. {stats.totalPaidAmount.toLocaleString()}</p>
        </div>
        <div className="stat-card">
          <h3><span className="stat-icon" role="img" aria-label="flat">🏢</span> Flats Paid Amount</h3>
          <p className="stat-value">Rs. {stats.flatsPaidAmount.toLocaleString()}</p>
        </div>
        <div className="stat-card">
          <h3><span className="stat-icon" role="img" aria-label="shop">🏬</span> Shops Paid Amount</h3>
          <p className="stat-value">Rs. {stats.shopsPaidAmount.toLocaleString()}</p>
        </div>
        <div className="stat-card">
          <h3><span className="stat-icon" role="img" aria-label="flat-count">🏢</span> Total Flats</h3>
          <p className="stat-value">{stats.totalFlats} ({stats.flatsPercentage}%)</p>
        </div>
        <div className="stat-card">
          <h3><span className="stat-icon" role="img" aria-label="shop-count">🏬</span> Total Shops</h3>
          <p className="stat-value">{stats.totalShops} ({stats.shopsPercentage}%)</p>
        </div>
      </div>

      {/* Block-wise Statistics Section */}
      <div className="stats-section">
        <h3 className="section-title">
          <span role="img" aria-label="blocks">🏗️</span> Block-wise Statistics
        </h3>
        <div className="stats-grid">
          <div className="stat-card">
            <h3><span className="stat-icon" role="img" aria-label="block-a">🏢</span> Block A</h3>
            <p className="stat-value">Rs. {stats.blockA.toLocaleString()}</p>
            <p className="stat-subtitle">{stats.blockAUsers} Users ({stats.blockAPercentage}%)</p>
          </div>
          <div className="stat-card">
            <h3><span className="stat-icon" role="img" aria-label="block-b">🏢</span> Block B</h3>
            <p className="stat-value">Rs. {stats.blockB.toLocaleString()}</p>
            <p className="stat-subtitle">{stats.blockBUsers} Users ({stats.blockBPercentage}%)</p>
          </div>
          <div className="stat-card">
            <h3><span className="stat-icon" role="img" aria-label="block-c">🏢</span> Block C</h3>
            <p className="stat-value">Rs. {stats.blockC.toLocaleString()}</p>
            <p className="stat-subtitle">{stats.blockCUsers} Users ({stats.blockCPercentage}%)</p>
          </div>
          <div className="stat-card">
            <h3><span className="stat-icon" role="img" aria-label="block-d">🏢</span> Block D</h3>
            <p className="stat-value">Rs. {stats.blockD.toLocaleString()}</p>
            <p className="stat-subtitle">{stats.blockDUsers} Users ({stats.blockDPercentage}%)</p>
          </div>
        </div>
      </div>

      {/* Additional Statistics */}
      <div className="stats-section">
        <h3 className="section-title">
          <span role="img" aria-label="analytics">📊</span> Additional Statistics
        </h3>
        <div className="stats-grid">
          <div className="stat-card">
            <h3><span className="stat-icon" role="img" aria-label="average">📈</span> Average per User</h3>
            <p className="stat-value">Rs. {stats.totalUsers > 0 ? Math.round(stats.totalPaidAmount / stats.totalUsers).toLocaleString() : '0'}</p>
          </div>
          <div className="stat-card">
            <h3><span className="stat-icon" role="img" aria-label="flats-avg">🏢</span> Average per Flat</h3>
            <p className="stat-value">Rs. {stats.totalFlats > 0 ? Math.round(stats.flatsPaidAmount / stats.totalFlats).toLocaleString() : '0'}</p>
          </div>
          <div className="stat-card">
            <h3><span className="stat-icon" role="img" aria-label="shops-avg">🏬</span> Average per Shop</h3>
            <p className="stat-value">Rs. {stats.totalShops > 0 ? Math.round(stats.shopsPaidAmount / stats.totalShops).toLocaleString() : '0'}</p>
          </div>
          <div className="stat-card">
            <h3><span className="stat-icon" role="img" aria-label="total-properties">🏘️</span> Total Properties</h3>
            <p className="stat-value">{stats.totalFlats + stats.totalShops}</p>
          </div>
        </div>
      </div>

      {/* User Distribution Summary */}
      <div className="stats-section">
        <h3 className="section-title">
          <span role="img" aria-label="distribution">📋</span> User Distribution Summary
        </h3>
        <div className="stats-grid">
          <div className="stat-card">
            <h3><span className="stat-icon" role="img" aria-label="block-a-users">👥</span> Block A Users</h3>
            <p className="stat-value">{stats.blockAUsers}</p>
            <p className="stat-subtitle">{stats.blockAPercentage}% of total</p>
          </div>
          <div className="stat-card">
            <h3><span className="stat-icon" role="img" aria-label="block-b-users">👥</span> Block B Users</h3>
            <p className="stat-value">{stats.blockBUsers}</p>
            <p className="stat-subtitle">{stats.blockBPercentage}% of total</p>
          </div>
          <div className="stat-card">
            <h3><span className="stat-icon" role="img" aria-label="block-c-users">👥</span> Block C Users</h3>
            <p className="stat-value">{stats.blockCUsers}</p>
            <p className="stat-subtitle">{stats.blockCPercentage}% of total</p>
          </div>
          <div className="stat-card">
            <h3><span className="stat-icon" role="img" aria-label="block-d-users">👥</span> Block D Users</h3>
            <p className="stat-value">{stats.blockDUsers}</p>
            <p className="stat-subtitle">{stats.blockDPercentage}% of total</p>
          </div>
        </div>
      </div>

      {/* Block Distribution Chart */}
      <div className="stats-section">
        <h3 className="section-title">
          <span role="img" aria-label="chart">📊</span> Block Distribution Chart
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'center', alignItems: 'flex-start' }}>
          {/* Pie Chart */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              width: '200px', 
              height: '200px', 
              borderRadius: '50%', 
              background: `conic-gradient(
                #1890ff 0deg ${parseFloat(stats.blockAPercentage) * 3.6}deg,
                #52c41a ${parseFloat(stats.blockAPercentage) * 3.6}deg ${(parseFloat(stats.blockAPercentage) + parseFloat(stats.blockBPercentage)) * 3.6}deg,
                #faad14 ${(parseFloat(stats.blockAPercentage) + parseFloat(stats.blockBPercentage)) * 3.6}deg ${(parseFloat(stats.blockAPercentage) + parseFloat(stats.blockBPercentage) + parseFloat(stats.blockCPercentage)) * 3.6}deg,
                #f5222d ${(parseFloat(stats.blockAPercentage) + parseFloat(stats.blockBPercentage) + parseFloat(stats.blockCPercentage)) * 3.6}deg 360deg
              )`,
              margin: '0 auto 20px auto',
              position: 'relative',
              boxShadow: '0 6px 20px rgba(0,0,0,0.15)'
            }}>
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: 'bold',
                color: '#333',
                boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.1)'
              }}>
                {stats.totalUsers} Users
              </div>
            </div>
            
            {/* Legend */}
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '16px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#1890ff' }}></div>
                <span>Block A</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#52c41a' }}></div>
                <span>Block B</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#faad14' }}></div>
                <span>Block C</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#f5222d' }}></div>
                <span>Block D</span>
              </div>
            </div>
          </div>

          {/* Progress Bars */}
          <div style={{ flex: 1, minWidth: '300px' }}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ color: '#1890ff', fontWeight: 500 }}>Block A</span>
                <span>{stats.blockAUsers} users ({stats.blockAPercentage}%)</span>
              </div>
              <div style={{ 
                width: '100%', 
                height: '20px', 
                backgroundColor: '#f0f0f0', 
                borderRadius: '10px',
                overflow: 'hidden'
              }}>
                <div style={{ 
                  width: `${stats.blockAPercentage}%`, 
                  height: '100%', 
                  backgroundColor: '#1890ff',
                  transition: 'width 0.5s ease'
                }}></div>
              </div>
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ color: '#52c41a', fontWeight: 500 }}>Block B</span>
                <span>{stats.blockBUsers} users ({stats.blockBPercentage}%)</span>
              </div>
              <div style={{ 
                width: '100%', 
                height: '20px', 
                backgroundColor: '#f0f0f0', 
                borderRadius: '10px',
                overflow: 'hidden'
              }}>
                <div style={{ 
                  width: `${stats.blockBPercentage}%`, 
                  height: '100%', 
                  backgroundColor: '#52c41a',
                  transition: 'width 0.5s ease'
                }}></div>
              </div>
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ color: '#faad14', fontWeight: 500 }}>Block C</span>
                <span>{stats.blockCUsers} users ({stats.blockCPercentage}%)</span>
              </div>
              <div style={{ 
                width: '100%', 
                height: '20px', 
                backgroundColor: '#f0f0f0', 
                borderRadius: '10px',
                overflow: 'hidden'
              }}>
                <div style={{ 
                  width: `${stats.blockCPercentage}%`, 
                  height: '100%', 
                  backgroundColor: '#faad14',
                  transition: 'width 0.5s ease'
                }}></div>
              </div>
            </div>
            
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ color: '#f5222d', fontWeight: 500 }}>Block D</span>
                <span>{stats.blockDUsers} users ({stats.blockDPercentage}%)</span>
              </div>
              <div style={{ 
                width: '100%', 
                height: '20px', 
                backgroundColor: '#f0f0f0', 
                borderRadius: '10px',
                overflow: 'hidden'
              }}>
                <div style={{ 
                  width: `${stats.blockDPercentage}%`, 
                  height: '100%', 
                  backgroundColor: '#f5222d',
                  transition: 'width 0.5s ease'
                }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="stats-section">
        <h3 className="section-title">
          <span role="img" aria-label="actions">⚡</span> Quick Actions
        </h3>
        <div className="quick-actions">
          <button 
            className="action-btn"
            onClick={() => setActiveTab('users')}
          >
            <span role="img" aria-label="users">👥</span> Manage Users
          </button>
          <button 
            className="action-btn"
            onClick={() => setActiveTab('reports')}
          >
            <span role="img" aria-label="reports">📈</span> View Reports
          </button>
          <button 
            className="action-btn"
            onClick={() => setActiveTab('profile')}
          >
            <span role="img" aria-label="profile">👤</span> Edit Profile
          </button>
          <button 
            className="action-btn"
            onClick={() => window.location.href = '/user'}
          >
            <span role="img" aria-label="user-panel">👤</span> User Panel
          </button>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="users-content">
      <div className="top-bar">
        <h1>
          <span role="img" aria-label="users">👥</span> User Management
        </h1>
        <button className="sidebar-toggle-mobile" onClick={() => setSidebarOpen(!sidebarOpen)}>
          ☰
        </button>
      </div>

      {/* Controls Section */}
      <div className="controls-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search users by name, username, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filters">
          <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
          
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="username">Sort by Username</option>
            <option value="name">Sort by Name</option>
            <option value="role">Sort by Role</option>
            <option value="paidAmount">Sort by Paid Amount</option>
          </select>

          <button 
            className="export-btn" 
            onClick={exportToExcel}
            title="Export to Excel"
          >
            <span role="img" aria-label="export">📊</span> Export to Excel
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="users-table-container">
        {filteredUsers.length === 0 ? (
          <div className="no-users">
            <p>No users found matching your criteria.</p>
          </div>
        ) : (
          <table className="users-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Category</th>
                <th>Shop/Flat No</th>
                <th>Block</th>
                <th>Paid Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} onClick={() => handleUserClick(user)}>
                  <td>{user.username || 'N/A'}</td>
                  <td>{user.name || 'N/A'}</td>
                  <td>{user.email || 'N/A'}</td>
                  <td>
                    <span className={`role-badge ${user.role}`}>
                      {user.role || 'user'}
                    </span>
                  </td>
                  <td>{user.category || 'N/A'}</td>
                  <td>{user.no || 'N/A'}</td>
                  <td>{user.block || 'N/A'}</td>
                  <td>Rs. {(parseFloat(user.paidAmount) || 0).toLocaleString()}</td>
                  <td>
                    <button className="view-btn">View Details</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="reports-content">
      <div className="top-bar">
        <h1>
          <span role="img" aria-label="reports">📊</span> Reports & Analytics
        </h1>
        <button className="sidebar-toggle-mobile" onClick={() => setSidebarOpen(!sidebarOpen)}>
          ☰
        </button>
      </div>
      
      <div className="stats-section">
        <div className="stat-card">
          <h3><span className="stat-icon" role="img" aria-label="users">👥</span> Total Users</h3>
          <p className="stat-value">{stats.totalUsers}</p>
        </div>
        <div className="stat-card">
          <h3><span className="stat-icon" role="img" aria-label="money">💰</span> Total Paid Amount</h3>
          <p className="stat-value">Rs. {stats.totalPaidAmount.toLocaleString()}</p>
        </div>
        <div className="stat-card">
          <h3><span className="stat-icon" role="img" aria-label="flat">🏢</span> Flats Paid Amount</h3>
          <p className="stat-value">Rs. {stats.flatsPaidAmount.toLocaleString()}</p>
        </div>
        <div className="stat-card">
          <h3><span className="stat-icon" role="img" aria-label="shop">🏬</span> Shops Paid Amount</h3>
          <p className="stat-value">Rs. {stats.shopsPaidAmount.toLocaleString()}</p>
        </div>
        <div className="stat-card">
          <h3><span className="stat-icon" role="img" aria-label="flat-count">🏢</span> Total Flats</h3>
          <p className="stat-value">{stats.totalFlats} ({stats.flatsPercentage}%)</p>
        </div>
        <div className="stat-card">
          <h3><span className="stat-icon" role="img" aria-label="shop-count">🏬</span> Total Shops</h3>
          <p className="stat-value">{stats.totalShops} ({stats.shopsPercentage}%)</p>
        </div>
      </div>
      
      <p>Advanced reports and analytics features will be available here.</p>
    </div>
  );

  const renderSettings = () => (
    <div className="settings-content">
      <div className="top-bar">
        <h1>
          <span role="img" aria-label="settings">⚙️</span> Settings
        </h1>
        <button className="sidebar-toggle-mobile" onClick={() => setSidebarOpen(!sidebarOpen)}>
          ☰
        </button>
      </div>
      
      <p>System settings and configuration options will be available here.</p>
    </div>
  );

  const renderProfile = () => (
    <div className="profile-content">
      <div className="top-bar">
        <h1>
          <span role="img" aria-label="profile">👤</span> My Profile
        </h1>
        <button className="sidebar-toggle-mobile" onClick={() => setSidebarOpen(!sidebarOpen)}>
          ☰
        </button>
      </div>

      <div className="profile-section">
        <div className="profile-header">
          <div className="profile-avatar">
            {adminData?.name ? adminData.name[0].toUpperCase() : currentUser?.email ? currentUser.email[0].toUpperCase() : 'A'}
          </div>
          <div className="profile-info">
            <h2>{adminData?.name || 'Admin User'}</h2>
            <p className="profile-email">{currentUser?.email}</p>
            <span className="role-badge admin">Administrator</span>
          </div>
          <button className="edit-profile-btn" onClick={handleProfileEdit}>
            <span role="img" aria-label="edit">✏️</span> Edit Profile
          </button>
        </div>

        <div className="profile-details">
          <div className="detail-group">
            <label>Username</label>
            <span>{adminData?.username || 'N/A'}</span>
          </div>
          <div className="detail-group">
            <label>Name</label>
            <span>{adminData?.name || 'N/A'}</span>
          </div>
          <div className="detail-group">
            <label>Email</label>
            <span>{adminData?.email || currentUser?.email || 'N/A'}</span>
          </div>
          <div className="detail-group">
            <label>Phone</label>
            <span>{adminData?.phone || 'N/A'}</span>
          </div>
          <div className="detail-group">
            <label>NIC</label>
            <span>{adminData?.nic || 'N/A'}</span>
          </div>
          <div className="detail-group">
            <label>Category</label>
            <span>{adminData?.category || 'N/A'}</span>
          </div>
          <div className="detail-group">
            <label>Shop/Flat Number</label>
            <span>{adminData?.no || 'N/A'}</span>
          </div>
          <div className="detail-group">
            <label>Block</label>
            <span>{adminData?.block || 'N/A'}</span>
          </div>
          <div className="detail-group">
            <label>Down Payment</label>
            <span>Rs. {adminData?.downPayment || '0'}</span>
          </div>
          <div className="detail-group">
            <label>Paid Amount</label>
            <span>Rs. {adminData?.paidAmount || '0'}</span>
          </div>
          <div className="detail-group">
            <label>Payment Type</label>
            <span>{adminData?.paymentType || 'N/A'}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'users':
        return renderUsers();
      case 'reports':
        return renderReports();
      case 'settings':
        return renderSettings();
      case 'profile':
        return renderProfile();
      default:
        return renderDashboard();
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="admin-panel">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="admin-avatar">
            {currentUser?.email ? currentUser.email[0].toUpperCase() : 'A'}
          </div>
          <h3>Admin Panel</h3>
          <div className="admin-role">Administrator</div>
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ✕
          </button>
        </div>
        
        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <span role="img" aria-label="dashboard">📊</span> Dashboard
          </button>
          <button 
            className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <span role="img" aria-label="users">👥</span> Users
          </button>
          <button 
            className={`nav-item ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            <span role="img" aria-label="reports">📈</span> Reports
          </button>
          <button 
            className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <span role="img" aria-label="profile">👤</span> Profile
          </button>
          <button 
            className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <span role="img" aria-label="settings">⚙️</span> Settings
          </button>
          <button 
            className="nav-item"
            onClick={() => navigate('/user')}
          >
            <span role="img" aria-label="user-panel">👤</span> User Panel
          </button>
          <button className="nav-item logout" onClick={handleLogout}>
            <span role="img" aria-label="logout">🚪</span> Logout
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="content-area">
          {renderContent()}
        </div>
      </div>

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>
                <span role="img" aria-label="user">👤</span> User Details
              </h3>
              <button className="close-btn" onClick={() => setShowUserModal(false)}>✕</button>
            </div>
            
            <div className="modal-body">
              <div className="user-details">
                <div className="detail-group">
                  <label>Username</label>
                  <span>{selectedUser.username || 'N/A'}</span>
                </div>
                <div className="detail-group">
                  <label>Name</label>
                  <span>{selectedUser.name || 'N/A'}</span>
                </div>
                <div className="detail-group">
                  <label>Email</label>
                  <span>{selectedUser.email || 'N/A'}</span>
                </div>
                <div className="detail-group">
                  <label>Phone</label>
                  <span>{selectedUser.phone || 'N/A'}</span>
                </div>
                <div className="detail-group">
                  <label>NIC</label>
                  <span>{selectedUser.nic || 'N/A'}</span>
                </div>
                <div className="detail-group">
                  <label>Category</label>
                  <span>{selectedUser.category || 'N/A'}</span>
                </div>
                <div className="detail-group">
                  <label>Shop/Flat Number</label>
                  <span>{selectedUser.no || 'N/A'}</span>
                </div>
                <div className="detail-group">
                  <label>Block</label>
                  <span>{selectedUser.block || 'N/A'}</span>
                </div>
                <div className="detail-group">
                  <label>Down Payment</label>
                  <span>Rs. {selectedUser.downPayment || '0'}</span>
                </div>
                <div className="detail-group">
                  <label>Paid Amount</label>
                  <span>Rs. {selectedUser.paidAmount || '0'}</span>
                </div>
                <div className="detail-group">
                  <label>Payment Type</label>
                  <span>{selectedUser.paymentType || 'N/A'}</span>
                </div>
                <div className="detail-group">
                  <label>Role</label>
                  <span className={`role-badge ${selectedUser.role}`}>
                    {selectedUser.role || 'user'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn-danger" 
                onClick={() => handleDeleteUser(selectedUser.id)}
              >
                <span role="img" aria-label="delete">🗑️</span> Delete User
              </button>
              <button 
                className="btn-secondary" 
                onClick={() => setShowUserModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Edit Modal */}
      {showProfileModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>
                <span role="img" aria-label="edit">✏️</span> Edit Profile
              </h3>
              <button className="close-btn" onClick={() => setShowProfileModal(false)}>✕</button>
            </div>
            
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                    placeholder="Enter your name"
                  />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                    placeholder="Enter phone number"
                  />
                </div>
                <div className="form-group">
                  <label>NIC</label>
                  <input
                    type="text"
                    value={editForm.nic}
                    onChange={(e) => setEditForm({...editForm, nic: e.target.value})}
                    placeholder="Enter NIC number"
                  />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                  >
                    <option value="">Select Category</option>
                    <option value="Flat">Flat</option>
                    <option value="Shop">Shop</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Shop/Flat Number</label>
                  <input
                    type="text"
                    value={editForm.no}
                    onChange={(e) => setEditForm({...editForm, no: e.target.value})}
                    placeholder="Enter property number"
                  />
                </div>
                <div className="form-group">
                  <label>Block</label>
                  <select
                    value={editForm.block}
                    onChange={(e) => setEditForm({...editForm, block: e.target.value})}
                  >
                    <option value="">Select Block</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Down Payment</label>
                  <input
                    type="number"
                    value={editForm.downPayment}
                    onChange={(e) => setEditForm({...editForm, downPayment: e.target.value})}
                    placeholder="Enter down payment amount"
                  />
                </div>
                <div className="form-group">
                  <label>Paid Amount</label>
                  <input
                    type="number"
                    value={editForm.paidAmount}
                    onChange={(e) => setEditForm({...editForm, paidAmount: e.target.value})}
                    placeholder="Enter paid amount"
                  />
                </div>
                <div className="form-group">
                  <label>Payment Type</label>
                  <select
                    value={editForm.paymentType}
                    onChange={(e) => setEditForm({...editForm, paymentType: e.target.value})}
                  >
                    <option value="">Select Payment Type</option>
                    <option value="Cash">Cash</option>
                    <option value="Installment">Installment</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="btn-secondary" onClick={handleProfileCancel}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleProfileSave}>
                <span role="img" aria-label="save">💾</span> Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel; 