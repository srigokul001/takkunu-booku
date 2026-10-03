import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, LogIn, Hotel, AlertCircle, Sparkles, ShieldCheck } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';

const Login = () => {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Return to intended page or home
  const from = location.state?.from?.pathname || '/';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Please enter both your email address and password');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await login(formData);
      showToast(`Welcome back, ${res.user.name}!`, 'success');
      
      // If admin logging in, take to admin dashboard if they were not headed elsewhere
      if (res.user.role === 'Admin' && from === '/') {
        navigate('/admin');
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Login failed. Please verify your credentials.';
      setError(errMsg);
      showToast(errMsg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Demo auto-fill helpers for presentation & college testing
  const fillCustomerDemo = () => {
    setFormData({
      email: 'john@example.com',
      password: 'johnpassword123',
    });
    setError('');
  };

  const fillAdminDemo = () => {
    setFormData({
      email: 'admin@hotelbooking.com',
      password: 'adminpassword123',
    });
    setError('');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/80 shadow-xl">
        
        {/* Header */}
        <div className="text-center">
          <img
            src="/assets/takkunu-booku-logo.png"
            alt="TAKKUNU BOOKU"
            className="mx-auto h-16 w-auto object-contain mb-3"
            onError={(e) => {
              e.currentTarget.classList.add('hidden');
              const fb = document.getElementById('login-brand-fallback');
              if (fb) fb.classList.remove('hidden');
            }}
          />
          <div id="login-brand-fallback" className="hidden mx-auto w-12 h-12 rounded-2xl bg-teal-600 flex items-center justify-center text-white shadow-lg shadow-teal-600/30 mb-4">
            <Hotel className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Welcome Back
          </h2>
          <p className="text-xs font-semibold text-teal-600 uppercase tracking-widest mt-1">
            TAKKUNU BOOKU
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Access your bookings, profile, and exclusive room rates
          </p>
        </div>

        {/* Demo Fast Fill Banner */}
        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-2">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-600">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Quick Demo Credentials</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={fillCustomerDemo}
              className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300 transition text-left"
            >
              👤 Customer (John)
            </button>
            <button
              type="button"
              onClick={fillAdminDemo}
              className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-300 transition text-left"
            >
              🛡️ Administrator
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-center space-x-2 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-lg shadow-teal-600/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <LogIn className="w-4 h-4" />
            <span>{isSubmitting ? 'Signing in...' : 'Sign In'}</span>
          </button>
        </form>

        {/* Footer Link */}
        <div className="text-center pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-bold text-teal-600 hover:text-teal-700">
              Create an account
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Login;
