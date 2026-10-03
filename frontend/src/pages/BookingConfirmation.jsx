import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  CheckCircle2,
  Calendar,
  MapPin,
  Users,
  Copy,
  Check,
  Printer,
  Home,
  FileCheck2,
  ShieldCheck,
  QrCode
} from 'lucide-react';
import { useToast } from '../hooks/useToast';
import bookingService from '../services/bookingService';
import LoadingSpinner from '../components/LoadingSpinner';
import QRCodeDisplay from '../components/QRCodeDisplay';

const BookingConfirmation = () => {
  const { bookingId } = useParams();
  const { showToast } = useToast();

  const [booking, setBooking] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Check sessionStorage first for instantaneous load
    const cached = sessionStorage.getItem('confirmedBooking');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed.booking?.bookingId === bookingId) {
          setBooking(parsed.booking);
          setPayment(parsed.payment);
          setLoading(false);
          return;
        }
      } catch (e) {}
    }

    // Otherwise fetch via API
    const fetchBooking = async () => {
      try {
        const res = await bookingService.getBookingById(bookingId);
        if (res.success && res.booking) {
          setBooking(res.booking);
          setPayment(res.payment);
        }
      } catch (err) {
        console.error('Failed to load booking:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  const handleCopyId = () => {
    if (booking?.bookingId) {
      navigator.clipboard.writeText(booking.bookingId);
      setCopied(true);
      showToast('Booking ID copied to clipboard!', 'info');
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <LoadingSpinner text="Generating your official reservation voucher..." />;
  }

  if (!booking) {
    return (
      <div className="max-w-xl mx-auto py-16 px-4 text-center">
        <h2 className="text-2xl font-bold text-slate-800">Booking Record Not Found</h2>
        <p className="text-sm text-slate-500 mt-2">Could not locate booking reference {bookingId}.</p>
        <Link to="/my-bookings" className="mt-4 inline-block px-5 py-2.5 bg-teal-600 text-white rounded-xl font-bold text-sm">
          Go to My Bookings
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      
      {/* Top Success Badge */}
      <div className="text-center space-y-3">
        <div className="flex justify-center mb-2">
          <img
            src="/assets/takkunu-booku-logo.png"
            alt="TAKKUNU BOOKU - Find. Book. Stay."
            className="h-16 sm:h-20 w-auto object-contain"
            onError={(e) => {
              e.currentTarget.classList.add('hidden');
            }}
          />
        </div>
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">Reservation Confirmed ✓</span>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
          Your Room is Booked!
        </h1>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Your TAKKUNU BOOKU confirmation has been recorded. Present your digital QR pass or Booking ID upon hotel arrival.
        </p>
      </div>

      {/* Official Voucher Card (Printable) */}
      <div id="booking-voucher" className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden p-6 sm:p-10 space-y-8">
        
        {/* Header Ribbon */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-6 gap-4">
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">Official Reservation ID</span>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-2xl font-black text-teal-700 font-mono tracking-wider">
                {booking.bookingId}
              </span>
              <button
                onClick={handleCopyId}
                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
                title="Copy Booking ID"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              ● {booking.bookingStatus}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-800 border border-teal-200">
              Payment: {booking.paymentStatus}
            </span>
          </div>
        </div>

        {/* Feature 2: 📱 QR Digital Check-in Pass */}
        <div className="flex justify-center">
          <QRCodeDisplay booking={booking} size={160} />
        </div>

        {/* Hotel & Room Banner */}
        <div className="flex flex-col sm:flex-row gap-5 items-start border-t border-slate-100 pt-6">
          <img
            src={booking.roomId?.image || booking.hotelId?.image}
            alt="Hotel"
            className="w-full sm:w-36 h-28 rounded-2xl object-cover bg-slate-100 flex-shrink-0"
          />
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-slate-900">{booking.hotelId?.hotelName}</h3>
            <p className="text-xs text-slate-500 flex items-center">
              <MapPin className="w-3.5 h-3.5 text-teal-600 mr-1 flex-shrink-0" />
              <span>{booking.hotelId?.address}, {booking.hotelId?.location}</span>
            </p>
            <p className="text-xs font-semibold text-teal-700 pt-1">
              {booking.roomId?.roomType} Suite (Room #{booking.roomId?.roomNumber})
            </p>
          </div>
        </div>

        {/* Stay Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
          <div>
            <span className="text-slate-400 block font-semibold">Check-in</span>
            <span className="font-bold text-slate-800 mt-1 block">
              {new Date(booking.checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block font-semibold">Check-out</span>
            <span className="font-bold text-slate-800 mt-1 block">
              {new Date(booking.checkOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block font-semibold">Guests</span>
            <span className="font-bold text-slate-800 mt-1 block">
              {booking.numberOfGuests} Persons
            </span>
          </div>
          <div>
            <span className="text-slate-400 block font-semibold">Total Stay</span>
            <span className="font-bold text-teal-700 mt-1 block">
              {booking.totalNights} Nights
            </span>
          </div>
        </div>

        {/* Guest Contact Details */}
        <div className="border-t border-slate-100 pt-5 space-y-2 text-xs">
          <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Primary Guest</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-600">
            <div>
              <span className="text-slate-400">Name:</span> <strong className="text-slate-800">{booking.guestDetails?.guestName}</strong>
            </div>
            <div>
              <span className="text-slate-400">Email:</span> <span className="text-slate-800">{booking.guestDetails?.guestEmail}</span>
            </div>
            <div>
              <span className="text-slate-400">Phone:</span> <span className="text-slate-800">{booking.guestDetails?.guestPhone}</span>
            </div>
          </div>
          {booking.guestDetails?.specialRequests && (
            <p className="text-[11px] text-slate-500 pt-1 italic">
              Special Requests: "{booking.guestDetails.specialRequests}"
            </p>
          )}
        </div>

        {/* Financial Breakdown */}
        <div className="border-t border-slate-100 pt-5 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block">Total Amount Paid</span>
            {booking.couponApplied && (
              <span className="text-[11px] text-emerald-600 font-semibold block">
                Coupon "{booking.couponApplied}" applied (-${booking.discountAmount || 0})
              </span>
            )}
            <span className="text-[11px] text-emerald-600 font-semibold">Simulated Gateway Success</span>
          </div>
          <span className="text-3xl font-black text-slate-900">${booking.totalAmount}</span>
        </div>

      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <button
          onClick={handlePrint}
          className="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs transition flex items-center justify-center space-x-2"
        >
          <Printer className="w-4 h-4" />
          <span>Print / Save Voucher</span>
        </button>

        <Link
          to="/my-bookings"
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition flex items-center justify-center space-x-2 shadow-md shadow-teal-600/20"
        >
          <FileCheck2 className="w-4 h-4" />
          <span>View in My Bookings</span>
        </Link>

        <Link
          to="/"
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition flex items-center justify-center space-x-2"
        >
          <Home className="w-4 h-4" />
          <span>Return Home</span>
        </Link>
      </div>

    </div>
  );
};

export default BookingConfirmation;
