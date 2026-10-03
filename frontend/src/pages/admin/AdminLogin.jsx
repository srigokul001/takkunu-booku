import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, LogIn, Sparkles, ArrowLeft, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';

const AdminLogin = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fillAdmin = () => {
    setFormData({
      email: 'admin@hotelbooking.com',
      password: 'adminpassword123',
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Please fill in both fields');
      return;
    }

    setLoading(true);
    try {
      const res = await login(formData);
      if (res.user.role !== 'Admin') {
        setError('Access denied: This account does not possess Administrator privileges.');
        showToast('You are not authorized as an Admin', 'error');
        return;
      }

      showToast('Welcome to the Admin Command Center', 'success');
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid administrator credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-3xl p-8 shadow-2xl text-white space-y-6">
        
        <div className="text-center space-y-2">
          <img
            src="/assets/takkunu-booku-logo.png"
            alt="TAKKUNU BOOKU"
            className="mx-auto h-14 w-auto object-contain mb-2 brightness-110"
            onError={(e) => {
              e.currentTarget.classList.add('hidden');
              const fb = document.getElementById('admin-login-fallback');
              if (fb) fb.classList.remove('hidden');
            }}
          />
          <div id="admin-login-fallback" className="hidden w-14 h-14 rounded-2xl bg-teal-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-teal-500/30">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black tracking-tight">Admin Gateway</h1>
          <p className="text-xs font-semibold text-teal-400 uppercase tracking-wider">TAKKUNU BOOKU</p>
          <p className="text-xs text-slate-400">Restricted portal for hotel staff and managers</p>
        </div>

        {/* Demo Fast Fill */}
        <div className="bg-slate-700/60 p-3 rounded-2xl border border-slate-600 flex items-center justify-between">
          <div className="text-xs">
            <span className="font-bold text-teal-400 block">Evaluation Mode</span>
            <span className="text-[11px] text-slate-300">Click to fill default admin</span>
          </div>
          <button
            type="button"
            onClick={fillAdmin}
            className="px-3 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-xs transition flex items-center space-x-1"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Auto Fill</span>
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Admin Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-medium focus:outline-none focus:border-teal-500 text-white"
                placeholder="admin@hotelbooking.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-medium focus:outline-none focus:border-teal-500 text-white"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold text-xs transition shadow-lg shadow-teal-500/20 flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <LogIn className="w-4 h-4" />
            <span>{loading ? 'Authenticating...' : 'Enter Dashboard'}</span>
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-700">
          <Link to="/" className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white transition">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Public Website</span>
          </Link>
        </div>

      </div>
    </div>
  );
};

export default AdminLogin;
