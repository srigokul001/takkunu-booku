import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, MapPin, Building, RotateCcw } from 'lucide-react';
import HotelCard from '../components/HotelCard';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import hotelService from '../services/hotelService';

const Hotels = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialLocation = searchParams.get('location') || '';

  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(initialLocation);
  const [activeFilter, setActiveFilter] = useState(initialLocation);
  const [selectedRating, setSelectedRating] = useState('All');
  const [selectedAmenity, setSelectedAmenity] = useState('All');
  const [sortBy, setSortBy] = useState('Featured');

  const fetchHotels = async (searchQuery) => {
    setLoading(true);
    try {
      const params = {};
      if (searchQuery && searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      const res = await hotelService.getHotels(params);
      if (res.success && res.hotels) {
        setHotels(res.hotels);
      }
    } catch (err) {
      console.error('Failed to fetch hotels:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels(initialLocation);
    setActiveFilter(initialLocation);
    setSearchTerm(initialLocation);
  }, [initialLocation]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setActiveFilter(searchTerm);
    if (searchTerm.trim()) {
      setSearchParams({ location: searchTerm.trim() });
    } else {
      setSearchParams({});
    }
    fetchHotels(searchTerm);
  };

  const handleClear = () => {
    setSearchTerm('');
    setActiveFilter('');
    setSelectedRating('All');
    setSelectedAmenity('All');
    setSortBy('Featured');
    setSearchParams({});
    fetchHotels('');
  };

  const displayedHotels = hotels
    .filter((h) => {
      if (selectedRating !== 'All' && (h.rating || 0) < Number(selectedRating)) return false;
      if (
        selectedAmenity !== 'All' &&
        !(h.amenities || []).some((a) => a.toLowerCase().includes(selectedAmenity.toLowerCase()))
      )
        return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'Rating') return (b.rating || 0) - (a.rating || 0);
      return 0;
    });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Page Title & Search Header */}
      <div className="bg-gradient-to-r from-teal-900 to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-teal-400">Exclusive Destinations</span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Explore Handcrafted Hotels
          </h1>
          <p className="text-sm text-slate-300">
            Search our boutique collection of coastal resorts, mountain lodges, and urban penthouses by hotel name, city, or destination.
          </p>

          {/* Inline Location & Name Search Bar */}
          <form onSubmit={handleSearchSubmit} className="pt-2 flex flex-col sm:flex-row gap-2 max-w-lg">
            <div className="relative flex-1">
              <MapPin className="w-4 h-4 text-teal-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by hotel name, city, or location..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 text-sm focus:outline-none focus:bg-white focus:text-slate-900 transition"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm transition flex items-center justify-center space-x-1.5 shadow-md"
            >
              <Search className="w-4 h-4" />
              <span>Search</span>
            </button>
            {activeFilter && (
              <button
                type="button"
                onClick={handleClear}
                className="px-3 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 text-sm font-medium transition flex items-center justify-center"
                title="Clear filter"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </form>
        </div>
      </div>

      {/* Filter Status, Options & Count */}
      <div className="space-y-4 border-b border-slate-200 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2 text-sm text-slate-600 font-medium">
            <Building className="w-4 h-4 text-teal-600" />
            <span>Showing <strong className="text-slate-900">{displayedHotels.length}</strong> available properties</span>
            {activeFilter && (
              <span className="px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 text-xs font-semibold">
                "{activeFilter}"
              </span>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Rating Filter */}
            <select
              value={selectedRating}
              onChange={(e) => setSelectedRating(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold focus:outline-none focus:border-teal-600"
            >
              <option value="All">All Ratings</option>
              <option value="4.8">★ 4.8 & Above</option>
              <option value="4.5">★ 4.5 & Above</option>
              <option value="4.0">★ 4.0 & Above</option>
            </select>

            {/* Amenity Filter */}
            <select
              value={selectedAmenity}
              onChange={(e) => setSelectedAmenity(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold focus:outline-none focus:border-teal-600"
            >
              <option value="All">All Amenities</option>
              <option value="Wi-Fi">Free Wi-Fi</option>
              <option value="Pool">Swimming Pool</option>
              <option value="Ocean View">Ocean View</option>
              <option value="Restaurant">Restaurant</option>
              <option value="Spa">Spa & Wellness</option>
            </select>

            {/* Sort Filter */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold focus:outline-none focus:border-teal-600"
            >
              <option value="Featured">Sort: Featured</option>
              <option value="Rating">Sort: Top Rated</option>
            </select>

            {(activeFilter || selectedRating !== 'All' || selectedAmenity !== 'All') && (
              <button
                onClick={handleClear}
                className="text-xs font-bold text-teal-600 hover:text-teal-700 underline ml-1"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Hotels Grid */}
      {loading ? (
        <LoadingSpinner text="Loading luxury hotels..." />
      ) : displayedHotels.length === 0 ? (
        <EmptyState
          title="No hotels match your filters"
          description={`We couldn't find any hotels matching your search or filters. Try adjusting your criteria or clearing filters.`}
          actionText="View All Available Hotels"
          onAction={handleClear}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayedHotels.map((hotel) => (
            <HotelCard key={hotel._id} hotel={hotel} />
          ))}
        </div>
      )}

    </div>
  );
};

export default Hotels;
