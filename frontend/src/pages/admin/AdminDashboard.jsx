import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  BedDouble,
  Users,
  CalendarCheck2,
  DollarSign,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  XCircle,
  ExternalLink,
  Percent,
  BarChart3,
  Award,
  Sparkles,
  QrCode
} from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import adminService from '../../services/adminService';

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await adminService.getDashboardStats();
        if (res.success) {
          setData(res);
        }
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Aggregating hotel metrics & analytics..." />;
  }

  const { stats = {}, recentBookings = [] } = data || {};

  const statCards = [
    {
      title: 'Total Hotels',
      value: stats.totalHotels || 0,
      icon: Building2,
      color: 'bg-blue-500',
      link: '/admin/hotels',
      badge: 'Active Properties',
    },
    {
      title: 'Total Rooms',
      value: stats.totalRooms || 0,
      icon: BedDouble,
      color: 'bg-teal-500',
      link: '/admin/rooms',
      badge: 'Across All Hotels',
    },
    {
      title: 'Total Users',
      value: stats.totalUsers || 0,
      icon: Users,
      color: 'bg-purple-500',
      link: '/admin/users',
      badge: 'Registered Guests',
    },
    {
      title: 'Total Bookings',
      value: stats.totalBookings || 0,
      icon: CalendarCheck2,
      color: 'bg-amber-500',
      link: '/admin/bookings',
      badge: 'All-time reservations',
    },
    {
      title: 'Total Revenue',
      value: `$${(stats.totalRevenue || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-emerald-500',
      link: '/admin/bookings',
      badge: 'Confirmed Bookings',
    },
  ];

  // Maximum values for SVG bar chart scaling
  const monthlyData = stats.monthlyChartData || [];
  const maxBooking = Math.max(...monthlyData.map((d) => d.bookings), 10);
  const maxRevenue = Math.max(...monthlyData.map((d) => d.revenue), 5000);

  return (
    <div className="space-y-8">
      
      {/* Page Title & Fast Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-teal-600">Module 4 — Administrative Hub</span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Dashboard Overview & Advanced Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time occupancy figures, monthly trends, guest reservations, and property revenues.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/staff/check-in"
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition flex items-center space-x-1.5"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>QR Digital Check-in</span>
          </Link>
          <Link
            to="/admin/hotels"
            className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md transition"
          >
            + Add Hotel
          </Link>
          <Link
            to="/admin/rooms"
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition"
          >
            + Add Room
          </Link>
        </div>
      </div>

      {/* 5 Stats Cards (Original requirement) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((card, idx) => (
          <Link
            key={idx}
            to={card.link}
            className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {card.title}
              </span>
              <div className={`w-9 h-9 rounded-xl ${card.color} text-white flex items-center justify-center shadow-md`}>
                <card.icon className="w-5 h-5" />
              </div>
            </div>

            <div>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 group-hover:text-teal-700 transition">
                {card.value}
              </p>
              <p className="text-[11px] font-semibold text-slate-400 mt-1">
                {card.badge}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Feature 7 & 8: Room Occupancy & Operational Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Available Rooms */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg flex-shrink-0">
            {stats.availableRooms || 0}
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Available Rooms</span>
            <span className="text-xs font-bold text-slate-800">Ready for instant guest booking</span>
          </div>
        </div>

        {/* Occupied Rooms */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-lg flex-shrink-0">
            {stats.occupiedRooms || 0}
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Occupied / Booked</span>
            <span className="text-xs font-bold text-slate-800">Currently checked-in & reserved</span>
          </div>
        </div>

        {/* Current Occupancy Rate */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-lg flex-shrink-0">
            <Percent className="w-6 h-6 text-teal-600" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Current Occupancy</span>
            <span className="text-xl font-black text-slate-900">{stats.currentOccupancy || 0}%</span>
          </div>
        </div>

        {/* Most Booked Room Type */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold flex-shrink-0">
            <Award className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Top Room Type</span>
            <span className="text-base font-extrabold text-slate-900">{stats.mostBookedRoomType || 'Deluxe'}</span>
          </div>
        </div>

      </div>

      {/* Feature 7: Monthly Booking Chart & Monthly Revenue Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Monthly Bookings Bar Chart */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center space-x-1.5 text-xs font-bold text-teal-600 uppercase tracking-wider">
                <BarChart3 className="w-4 h-4" />
                <span>Reservation Trends</span>
              </div>
              <h3 className="text-base font-black text-slate-900 mt-0.5">Monthly Booking Volume</h3>
            </div>
            <span className="text-xs text-slate-400 font-semibold">Total: {stats.totalBookings || 0}</span>
          </div>

          <div className="h-48 flex items-end justify-between gap-3 pt-6 px-2">
            {monthlyData.map((item, idx) => {
              const heightPercent = Math.max(15, Math.round((item.bookings / maxBooking) * 100));
              return (
                <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                  <span className="text-[10px] font-bold text-teal-700 opacity-0 group-hover:opacity-100 transition mb-1">
                    {item.bookings}
                  </span>
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full bg-gradient-to-t from-teal-600 to-teal-400 rounded-t-xl transition-all duration-500 hover:brightness-110 shadow-sm"
                  />
                  <span className="text-[11px] font-semibold text-slate-500 mt-2 block">
                    {item.month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Monthly Revenue Bar Chart */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-600 uppercase tracking-wider">
                <TrendingUp className="w-4 h-4" />
                <span>Financial Performance</span>
              </div>
              <h3 className="text-base font-black text-slate-900 mt-0.5">Monthly Revenue Growth</h3>
            </div>
            <span className="text-xs text-emerald-700 font-bold font-mono">${(stats.totalRevenue || 0).toLocaleString()}</span>
          </div>

          <div className="h-48 flex items-end justify-between gap-3 pt-6 px-2">
            {monthlyData.map((item, idx) => {
              const heightPercent = Math.max(15, Math.round((item.revenue / maxRevenue) * 100));
              return (
                <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                  <span className="text-[10px] font-bold text-emerald-700 opacity-0 group-hover:opacity-100 transition mb-1">
                    ${item.revenue}
                  </span>
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-xl transition-all duration-500 hover:brightness-110 shadow-sm"
                  />
                  <span className="text-[11px] font-semibold text-slate-500 mt-2 block">
                    {item.month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Booking Status Summary Banner */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
          Reservation Breakdown by Status
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
            <span className="text-xs font-bold text-emerald-800 flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Confirmed</span>
            </span>
            <p className="text-2xl font-black text-emerald-900 mt-2">
              {stats.bookingStatusMap?.Confirmed || 0}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-purple-50 border border-purple-100">
            <span className="text-xs font-bold text-purple-800 flex items-center space-x-1.5">
              <QrCode className="w-4 h-4 text-purple-600" />
              <span>Checked In</span>
            </span>
            <p className="text-2xl font-black text-purple-900 mt-2">
              {stats.bookingStatusMap?.['Checked In'] || 0}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100">
            <span className="text-xs font-bold text-amber-800 flex items-center space-x-1.5">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Pending</span>
            </span>
            <p className="text-2xl font-black text-amber-900 mt-2">
              {stats.bookingStatusMap?.Pending || 0}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100">
            <span className="text-xs font-bold text-rose-800 flex items-center space-x-1.5">
              <XCircle className="w-4 h-4 text-rose-600" />
              <span>Cancelled</span>
            </span>
            <p className="text-2xl font-black text-rose-900 mt-2">
              {stats.bookingStatusMap?.Cancelled || 0}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100">
            <span className="text-xs font-bold text-blue-800 flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Completed</span>
            </span>
            <p className="text-2xl font-black text-blue-900 mt-2">
              {stats.bookingStatusMap?.Completed || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Recent Bookings Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Recent Customer Bookings</h3>
            <p className="text-xs text-slate-400">Latest 5 reservations created on the platform</p>
          </div>

          <Link
            to="/admin/bookings"
            className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center space-x-1"
          >
            <span>View All Bookings</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentBookings.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No booking records currently recorded.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-6">Booking ID</th>
                  <th className="py-3.5 px-6">Guest</th>
                  <th className="py-3.5 px-6">Hotel & Room</th>
                  <th className="py-3.5 px-6">Check-in / Out</th>
                  <th className="py-3.5 px-6">Total Amount</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {recentBookings.map((b) => (
                  <tr key={b._id} className="hover:bg-slate-50/60 transition">
                    <td className="py-4 px-6 font-mono font-bold text-teal-700">
                      {b.bookingId}
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-bold text-slate-900">{b.userId?.name || b.guestDetails?.guestName}</p>
                      <p className="text-[11px] text-slate-400">{b.userId?.email || b.guestDetails?.guestEmail}</p>
                    </td>
                    <td className="py-4 px-6">
                      <p className="font-semibold text-slate-800">{b.hotelId?.hotelName}</p>
                      <p className="text-[11px] text-slate-400">Room #{b.roomId?.roomNumber} ({b.roomId?.roomType})</p>
                    </td>
                    <td className="py-4 px-6 text-slate-600">
                      {new Date(b.checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} –{' '}
                      {new Date(b.checkOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </td>
                    <td className="py-4 px-6 font-black text-slate-900">
                      ${b.totalAmount}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          b.bookingStatus === 'Confirmed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : b.bookingStatus === 'Checked In'
                            ? 'bg-purple-100 text-purple-800'
                            : b.bookingStatus === 'Cancelled'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {b.bookingStatus}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        to="/admin/bookings"
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-700 font-bold text-[11px] transition inline-flex items-center space-x-1"
                      >
                        <span>Manage</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default AdminDashboard;
