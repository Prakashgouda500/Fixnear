import React, { useContext, useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Bell, LogOut, User as UserIcon, Brain, Check } from 'lucide-react';
import AuthContext from '../context/AuthContext';
import api from '../services/api';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.notifications);
      }
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Poll notifications every 10 seconds to simulate real-time updates
      const interval = setInterval(fetchNotifications, 10000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleMarkAsRead = async (id) => {
    try {
      const res = await api.put(`/notifications/${id}/read`);
      if (res.data.success) {
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-6">
          <Link to="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
              F
            </div>
            <span className="text-lg font-bold text-gray-900 tracking-tight">Fix<span className="text-indigo-600">Near</span></span>
          </Link>

          {/* Quick links */}
          {user && (
            <div className="hidden md:flex space-x-1">
              <Link
                to={user.role === 'customer' ? '/customer' : user.role === 'technician' ? '/technician' : '/admin'}
                className="text-sm font-medium text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md transition-colors"
              >
                Dashboard
              </Link>
              {user.role === 'customer' && (
                <>
                  <Link
                    to="/customer/create"
                    className="text-sm font-medium text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md transition-colors"
                  >
                    Request Service
                  </Link>
                  <Link
                    to="/fixai"
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-700 px-3 py-2 rounded-md flex items-center space-x-1"
                  >
                    <Brain className="h-4 w-4" />
                    <span>FixAI Helper</span>
                  </Link>
                </>
              )}
            </div>
          )}
        </div>

        {/* User control */}
        {user && (
          <div className="flex items-center space-x-4">
            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-1.5 rounded-full text-gray-400 hover:text-gray-900 hover:bg-gray-50 focus:outline-none transition-all cursor-pointer"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 text-[10px] font-bold text-white rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Drawer */}
              {showNotifications && (
                <div className="absolute right-0 mt-2.5 w-80 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                    <span className="text-sm font-bold text-gray-900">Notifications</span>
                    {unreadCount > 0 && <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{unreadCount} New</span>}
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-gray-50">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-xs text-gray-400">No notifications found</div>
                    ) : (
                      notifications.map((n) => (
                        <div key={n._id} className={`p-3 text-xs transition-colors ${n.isRead ? 'bg-white' : 'bg-indigo-50/30'}`}>
                          <div className="flex items-start justify-between">
                            <div>
                              <p className={`font-semibold ${n.isRead ? 'text-gray-700' : 'text-gray-900'}`}>{n.title}</p>
                              <p className="text-gray-500 mt-0.5 leading-relaxed">{n.message}</p>
                              <span className="text-[9px] text-gray-400 mt-1 block">
                                {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            {!n.isRead && (
                              <button
                                onClick={() => handleMarkAsRead(n._id)}
                                className="h-5 w-5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded flex items-center justify-center shrink-0 ml-2 transition-colors cursor-pointer"
                              >
                                <Check className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="flex items-center space-x-3 pl-3 border-l border-gray-100">
              <div className="text-right hidden sm:block">
                <span className="text-sm font-semibold text-gray-900 block leading-tight">{user.name}</span>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium mt-0.5 uppercase tracking-wider ${
                  user.role === 'admin' ? 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/10' :
                  user.role === 'technician' ? 'bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-600/10' :
                  'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/10'
                }`}>
                  {user.role}
                </span>
              </div>
              <Link
                to={user.role === 'customer' ? '/customer/profile' : user.role === 'technician' ? '/technician/profile' : '#'}
                className="h-9 w-9 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-600 transition-colors cursor-pointer"
              >
                <UserIcon className="h-4 w-4" />
              </Link>
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
