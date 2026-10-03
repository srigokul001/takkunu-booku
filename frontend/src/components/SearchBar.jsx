import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Calendar, Users, MapPin } from 'lucide-react';

const SearchBar = ({ initialValues = {} }) => {
  const navigate = useNavigate();

  // Tomorrow as default checkIn, day after tomorrow as checkOut
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const dayAfterTomorrow = new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0];

  const [location, setLocation] = useState(initialValues.location || '');
  const [checkIn, setCheckIn] = useState(initialValues.checkIn || tomorrow);
  const [checkOut, setCheckOut] = useState(initialValues.checkOut || dayAfterTomorrow);
  const [guests, setGuests] = useState(initialValues.guests || 2);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (location.trim()) params.set('location', location.trim());
    if (checkIn) params.set('checkIn', checkIn);
    if (checkOut) params.set('checkOut', checkOut);
    if (guests) params.set('guests', guests);

    navigate(`/hotels?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSearch}
      className="bg-white p-3 sm:p-4 rounded-2xl shadow-xl border border-slate-200/80 backdrop-blur-md grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-center"
    >
      {/* Location Input */}
      <div className="flex items-center px-4 py-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl transition border border-transparent focus-within:border-teal-500 focus-within:bg-white">
        <MapPin className="w-5 h-5 text-teal-600 mr-3 flex-shrink-0" />
        <div className="flex-1">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Destination / City</label>
          <input
            type="text"
            placeholder="e.g. Miami, New York, Aspen"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full bg-transparent text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Dates Input */}
      <div className="flex items-center px-4 py-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl transition border border-transparent focus-within:border-teal-500 focus-within:bg-white">
        <Calendar className="w-5 h-5 text-teal-600 mr-3 flex-shrink-0" />
        <div className="flex-1 grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Check-in</label>
            <input
              type="date"
              min={today}
              value={checkIn}
              onChange={(e) => {
                setCheckIn(e.target.value);
                if (e.target.value >= checkOut) {
                  const nextDay = new Date(new Date(e.target.value).getTime() + 86400000).toISOString().split('T')[0];
                  setCheckOut(nextDay);
                }
              }}
              className="w-full bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Check-out</label>
            <input
              type="date"
              min={checkIn || today}
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full bg-transparent text-xs font-semibold text-slate-800 focus:outline-none cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Guests Selector */}
      <div className="flex items-center px-4 py-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl transition border border-transparent focus-within:border-teal-500 focus-within:bg-white">
        <Users className="w-5 h-5 text-teal-600 mr-3 flex-shrink-0" />
        <div className="flex-1">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Travelers</label>
          <select
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            className="w-full bg-transparent text-sm font-semibold text-slate-800 focus:outline-none cursor-pointer"
          >
            <option value={1}>1 Adult (Single)</option>
            <option value={2}>2 Adults (Couple)</option>
            <option value={3}>3 Guests</option>
            <option value={4}>4 Guests (Family)</option>
            <option value={5}>5+ Guests</option>
          </select>
        </div>
      </div>

      {/* Search Submit Button */}
      <div className="h-full flex items-center">
        <button
          type="submit"
          className="w-full h-full min-h-[52px] bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl flex items-center justify-center space-x-2 transition-all shadow-lg shadow-teal-600/30 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Search className="w-4 h-4" />
          <span>Search Stays</span>
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
