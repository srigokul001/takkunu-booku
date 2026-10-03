import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, Calendar, CreditCard, XCircle, Clock, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import notificationService from '../services/notificationService';
import { useAuth } from '../hooks/useAuth';

const NotificationBell = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await notificationService.getNotifications();
      if (res.success) {
        setNotifications(res.notifications || []);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch (err) {
      // Non-critical background fetch
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 20000); // Polling every 20s
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {}
  };

  const handleClickNotification = async (item) => {
    try {
      if (!item.read) {
        await notificationService.markAsRead(item._id);
        setUnreadCount((c) => Math.max(0, c - 1));
        setNotifications((prev) =>
          prev.map((n) => (n._id === item._id ? { ...n, read: true } : n))
        );
      }
      setIsOpen(false);
      if (item.link) {
        navigate(item.link);
      }
    } catch (err) {}
  };

  const getIcon = (type) => {
    switch (type) {
      case 'payment':
        return <CreditCard className="w-4 h-4 text-emerald-600" />;
      case 'cancellation':
        return <XCircle className="w-4 h-4 text-rose-600" />;
      case 'reminder':
        return <Clock className="w-4 h-4 text-amber-600" />;
      case 'booking':
      default:
        return <Calendar className="w-4 h-4 text-teal-600" />;
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-slate-600 hover:text-teal-600 hover:bg-slate-100 transition"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center px-1 shadow-md">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown Panel */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-slate-200/90 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
          onMouseLeave={() => setIsOpen(false)}
        >
          <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">Notifications</h4>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[11px] font-bold text-teal-600 hover:text-teal-700 flex items-center space-x-1"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                You have no notifications yet.
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item._id}
                  onClick={() => handleClickNotification(item)}
                  className={`p-3.5 flex items-start space-x-3 cursor-pointer hover:bg-slate-50 transition ${
                    !item.read ? 'bg-teal-50/40' : ''
                  }`}
                >
                  <div className="p-2 rounded-xl bg-slate-100 flex-shrink-0 mt-0.5">
                    {getIcon(item.type)}
                  </div>
                  <div className="flex-1 min-w-0 text-xs">
                    <div className="flex items-center justify-between">
                      <p className={`font-bold truncate ${!item.read ? 'text-slate-900' : 'text-slate-700'}`}>
                        {item.title}
                      </p>
                      {!item.read && (
                        <span className="w-2 h-2 rounded-full bg-teal-600 flex-shrink-0 ml-2" />
                      )}
                    </div>
                    <p className="text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                      {item.message}
                    </p>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      {new Date(item.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
