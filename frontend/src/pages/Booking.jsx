import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  Calendar,
  Users,
  ShieldCheck,
  CreditCard,
  Building,
  User,
  Mail,
  Phone,
  ArrowRight,
  AlertCircle,
  FileText,
  Tag,
  Check,
  Percent
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import LoadingSpinner from '../components/LoadingSpinner';
import roomService from '../services/roomService';
import hotelService from '../services/hotelService';
import couponService from '../services/couponService';

const Booking = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const roomId = searchParams.get('roomId');
  const hotelId = searchParams.get('hotelId');
  const urlCheckIn = searchParams.get('checkIn');
  const urlCheckOut = searchParams.get('checkOut');
  const urlGuests = searchParams.get('guests');

  // Dates
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const dayAfterTomorrow = new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0];

  const [checkIn, setCheckIn] = useState(urlCheckIn || tomorrow);
  const [checkOut, setCheckOut] = useState(urlCheckOut || dayAfterTomorrow);
  const [guests, setGuests] = useState(Number(urlGuests) || 2);

  // Guest Details
  const [guestDetails, setGuestDetails] = useState({
    guestName: user?.name || '',
    guestEmail: user?.email || '',
    guestPhone: user?.phone || '',
    specialRequests: '',
  });

  const [hotel, setHotel] = useState(null);
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [availError, setAvailError] = useState('');

  // Coupon State (Enhancement #5)
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');

  // Auto-fill user contact info if available
  useEffect(() => {
    if (user) {
      setGuestDetails((prev) => ({
        ...prev,
        guestName: prev.guestName || user.name || '',
        guestEmail: prev.guestEmail || user.email || '',
        guestPhone: prev.guestPhone || user.phone || '',
      }));
    }
  }, [user]);

  // Load Room and Hotel
  useEffect(() => {
    const fetchData = async () => {
      if (!roomId) {
        navigate('/hotels');
        return;
      }
      setLoading(true);
      try {
        const roomRes = await roomService.getRoomById(roomId);
        if (roomRes.success && roomRes.room) {
          setRoom(roomRes.room);
          setHotel(roomRes.room.hotelId);
          if (guests > roomRes.room.capacity) {
            setGuests(roomRes.room.capacity);
          }
        }
      } catch (err) {
        console.error('Failed to load booking targets:', err);
        showToast('Could not load room for booking', 'error');
        navigate('/hotels');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [roomId, navigate]);

  // Calculate Subtotal: Number of Nights × Room Price
  const startDate = new Date(checkIn);
  const endDate = new Date(checkOut);
  const totalNights = Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)));
  const subtotalAmount = room ? totalNights * room.pricePerNight : 0;

  // Calculate Discount & Final Amount
  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const finalAmount = Math.max(0, subtotalAmount - discountAmount);

  // Real-time check availability for dates
  useEffect(() => {
    if (!roomId || !checkIn || !checkOut) return;

    const checkAvail = async () => {
      setIsCheckingAvailability(true);
      setAvailError('');
      try {
        const res = await roomService.checkAvailability(roomId, checkIn, checkOut);
        if (res.success) {
          setIsAvailable(res.available);
          if (!res.available) {
            setAvailError(res.message);
          }
        }
      } catch (err) {
        setIsAvailable(false);
        setAvailError(err.response?.data?.message || 'Date selection conflict');
      } finally {
        setIsCheckingAvailability(false);
      }
    };

    checkAvail();
  }, [roomId, checkIn, checkOut]);

  // Apply Coupon
  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setCouponLoading(true);
    setCouponError('');

    try {
      const res = await couponService.applyCoupon(couponCode, subtotalAmount);
      if (res.success && res.coupon) {
        setAppliedCoupon(res.coupon);
        showToast(res.message, 'success');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid coupon code';
      setCouponError(msg);
      setAppliedCoupon(null);
      showToast(msg, 'error');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  const handleGuestChange = (e) => {
    setGuestDetails({ ...guestDetails, [e.target.name]: e.target.value });
  };

  const handleProceedToPayment = (e) => {
    e.preventDefault();

    if (!guestDetails.guestName || !guestDetails.guestEmail || !guestDetails.guestPhone) {
      showToast('Please fill in guest contact information', 'error');
      return;
    }

    if (!isAvailable) {
      showToast('Selected room is unavailable for these dates', 'error');
      return;
    }

    const bookingPayload = {
      hotelId: hotel._id,
      roomId: room._id,
      hotelName: hotel.hotelName,
      roomType: room.roomType,
      roomNumber: room.roomNumber,
      roomImage: room.image,
      checkIn,
      checkOut,
      numberOfGuests: guests,
      totalNights,
      subtotalAmount,
      discountAmount,
      couponCode: appliedCoupon?.code || null,
      totalAmount: finalAmount,
      guestDetails,
    };

    sessionStorage.setItem('pendingBooking', JSON.stringify(bookingPayload));
    navigate('/payment');
  };

  if (loading) {
    return <LoadingSpinner text="Preparing your reservation..." />;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Review & Complete Your Reservation
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Module 3 — Instant Room Booking & Automatic Price Calculation
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Booking & Guest Details Form */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleProceedToPayment} className="space-y-6">
            
            {/* 1. Stay Dates & Travelers */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-teal-600" />
                <span>1. Stay Dates & Guests</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Check-in Date
                  </label>
                  <input
                    type="date"
                    min={today}
                    value={checkIn}
                    onChange={(e) => {
                      setCheckIn(e.target.value);
                      if (e.target.value >= checkOut) {
                        const next = new Date(new Date(e.target.value).getTime() + 86400000).toISOString().split('T')[0];
                        setCheckOut(next);
                      }
                    }}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Check-out Date
                  </label>
                  <input
                    type="date"
                    min={checkIn || today}
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-teal-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Number of Guests
                </label>
                <div className="relative">
                  <select
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-teal-600 bg-slate-50"
                  >
                    {Array.from({ length: room?.capacity || 2 }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>
                        {n} {n === 1 ? 'Guest' : 'Guests'} (Room max: {room?.capacity})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Conflict warning */}
              {availError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{availError}</span>
                </div>
              )}
            </div>

            {/* 2. Guest Information */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <User className="w-5 h-5 text-teal-600" />
                <span>2. Primary Guest Information</span>
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      name="guestName"
                      required
                      value={guestDetails.guestName}
                      onChange={handleGuestChange}
                      placeholder="e.g. John Anderson"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-teal-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="email"
                        name="guestEmail"
                        required
                        value={guestDetails.guestEmail}
                        onChange={handleGuestChange}
                        placeholder="john@example.com"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-teal-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                      Contact Phone *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="tel"
                        name="guestPhone"
                        required
                        value={guestDetails.guestPhone}
                        onChange={handleGuestChange}
                        placeholder="+1 (555) 000-0000"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-teal-600"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Special Requests (Optional)
                  </label>
                  <textarea
                    name="specialRequests"
                    rows={2}
                    value={guestDetails.specialRequests}
                    onChange={handleGuestChange}
                    placeholder="Late arrival, high floor, feather pillows, airport taxi arrangement..."
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-teal-600"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!isAvailable || isCheckingAvailability}
              className="w-full py-4 px-6 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-sm shadow-xl shadow-teal-600/25 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Continue to Payment (${finalAmount})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Right Side: Booking Summary, Coupon & Price Breakdown */}
        <div className="lg:col-span-5 space-y-6">
          <div className="sticky top-28 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-lg space-y-5">
            
            <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3 flex items-center space-x-2">
              <FileText className="w-4 h-4 text-teal-600" />
              <span>Reservation Summary</span>
            </h3>

            {/* Hotel & Room Mini Card */}
            <div className="flex space-x-4">
              <img
                src={room?.image}
                alt="Room"
                className="w-20 h-20 rounded-2xl object-cover bg-slate-100 flex-shrink-0"
              />
              <div className="min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md">
                  {room?.roomType}
                </span>
                <h4 className="text-sm font-bold text-slate-900 truncate mt-1">
                  {hotel?.hotelName}
                </h4>
                <p className="text-xs text-slate-500 truncate">Room #{room?.roomNumber}</p>
                <p className="text-xs text-slate-400 truncate">{hotel?.location}</p>
              </div>
            </div>

            {/* Dates Recap */}
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Check-in:</span>
                <span className="font-bold text-slate-800">{new Date(checkIn).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Check-out:</span>
                <span className="font-bold text-slate-800">{new Date(checkOut).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Duration:</span>
                <span className="font-bold text-teal-700">{totalNights} {totalNights === 1 ? 'Night' : 'Nights'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Guests:</span>
                <span className="font-bold text-slate-800">{guests} Adults</span>
              </div>
            </div>

            {/* Feature 5: 🎟️ Coupon Input Box */}
            <div className="p-3.5 rounded-2xl bg-teal-50/50 border border-teal-100 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-teal-900">
                <span className="flex items-center space-x-1">
                  <Tag className="w-3.5 h-3.5 text-teal-600" />
                  <span>Have a Promo Coupon?</span>
                </span>
                <span className="text-[10px] text-teal-600 font-mono">e.g. WELCOME10, SAVE500</span>
              </div>

              {!appliedCoupon ? (
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Enter code"
                    className="flex-1 px-3 py-1.5 rounded-xl border border-teal-200 text-xs font-mono uppercase font-bold focus:outline-none focus:border-teal-600"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={couponLoading || !couponCode.trim()}
                    className="px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition disabled:opacity-40"
                  >
                    {couponLoading ? 'Checking...' : 'Apply'}
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-100/70 border border-emerald-200 text-xs">
                  <div className="flex items-center space-x-1.5 text-emerald-900">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span className="font-mono font-bold">{appliedCoupon.code}</span>
                    <span className="text-[11px]">(-${appliedCoupon.discountAmount})</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-[11px] text-rose-600 hover:underline font-bold"
                  >
                    Remove
                  </button>
                </div>
              )}

              {couponError && (
                <p className="text-[11px] text-rose-600 font-medium">{couponError}</p>
              )}
            </div>

            {/* Formula & Detailed Price Breakdown (As Specified in Requirement 5) */}
            <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600 font-mono">
              <div className="flex justify-between">
                <span>Room Price:</span>
                <span className="font-medium">${room?.pricePerNight} / night</span>
              </div>
              <div className="flex justify-between">
                <span>× Number of Nights:</span>
                <span className="font-medium">{totalNights}</span>
              </div>
              <div className="border-t border-slate-200 my-1"></div>
              <div className="flex justify-between text-slate-800 font-bold">
                <span>Subtotal:</span>
                <span>${subtotalAmount}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Discount ({appliedCoupon.code}):</span>
                  <span>-${discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-500">
                <span>Tax & Service Fees:</span>
                <span className="text-emerald-600 font-bold">$0.00</span>
              </div>
              <div className="border-t-2 border-slate-300 my-1"></div>
              <div className="pt-1 flex justify-between items-baseline font-sans">
                <span className="text-sm font-black text-slate-900">Final Amount:</span>
                <span className="text-2xl font-black text-teal-700 font-mono">${finalAmount}</span>
              </div>
            </div>

            {/* Security note */}
            <div className="p-3 bg-teal-50/60 rounded-xl border border-teal-100 flex items-center space-x-2 text-[11px] text-teal-900">
              <ShieldCheck className="w-4 h-4 text-teal-600 flex-shrink-0" />
              <span>Dummy Payment system enabled. Free cancellation before check-in.</span>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};

export default Booking;
