import React, { useState } from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  BedDouble,
  Users,
  CalendarCheck2,
  LogOut,
  ChevronRight,
  Menu,
  X,
  Hotel,
  Home,
  QrCode
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    showToast('Logged out from Admin Dashboard', 'info');
    navigate('/admin/login');
  };

  const navLinks = [
    { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/admin/check-in', label: 'QR Digital Check-in', icon: QrCode },
    { to: '/admin/hotels', label: 'Manage Hotels', icon: Building2 },
    { to: '/admin/rooms', label: 'Manage Rooms', icon: BedDouble },
    { to: '/admin/bookings', label: 'Manage Bookings', icon: CalendarCheck2 },
    { to: '/admin/users', label: 'Registered Users', icon: Users },
  ];

  const linkClass = ({ isActive }) =>
    `flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
      isActive
        ? 'bg-teal-600 text-white shadow-md shadow-teal-700/20'
        : 'text-slate-400 hover:text-white hover:bg-slate-800'
    }`;

  return (
    <div className="min-h-screen flex bg-slate-100 text-slate-800">
      
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Admin Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col justify-between transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand header */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <Link to="/admin" className="flex items-center space-x-2.5">
              <img
                src="/assets/takkunu-booku-logo.png"
                alt="TAKKUNU BOOKU"
                className="h-9 w-auto object-contain brightness-105"
                onError={(e) => {
                  e.currentTarget.classList.add('hidden');
                  const fb = document.getElementById('admin-brand-fallback');
                  if (fb) fb.classList.remove('hidden');
                }}
              />
              <div id="admin-brand-fallback" className="hidden">
                <span className="font-extrabold text-base tracking-tight text-white block">TAKKUNU BOOKU</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400">Admin Portal</span>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            <div className="px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Operations
            </div>
            {navLinks.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={() => setSidebarOpen(false)}
                className={linkClass}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            ))}

            <div className="pt-4 px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Switch View
            </div>
            <Link
              to="/"
              className="flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            >
              <Home className="w-5 h-5 flex-shrink-0 text-slate-400" />
              <span>Customer Website</span>
            </Link>
          </nav>
        </div>

        {/* Sidebar Footer User Info */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center space-x-3 p-2 rounded-xl bg-slate-800/60 mb-3">
            <div className="w-9 h-9 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-sm">
              {user?.name ? user.name.charAt(0) : 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{user?.name || 'Administrator'}</p>
              <p className="text-[10px] text-teal-400 truncate">Super Admin</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-sm sm:text-base font-bold text-slate-800 flex items-center space-x-2">
              <span className="hidden sm:inline text-slate-400">Administration</span>
              <ChevronRight className="w-4 h-4 text-slate-400 hidden sm:inline" />
              <span className="text-teal-700">Hotel Management System</span>
            </h2>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              to="/"
              target="_blank"
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition hidden sm:inline-flex items-center space-x-1"
            >
              <span>Live Site</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </header>

        {/* Dynamic Admin Page View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>

    </div>
  );
};

export default AdminLayout;
