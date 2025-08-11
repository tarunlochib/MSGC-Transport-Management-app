import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import NotificationDropdown from './components/NotificationDropdown';
import SettingsDropdown from './components/SettingsDropdown';
import UserProfileDropdown from './components/UserProfileDropdown';
import OnlineStatusIndicator from './components/OnlineStatusIndicator';
import CompanyLogo from './components/CompanyLogo';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);

  const markNotificationAsRead = (id) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="bg-white border-b border-gray-100 py-3 px-6 flex items-center justify-between relative z-40">
      <div className="flex items-center space-x-4">
        <CompanyLogo />
      </div>

      <div className="flex items-center space-x-4">
        {/* Online Status */}
        <OnlineStatusIndicator />

        <NotificationDropdown notifications={notifications} markNotificationAsRead={markNotificationAsRead} />
        <SettingsDropdown />
        <UserProfileDropdown user={user} onLogout={handleLogout} />
      </div>
    </header>
  );
};

export default Header; 