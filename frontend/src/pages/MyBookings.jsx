import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Ban,
  FileText,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Receipt,
  QrCode,
  Star,
  X,
  MessageSquare
} from 'lucide-react';
import { useToast } from '../hooks/useToast';
import authService from '../services/authService';
import bookingService from '../services/bookingService';
import reviewService from '../services/reviewService';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import QRCodeDisplay from '../components/QRCodeDisplay';

const MyBookings = () => {
  const { showToast } = useToast();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  
  // Cancel modal state
  const [cancellingBooking, setCancellingBooking] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // QR Modal state (Enhancement #2)
  const [qrModalBooking, setQrModalBooking] = useState(null);

  // Review Modal state (Enhancement #4)
  const [reviewBooking, setReviewBooking] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await authService.getUserBookings();
      if (res.success && res.bookings) {
        setBookings(res.bookings);
      }
    } catch (err) {
      console.error('Failed to load bookings:', err);
      showToast('Could not retrieve your booking history', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleConfirmCancel = async () => {
    if (!cancellingBooking) return;
    setIsCancelling(true);
    try {
      const res = await bookingService.cancelBooking(cancellingBooking._id);
      if (res.success) {
        showToast('Booking cancelled successfully and simulated refund issued', 'success');
        setCancellingBooking(null);
        fetchBookings();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to cancel booking', 'error');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewBooking || !reviewComment.trim()) return;

    setSubmittingReview(true);
    try {
      const res = await reviewService.createReview({
        hotelId: reviewBooking.hotelId._id || reviewBooking.hotelId,
        bookingId: reviewBooking._id,
        rating: reviewRating,
        comment: reviewComment,
      });

      if (res.success) {
        showToast('Thank you! Your verified review has been published.', 'success');
        setReviewBooking(null);
        setReviewComment('');
        setReviewRating(5);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit review', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Confirmed') return b.bookingStatus === 'Confirmed' || b.bookingStatus === 'Checked In';
    return b.bookingStatus === activeTab;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-teal-600">Module 1 & 3 — Guest Account</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Booking History
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track past stays, view digital vouchers, scan QR check-in passes, or write verified reviews.
          </p>
        </div>

        <Link
          to="/hotels"
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 transition"
        >
          <span>Book a New Stay</span>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-slate-200">
        {['All', 'Confirmed', 'Cancelled'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 px-4 text-xs font-bold transition-all relative ${
              activeTab === tab
                ? 'text-teal-700 border-b-2 border-teal-600'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {tab} Bookings
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {loading ? (
        <LoadingSpinner text="Retrieving your reservation records..." />
      ) : filteredBookings.length === 0 ? (
        <EmptyState
          title="No bookings found"
          description={
            activeTab === 'All'
              ? "You haven't made any reservations yet. Browse our luxury destinations and book your first stay!"
              : `You don't have any ${activeTab.toLowerCase()} bookings.`
          }
          actionText="Explore Hotels"
          actionLink="/hotels"
        />
      ) : (
        <div className="space-y-5">
          {filteredBookings.map((b) => (
            <div
              key={b._id}
              className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              
              {/* Hotel & Room Info */}
              <div className="flex space-x-4 items-start">
                <img
                  src={b.roomId?.image || b.hotelId?.image}
                  alt={b.hotelId?.hotelName}
                  className="w-24 h-24 rounded-2xl object-cover bg-slate-100 flex-shrink-0"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80';
                  }}
                />

                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-black text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md">
                      {b.bookingId}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        b.bookingStatus === 'Confirmed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : b.bookingStatus === 'Checked In'
                          ? 'bg-purple-100 text-purple-800'
                          : b.bookingStatus === 'Cancelled'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      ● {b.bookingStatus}
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-slate-900">
                    {b.hotelId?.hotelName || 'Luxury Resort'}
                  </h3>

                  <p className="text-xs text-slate-500 flex items-center">
                    <MapPin className="w-3.5 h-3.5 text-teal-600 mr-1" />
                    <span>{b.hotelId?.location || 'Destination'}</span>
                  </p>

                  <p className="text-xs font-semibold text-slate-700 pt-1">
                    {b.roomId?.roomType} Suite (Room #{b.roomId?.roomNumber})
                  </p>
                </div>
              </div>

              {/* Dates & Financials */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 border-y md:border-y-0 md:border-l border-slate-100 py-3 md:py-0 md:pl-6 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Check-in</span>
                  <span className="font-bold text-slate-800 mt-0.5 block">
                    {new Date(b.checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block font-medium">Check-out</span>
                  <span className="font-bold text-slate-800 mt-0.5 block">
                    {new Date(b.checkOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <span className="text-slate-400 block font-medium">Total Price</span>
                  <span className="text-base font-black text-slate-900 mt-0.5 block">
                    ${b.totalAmount}
                  </span>
                  {b.couponApplied && (
                    <span className="text-[10px] text-emerald-600 block">Coupon: {b.couponApplied}</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap md:flex-col items-center justify-end gap-2">
                
                {/* QR Pass Trigger (Enhancement #2) */}
                {b.bookingStatus !== 'Cancelled' && (
                  <button
                    onClick={() => setQrModalBooking(b)}
                    className="flex-1 md:flex-none px-3.5 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-xs transition text-center flex items-center justify-center space-x-1"
                    title="Display Digital Check-in QR"
                  >
                    <QrCode className="w-3.5 h-3.5 text-teal-600" />
                    <span>QR Pass</span>
                  </button>
                )}

                {/* Review Trigger (Enhancement #4) */}
                {b.bookingStatus !== 'Cancelled' && (
                  <button
                    onClick={() => setReviewBooking(b)}
                    className="flex-1 md:flex-none px-3.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs transition text-center flex items-center justify-center space-x-1"
                    title="Write a Review"
                  >
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>Review Stay</span>
                  </button>
                )}

                <Link
                  to={`/booking-confirmation/${b.bookingId}`}
                  className="flex-1 md:flex-none px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition text-center flex items-center justify-center space-x-1"
                >
                  <Receipt className="w-3.5 h-3.5" />
                  <span>Voucher</span>
                </Link>

                {b.bookingStatus === 'Confirmed' && (
                  <button
                    onClick={() => setCancellingBooking(b)}
                    className="flex-1 md:flex-none px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition text-center flex items-center justify-center space-x-1"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    <span>Cancel</span>
                  </button>
                )}
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Feature 2: QR Pass Modal */}
      {qrModalBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 border border-slate-200 shadow-2xl relative">
            <button
              onClick={() => setQrModalBooking(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
            <QRCodeDisplay booking={qrModalBooking} size={200} />
            <div className="text-center">
              <button
                onClick={() => setQrModalBooking(null)}
                className="w-full py-2.5 rounded-xl bg-teal-600 text-white font-bold text-xs"
              >
                Close Pass
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feature 4: Write Review Modal */}
      {reviewBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 border border-slate-200 shadow-2xl relative">
            <button
              onClick={() => setReviewBooking(null)}
              className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600">Verified Stay Feedback</span>
              <h3 className="text-lg font-black text-slate-900 mt-0.5">
                Rate {reviewBooking.hotelId?.hotelName}
              </h3>
              <p className="text-xs text-slate-400">Reservation #{reviewBooking.bookingId}</p>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Star Rating (1 to 5)
                </label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="p-1 text-amber-500 hover:scale-110 transition"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= reviewRating ? 'fill-amber-500' : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 font-bold text-sm text-slate-700">
                    {reviewRating} of 5 Stars
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Your Review & Comments *
                </label>
                <textarea
                  rows={4}
                  required
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Describe your room, cleanliness, amenities, front desk service..."
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-teal-600"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReviewBooking(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 font-bold text-xs text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview || !reviewComment.trim()}
                  className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md disabled:opacity-50"
                >
                  {submittingReview ? 'Submitting...' : 'Post Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancellingBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 border border-slate-200 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-lg font-bold text-slate-900">Cancel Reservation?</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Are you sure you want to cancel booking <strong className="text-slate-800">{cancellingBooking.bookingId}</strong> for{' '}
                <strong className="text-slate-800">{cancellingBooking.hotelId?.hotelName}</strong>?
                The room will be released for other travelers and your simulated payment of ${cancellingBooking.totalAmount} will be refunded.
              </p>
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setCancellingBooking(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 font-bold text-xs text-slate-700 hover:bg-slate-50"
              >
                Keep Booking
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={isCancelling}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 disabled:opacity-50"
              >
                {isCancelling ? 'Cancelling...' : 'Yes, Cancel Stay'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default MyBookings;
