import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  QrCode,
  CheckCircle2,
  AlertCircle,
  Search,
  User,
  Building,
  Bed,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import adminService from '../../services/adminService';
import LoadingSpinner from '../../components/LoadingSpinner';

const CheckInScanner = () => {
  const [searchParams] = useSearchParams();
  const urlBookingId = searchParams.get('bookingId') || '';
  const { showToast } = useToast();

  const [bookingIdInput, setBookingIdInput] = useState(urlBookingId);
  const [loading, setLoading] = useState(false);
  const [checkInResult, setCheckInResult] = useState(null);
  const [error, setError] = useState('');

  const performCheckIn = async (idToProcess) => {
    const id = (idToProcess || bookingIdInput).trim();
    if (!id) {
      setError('Please enter or scan a valid Booking ID');
      return;
    }

    setLoading(true);
    setError('');
    setCheckInResult(null);

    try {
      const res = await adminService.processCheckIn(id);
      if (res.success && res.booking) {
        setCheckInResult(res.booking);
        showToast(res.message || 'Check-in processed successfully!', 'success');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Check-in verification failed. Please verify the Booking ID.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (urlBookingId) {
      setBookingIdInput(urlBookingId);
      performCheckIn(urlBookingId);
    }
  }, [urlBookingId]);

  const handleReset = () => {
    setBookingIdInput('');
    setCheckInResult(null);
    setError('');
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-teal-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-teal-500/20">
          <QrCode className="w-8 h-8" />
        </div>
        <span className="text-xs font-bold uppercase tracking-widest text-teal-600">Module 4 — Front Desk Operations</span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          QR Digital Check-in Scanner
        </h1>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Scan guest digital QR passes or input the reservation reference for touchless check-in.
        </p>
      </div>

      {/* Input / Scanner Box */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-md space-y-5">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            performCheckIn();
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Enter or Paste Booking Reference / QR String
            </label>
            <div className="relative">
              <QrCode className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={bookingIdInput}
                onChange={(e) => {
                  setBookingIdInput(e.target.value);
                  if (error) setError('');
                }}
                placeholder="e.g. BK-552198"
                className="w-full pl-11 pr-24 py-3 rounded-2xl border border-slate-200 text-sm font-mono font-bold uppercase focus:outline-none focus:border-teal-600"
              />
              <button
                type="submit"
                disabled={loading || !bookingIdInput.trim()}
                className="absolute right-1.5 top-1.5 bottom-1.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition disabled:opacity-40"
              >
                {loading ? 'Verifying...' : 'Verify'}
              </button>
            </div>
          </div>

          {/* Quick Demo Pre-fills for Testing */}
          <div className="flex items-center space-x-2 pt-1 text-[11px] text-slate-500">
            <span className="font-semibold">Test with:</span>
            <button
              type="button"
              onClick={() => {
                setBookingIdInput('BK-552198');
                performCheckIn('BK-552198');
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-teal-50 hover:text-teal-700 font-mono font-bold text-slate-700"
            >
              BK-552198
            </button>
            <button
              type="button"
              onClick={() => {
                setBookingIdInput('BK-789012');
                performCheckIn('BK-789012');
              }}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-teal-50 hover:text-teal-700 font-mono font-bold text-slate-700"
            >
              BK-789012
            </button>
          </div>
        </form>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Success Card Matching Requirement 2 Exact Output */}
      {checkInResult && (
        <div className="bg-white rounded-3xl border-2 border-emerald-400 p-6 sm:p-8 shadow-xl space-y-6 animate-in zoom-in-95 duration-200">
          
          {/* Top Banner */}
          <div className="flex items-center justify-between border-b border-emerald-100 pb-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-emerald-900">Booking Found ✓</h3>
                <p className="text-xs text-emerald-700 font-mono">Reference: {checkInResult.bookingId}</p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Current Status</span>
              <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-black bg-emerald-500 text-white shadow-sm">
                <span>Status → Checked In</span>
              </span>
            </div>
          </div>

          {/* Guest and Stay Details Grid */}
          <div className="space-y-3.5 text-xs text-slate-700">
            
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="font-bold text-slate-500 flex items-center space-x-2">
                <User className="w-4 h-4 text-teal-600" />
                <span>Guest Name:</span>
              </span>
              <span className="font-extrabold text-slate-900 text-sm">
                {checkInResult.guestDetails?.guestName || checkInResult.userId?.name}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="font-bold text-slate-500 flex items-center space-x-2">
                <Building className="w-4 h-4 text-teal-600" />
                <span>Hotel:</span>
              </span>
              <span className="font-extrabold text-slate-900">
                {checkInResult.hotelId?.hotelName}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="font-bold text-slate-500 flex items-center space-x-2">
                <Bed className="w-4 h-4 text-teal-600" />
                <span>Room Number:</span>
              </span>
              <span className="font-black text-teal-700 text-sm">
                Room #{checkInResult.roomId?.roomNumber} ({checkInResult.roomId?.roomType})
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 block mb-0.5">Check-in Date:</span>
                <span className="font-extrabold text-slate-800">
                  {new Date(checkInResult.checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 block mb-0.5">Check-out Date:</span>
                <span className="font-extrabold text-slate-800">
                  {new Date(checkInResult.checkOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            </div>

          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <button
              onClick={handleReset}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center space-x-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Scan Next Guest</span>
            </button>

            <Link
              to="/admin/rooms"
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition flex items-center space-x-1"
            >
              <span>View Room Inventory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>
      )}

    </div>
  );
};

export default CheckInScanner;
