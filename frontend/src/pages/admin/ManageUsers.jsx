import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  CalendarCheck2,
  Mail,
  Phone,
  Shield,
  X,
  MapPin,
  FileText
} from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import adminService from '../../services/adminService';
import LoadingSpinner from '../../components/LoadingSpinner';

const ManageUsers = () => {
  const { showToast } = useToast();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // User's Bookings Drawer / Modal
  const [selectedUser, setSelectedUser] = useState(null);
  const [userBookings, setUserBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminService.getAllUsers();
      if (res.success && res.users) {
        setUsers(res.users);
      }
    } catch (err) {
      showToast('Failed to load registered users', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleViewUserBookings = async (user) => {
    setSelectedUser(user);
    setLoadingBookings(true);
    try {
      const res = await adminService.getUserBookingsAdmin(user._id);
      if (res.success && res.bookings) {
        setUserBookings(res.bookings);
      }
    } catch (err) {
      showToast('Could not retrieve user reservations', 'error');
    } finally {
      setLoadingBookings(false);
    }
  };

  const filteredUsers = users.filter((u) =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.phone?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-teal-600">Module 4 — User Directory</span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Registered Customers & Staff</h1>
          <p className="text-xs text-slate-500 mt-1">Review guest accounts, verify roles, and check customer booking history.</p>
        </div>

        <button
          onClick={fetchUsers}
          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold self-start sm:self-auto transition"
        >
          Refresh Users
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or phone..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-teal-600"
          />
        </div>
        <span className="text-xs font-semibold text-slate-500">
          Total Registered: <strong className="text-slate-900">{users.length}</strong>
        </span>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner text="Retrieving member accounts..." />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-6">User</th>
                  <th className="py-3.5 px-6">Phone Number</th>
                  <th className="py-3.5 px-6">System Role</th>
                  <th className="py-3.5 px-6">Joined Date</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/60 transition">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-full bg-slate-100 text-teal-700 flex items-center justify-center font-black text-xs">
                          {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <p className="font-extrabold text-slate-900">{u.name}</p>
                          <p className="text-[11px] text-slate-400 font-mono">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6 font-mono text-slate-600">
                      {u.phone || 'N/A'}
                    </td>

                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          u.role === 'Admin'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-teal-50 text-teal-800'
                        }`}
                      >
                        {u.role === 'Admin' && <Shield className="w-3 h-3" />}
                        <span>{u.role}</span>
                      </span>
                    </td>

                    <td className="py-4 px-6 text-slate-500">
                      {new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>

                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleViewUserBookings(u)}
                        className="px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-600 text-teal-700 hover:text-white font-bold text-xs transition inline-flex items-center space-x-1"
                      >
                        <CalendarCheck2 className="w-3.5 h-3.5" />
                        <span>Booking History</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* User Bookings History Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 border border-slate-200 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Customer Booking Records</span>
                <h3 className="text-xl font-black text-slate-900">{selectedUser.name}'s History</h3>
                <p className="text-xs text-slate-400">{selectedUser.email}</p>
              </div>
              <button onClick={() => setSelectedUser(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingBookings ? (
              <LoadingSpinner text="Retrieving guest records..." />
            ) : userBookings.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                This user has not completed any hotel reservations yet.
              </div>
            ) : (
              <div className="space-y-3">
                {userBookings.map((ub) => (
                  <div key={ub._id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-teal-700">{ub.bookingId}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            ub.bookingStatus === 'Confirmed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {ub.bookingStatus}
                        </span>
                      </div>
                      <p className="font-bold text-slate-800 mt-1">{ub.hotelId?.hotelName}</p>
                      <p className="text-slate-400">Room #{ub.roomId?.roomNumber} ({ub.roomId?.roomType})</p>
                    </div>

                    <div className="text-right">
                      <p className="font-black text-slate-900 text-sm">${ub.totalAmount}</p>
                      <p className="text-slate-500">
                        {new Date(ub.checkIn).toLocaleDateString()} – {new Date(ub.checkOut).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default ManageUsers;
