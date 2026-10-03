import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  CreditCard,
  QrCode,
  Building,
  CheckCircle2,
  Lock,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Tag
} from 'lucide-react';
import { useToast } from '../hooks/useToast';
import bookingService from '../services/bookingService';

const Payment = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [bookingData, setBookingData] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('Credit/Debit Card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  // Dummy Card form state
  const [cardData, setCardData] = useState({
    cardNumber: '•••• •••• •••• 4242',
    cardHolder: '',
    expiry: '12/28',
    cvv: '982',
  });

  useEffect(() => {
    const raw = sessionStorage.getItem('pendingBooking');
    if (!raw) {
      navigate('/hotels');
      return;
    }
    try {
      const parsed = JSON.parse(raw);
      setBookingData(parsed);
      if (parsed.guestDetails?.guestName) {
        setCardData((prev) => ({ ...prev, cardHolder: parsed.guestDetails.guestName }));
      }
    } catch (e) {
      navigate('/hotels');
    }
  }, [navigate]);

  const handleFillDemoCard = () => {
    setCardData({
      cardNumber: '4242 •••• •••• 4242',
      cardHolder: bookingData?.guestDetails?.guestName || 'John Anderson',
      expiry: '10/29',
      cvv: '123',
    });
    showToast('Demo payment credentials filled', 'info');
  };

  const handlePayNow = async (e) => {
    e.preventDefault();
    if (!bookingData) return;

    setIsProcessing(true);
    setError('');

    try {
      const payload = {
        hotelId: bookingData.hotelId,
        roomId: bookingData.roomId,
        checkIn: bookingData.checkIn,
        checkOut: bookingData.checkOut,
        numberOfGuests: bookingData.numberOfGuests,
        guestDetails: bookingData.guestDetails,
        paymentMethod,
        couponCode: bookingData.couponCode || null,
      };

      const res = await bookingService.createBooking(payload);

      if (res.success && res.booking) {
        showToast('Payment successful! Booking confirmed.', 'success');
        sessionStorage.removeItem('pendingBooking');
        // Store confirmation data
        sessionStorage.setItem('confirmedBooking', JSON.stringify({
          booking: res.booking,
          payment: res.payment,
        }));
        navigate(`/booking-confirmation/${res.booking.bookingId}`);
      }
    } catch (err) {
      console.error('Payment error:', err);
      const errMsg = err.response?.data?.message || 'Payment processing failed. Please try again.';
      setError(errMsg);
      showToast(errMsg, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!bookingData) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Back button */}
      <div>
        <Link
          to={`/booking?roomId=${bookingData.roomId}&hotelId=${bookingData.hotelId}&checkIn=${bookingData.checkIn}&checkOut=${bookingData.checkOut}&guests=${bookingData.numberOfGuests}`}
          className="inline-flex items-center space-x-2 text-xs font-bold text-slate-500 hover:text-teal-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Reservation Details</span>
        </Link>
      </div>

      <div className="text-center max-w-xl mx-auto space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-teal-600">Module 3 — Secure Checkout</span>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Dummy Payment Gateway
        </h1>
        <p className="text-xs text-slate-500">
          This is a simulated sandbox payment gateway. No real money will be charged.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Left: Payment Options & Mock Form */}
        <div className="md:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-md space-y-6">
          
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">
              Select Payment Method
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'Credit/Debit Card', label: 'Credit Card', icon: CreditCard },
                { id: 'UPI', label: 'UPI / QR Code', icon: QrCode },
                { id: 'Net Banking', label: 'Net Banking', icon: Building },
                { id: 'Cash at Check-in', label: 'Pay at Hotel', icon: CheckCircle2 },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setPaymentMethod(opt.id)}
                  className={`p-3.5 rounded-2xl border text-left flex items-center space-x-3 transition ${
                    paymentMethod === opt.id
                      ? 'border-teal-600 bg-teal-50 text-teal-900 font-bold shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700 font-medium'
                  }`}
                >
                  <opt.icon className={`w-5 h-5 ${paymentMethod === opt.id ? 'text-teal-600' : 'text-slate-400'}`} />
                  <span className="text-xs">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Form based on Payment Method */}
          {paymentMethod === 'Credit/Debit Card' && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Card Information</span>
                <button
                  type="button"
                  onClick={handleFillDemoCard}
                  className="inline-flex items-center space-x-1 text-[11px] font-bold text-teal-600 hover:text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg"
                >
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>Auto-fill Demo Card</span>
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Card Number
                </label>
                <div className="relative">
                  <CreditCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={cardData.cardNumber}
                    onChange={(e) => setCardData({ ...cardData, cardNumber: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-medium focus:outline-none focus:border-teal-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  value={cardData.cardHolder}
                  onChange={(e) => setCardData({ ...cardData, cardHolder: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-teal-600 uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Expiration Date
                  </label>
                  <input
                    type="text"
                    value={cardData.expiry}
                    onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                    placeholder="MM/YY"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-medium focus:outline-none focus:border-teal-600"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    CVV Code
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    value={cardData.cvv}
                    onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                    placeholder="123"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-medium focus:outline-none focus:border-teal-600"
                  />
                </div>
              </div>
            </div>
          )}

          {paymentMethod === 'UPI' && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center mx-auto">
                <QrCode className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-800">Scan & Pay via any UPI App</p>
              <p className="text-[11px] text-slate-400 font-mono">takkunubooku@upi-demo</p>
              <p className="text-xs text-teal-700 font-medium">Click "Authorize & Confirm" to simulate instant QR payment.</p>
            </div>
          )}

          {paymentMethod === 'Net Banking' && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
              <Building className="w-8 h-8 text-teal-600 mx-auto" />
              <p className="text-xs font-bold text-slate-800">Simulated Net Banking Portal</p>
              <p className="text-xs text-slate-500">Supports all major banks with mock sandbox approval.</p>
            </div>
          )}

          {paymentMethod === 'Cash at Check-in' && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <p className="text-xs font-bold text-emerald-900">Pay Upon Arrival</p>
              <p className="text-xs text-emerald-700">Your room is guaranteed immediately without an advance charge.</p>
            </div>
          )}

          {/* Pay Button */}
          <button
            onClick={handlePayNow}
            disabled={isProcessing}
            className="w-full py-4 px-6 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-sm shadow-xl shadow-teal-600/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <Lock className="w-4 h-4" />
            <span>
              {isProcessing
                ? 'Processing Simulated Payment...'
                : `Authorize & Pay $${bookingData.totalAmount}`}
            </span>
          </button>

          <p className="text-[11px] text-slate-400 text-center flex items-center justify-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
            <span>256-bit Dummy SSL Encryption. No actual charge occurs.</span>
          </p>

        </div>

        {/* Right: Bill Summary */}
        <div className="md:col-span-5 bg-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl space-y-6">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400">Order Invoice</span>
            <h3 className="text-lg font-bold text-white mt-1">{bookingData.hotelName}</h3>
            <p className="text-xs text-slate-400">{bookingData.roomType} Suite (Room #{bookingData.roomNumber})</p>
          </div>

          <div className="space-y-3 border-y border-slate-800 py-4 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Guest Name:</span>
              <span className="font-semibold text-slate-200">{bookingData.guestDetails.guestName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Stay Duration:</span>
              <span className="font-semibold text-slate-200">{bookingData.totalNights} Nights</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Total Guests:</span>
              <span className="font-semibold text-slate-200">{bookingData.numberOfGuests} Persons</span>
            </div>
            {bookingData.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-400 font-bold">
                <span>Coupon ({bookingData.couponCode}):</span>
                <span>-${bookingData.discountAmount}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-400">Payment Mode:</span>
              <span className="font-semibold text-teal-400">{paymentMethod}</span>
            </div>
          </div>

          <div className="flex justify-between items-baseline pt-2">
            <span className="text-sm font-semibold text-slate-300">Total Payable:</span>
            <span className="text-3xl font-black text-teal-400">${bookingData.totalAmount}</span>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Payment;
