import React, { useState, useEffect } from 'react';
import {
  CalendarCheck2,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Eye,
  X,
  MapPin,
  User,
  DollarSign,
  Receipt
} from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import adminService from '../../services/adminService';
import LoadingSpinner from '../../components/LoadingSpinner';

const ManageBookings = () => {
  const { showToast } = useToast();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');

  // Selected Booking Details Modal
  const [activeBooking, setActiveBooking] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter !== 'All') params.status = statusFilter;
      if (search.trim()) params.search = search.trim();

      const res = await adminService.getAllBookings(params);
      if (res.success && res.bookings) {
        setBookings(res.bookings);
      }
    } catch (err) {
      showToast('Failed to load bookings', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchBookings();
  };

  const handleUpdateStatus = async (bookingId, newStatus) => {
    setUpdatingId(bookingId);
    try {
      const res = await adminService.updateBookingStatus(bookingId, {
        bookingStatus: newStatus,
      });
      if (res.success) {
        showToast(`Booking status changed to ${newStatus}`, 'success');
        if (activeBooking && activeBooking._id === bookingId) {
          setActiveBooking(res.booking);
        }
        fetchBookings();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update status', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-teal-600">Module 4 — Reservations Control</span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Manage System Bookings</h1>
          <p className="text-xs text-slate-500 mt-1">Review guest reservations, verify payments, and change booking status.</p>
        </div>

        <button
          onClick={fetchBookings}
          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold self-start sm:self-auto transition"
        >
          Refresh Bookings
        </button>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80 flex">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Booking ID (e.g. BK-)..."
            className="w-full pl-9 pr-20 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-teal-600"
          />
          <button
            type="submit"
            className="absolute right-1 top-1 bottom-1 px-3 bg-teal-600 text-white rounded-lg text-xs font-bold hover:bg-teal-700"
          >
            Search
          </button>
        </form>

        {/* Status Filters */}
        <div className="flex items-center space-x-2 text-xs w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <span className="font-bold text-slate-500 flex-shrink-0">Status:</span>
          {['All', 'Confirmed', 'Pending', 'Cancelled', 'Completed'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl font-bold transition flex-shrink-0 ${
                statusFilter === st
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner text="Retrieving bookings registry..." />
      ) : bookings.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200/80 text-center space-y-2">
          <Receipt className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Bookings Found</h3>
          <p className="text-xs text-slate-400">No bookings match the selected filters or search keyword.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-6">Booking ID</th>
                  <th className="py-3.5 px-6">Customer & Guest</th>
                  <th className="py-3.5 px-6">Property / Room</th>
                  <th className="py-3.5 px-6">Dates & Nights</th>
                  <th className="py-3.5 px-6">Amount</th>
                  <th className="py-3.5 px-6">Booking Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {bookings.map((b) => (
                  <tr key={b._id} className="hover:bg-slate-50/60 transition">
                    <td className="py-4 px-6 font-mono font-black text-teal-700">
                      {b.bookingId}
                    </td>

                    <td className="py-4 px-6">
                      <p className="font-bold text-slate-900">{b.guestDetails?.guestName || b.userId?.name}</p>
                      <p className="text-[11px] text-slate-400">{b.guestDetails?.guestEmail || b.userId?.email}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{b.guestDetails?.guestPhone}</p>
                    </td>

                    <td className="py-4 px-6">
                      <p className="font-bold text-slate-800">{b.hotelId?.hotelName}</p>
                      <p className="text-[11px] text-slate-400">
                        Room #{b.roomId?.roomNumber} ({b.roomId?.roomType})
                      </p>
                    </td>

                    <td className="py-4 px-6">
                      <p className="font-semibold text-slate-700">
                        {new Date(b.checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} –{' '}
                        {new Date(b.checkOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                      <p className="text-[10px] text-teal-700 font-bold">{b.totalNights} Nights • {b.numberOfGuests} Guests</p>
                    </td>

                    <td className="py-4 px-6">
                      <p className="font-black text-slate-900 text-sm">${b.totalAmount}</p>
                      <span className="text-[10px] text-emerald-600 font-semibold">{b.paymentStatus}</span>
                    </td>

                    <td className="py-4 px-6">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          b.bookingStatus === 'Confirmed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : b.bookingStatus === 'Cancelled'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        ● {b.bookingStatus}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => setActiveBooking(b)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {b.bookingStatus !== 'Confirmed' && (
                          <button
                            disabled={updatingId === b._id}
                            onClick={() => handleUpdateStatus(b._id, 'Confirmed')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-[11px] transition"
                            title="Confirm Booking"
                          >
                            Confirm
                          </button>
                        )}

                        {b.bookingStatus !== 'Cancelled' && (
                          <button
                            disabled={updatingId === b._id}
                            onClick={() => handleUpdateStatus(b._id, 'Cancelled')}
                            className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-[11px] transition"
                            title="Cancel Booking"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Booking Details Modal */}
      {activeBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 border border-slate-200 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Booking Details</span>
                <h3 className="text-xl font-black text-slate-900 font-mono">{activeBooking.bookingId}</h3>
              </div>
              <button onClick={() => setActiveBooking(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <p className="font-bold text-slate-800 text-sm">{activeBooking.hotelId?.hotelName}</p>
                <p className="text-slate-500">{activeBooking.hotelId?.address}, {activeBooking.hotelId?.location}</p>
                <p className="text-teal-700 font-semibold pt-1">
                  {activeBooking.roomId?.roomType} (Room #{activeBooking.roomId?.roomNumber})
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-400 font-semibold block">Check-in</span>
                  <span className="font-bold text-slate-800">{new Date(activeBooking.checkIn).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Check-out</span>
                  <span className="font-bold text-slate-800">{new Date(activeBooking.checkOut).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Guests</span>
                  <span className="font-bold text-slate-800">{activeBooking.numberOfGuests} Adults</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Total Revenue</span>
                  <span className="font-black text-slate-900 text-sm">${activeBooking.totalAmount}</span>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3 space-y-1">
                <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Guest Contact</span>
                <p><span className="text-slate-400">Name:</span> <strong className="text-slate-800">{activeBooking.guestDetails?.guestName}</strong></p>
                <p><span className="text-slate-400">Email:</span> {activeBooking.guestDetails?.guestEmail}</p>
                <p><span className="text-slate-400">Phone:</span> {activeBooking.guestDetails?.guestPhone}</p>
                {activeBooking.guestDetails?.specialRequests && (
                  <p className="text-slate-500 italic pt-1">Requests: "{activeBooking.guestDetails.specialRequests}"</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-500">Status: {activeBooking.bookingStatus}</span>
              <div className="flex space-x-2">
                {activeBooking.bookingStatus !== 'Confirmed' && (
                  <button
                    onClick={() => handleUpdateStatus(activeBooking._id, 'Confirmed')}
                    className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 shadow-sm"
                  >
                    Confirm Booking
                  </button>
                )}
                {activeBooking.bookingStatus !== 'Cancelled' && (
                  <button
                    onClick={() => handleUpdateStatus(activeBooking._id, 'Cancelled')}
                    className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 shadow-sm"
                  >
                    Cancel Booking
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ManageBookings;
