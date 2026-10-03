import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin,
  Star,
  Phone,
  CheckCircle2,
  Calendar,
  Filter,
  ArrowLeft,
  Bed,
  ShieldCheck,
  Search,
  MessageSquare,
  Sparkles,
  User
} from 'lucide-react';
import RoomCard from '../components/RoomCard';
import HotelMap from '../components/HotelMap';
import ImageGallery from '../components/ImageGallery';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import hotelService from '../services/hotelService';
import roomService from '../services/roomService';
import reviewService from '../services/reviewService';

const HotelDetails = () => {
  const { id } = useParams();

  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [loading, setLoading] = useState(true);

  // Date availability checker state
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const dayAfterTomorrow = new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0];

  const [checkIn, setCheckIn] = useState(tomorrow);
  const [checkOut, setCheckOut] = useState(dayAfterTomorrow);
  const [guests, setGuests] = useState(2);
  const [checkingDates, setCheckingDates] = useState(false);

  // Room filters
  const [selectedType, setSelectedType] = useState('All');
  const [maxPrice, setMaxPrice] = useState('');

  // Initial fetch
  useEffect(() => {
    const fetchHotelAndRooms = async () => {
      setLoading(true);
      try {
        const res = await hotelService.getHotelById(id);
        if (res.success) {
          setHotel(res.hotel);
          setRooms(res.rooms || []);
        }
      } catch (err) {
        console.error('Failed to load hotel:', err);
      } finally {
        setLoading(false);
      }
    };

    const fetchReviews = async () => {
      setReviewsLoading(true);
      try {
        const res = await reviewService.getHotelReviews(id);
        if (res.success) {
          setReviews(res.reviews || []);
        }
      } catch (err) {
        // Non critical
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchHotelAndRooms();
    fetchReviews();
  }, [id]);

  // Check availability when user applies dates
  const handleCheckDates = async (e) => {
    if (e) e.preventDefault();
    if (!checkIn || !checkOut) return;

    setCheckingDates(true);
    try {
      const res = await roomService.getRooms({
        hotelId: id,
        checkIn,
        checkOut,
      });
      if (res.success && res.rooms) {
        setRooms(res.rooms);
      }
    } catch (err) {
      console.error('Error checking room dates:', err);
    } finally {
      setCheckingDates(false);
    }
  };

  // Filtered rooms
  const filteredRooms = rooms.filter((room) => {
    if (selectedType !== 'All' && room.roomType !== selectedType) {
      return false;
    }
    if (maxPrice && room.pricePerNight > Number(maxPrice)) {
      return false;
    }
    return true;
  });

  if (loading) {
    return <LoadingSpinner text="Loading luxury resort details..." />;
  }

  if (!hotel) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <EmptyState
          title="Hotel Not Found"
          description="The requested hotel property could not be found or may have been removed."
          actionText="Back to Hotels"
          actionLink="/hotels"
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* Back button */}
      <div>
        <Link
          to="/hotels"
          className="inline-flex items-center space-x-2 text-xs font-bold text-slate-500 hover:text-teal-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Hotels</span>
        </Link>
      </div>

      {/* Hotel Showcase Hero */}
      <div className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-md">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
          
          {/* Multi-Photo Hotel Gallery & Lightbox Viewer */}
          <div className="lg:col-span-7 p-4 sm:p-6 bg-slate-50 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-slate-100">
            <ImageGallery
              images={hotel.images && hotel.images.length > 0 ? hotel.images : [hotel.image]}
              title={hotel.hotelName}
              fallbackImage="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80"
              heightClass="h-72 sm:h-96 lg:h-[420px]"
            />
          </div>

          {/* Hotel Metadata & Story */}
          <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div>
                <div className="flex items-center text-teal-600 font-semibold text-xs mb-1.5">
                  <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                  <span>{hotel.location}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                  {hotel.hotelName}
                </h1>
                <p className="text-xs text-slate-400 mt-1 font-medium">{hotel.address}</p>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed">
                {hotel.description}
              </p>

              {/* Amenities Highlights */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Property Highlights & Amenities
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {(hotel.amenities || []).map((amenity, idx) => (
                    <div key={idx} className="flex items-center space-x-1.5 text-xs text-slate-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                      <span className="truncate">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact & Security Info */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-teal-600" />
                <span>{hotel.contactPhone || '+1 (800) 555-0199'}</span>
              </div>
              <div className="flex items-center space-x-1 text-teal-700 font-medium">
                <ShieldCheck className="w-4 h-4" />
                <span>Verified Property</span>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Date Availability Checker Bar */}
      <div className="bg-teal-900 text-white rounded-2xl p-6 shadow-xl">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-teal-300" />
              <span>Check Room Availability for Your Dates</span>
            </h3>
            <span className="text-xs text-teal-300 hidden sm:inline">Real-time room calendar sync</span>
          </div>

          <form onSubmit={handleCheckDates} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-slate-900">
            <div className="bg-white px-3.5 py-2 rounded-xl">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Check-in Date</label>
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
                className="w-full text-xs font-semibold focus:outline-none cursor-pointer"
              />
            </div>

            <div className="bg-white px-3.5 py-2 rounded-xl">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Check-out Date</label>
              <input
                type="date"
                min={checkIn || today}
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full text-xs font-semibold focus:outline-none cursor-pointer"
              />
            </div>

            <div className="bg-white px-3.5 py-2 rounded-xl">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Guests</label>
              <select
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                className="w-full text-xs font-semibold focus:outline-none cursor-pointer bg-transparent"
              >
                <option value={1}>1 Guest</option>
                <option value={2}>2 Guests</option>
                <option value={3}>3 Guests</option>
                <option value={4}>4 Guests</option>
                <option value={5}>5+ Guests</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={checkingDates}
              className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center space-x-2 transition shadow-md disabled:opacity-50 min-h-[46px]"
            >
              <Search className="w-4 h-4" />
              <span>{checkingDates ? 'Checking...' : 'Check Availability'}</span>
            </button>
          </form>
        </div>
      </div>

      {/* Rooms Section */}
      <div className="space-y-6">
        
        {/* Filters and Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center space-x-2">
              <Bed className="w-6 h-6 text-teal-600" />
              <span>Available Rooms & Suites</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Showing {filteredRooms.length} {filteredRooms.length === 1 ? 'room option' : 'room options'} for this property
            </p>
          </div>

          {/* Room Filter Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-1.5 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs">
              <Filter className="w-3.5 h-3.5 text-teal-600" />
              <label className="font-semibold text-slate-500">Type:</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="All">All Types</option>
                <option value="Single">Single</option>
                <option value="Double">Double</option>
                <option value="Deluxe">Deluxe</option>
                <option value="Suite">Suite</option>
                <option value="Family Suite">Family Suite</option>
                <option value="Executive Suite">Executive Suite</option>
              </select>
            </div>

            <div className="flex items-center space-x-1.5 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs">
              <label className="font-semibold text-slate-500">Max Nightly Rate:</label>
              <input
                type="number"
                placeholder="$ Any"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-20 bg-transparent font-bold text-slate-800 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Room Cards List */}
        {filteredRooms.length === 0 ? (
          <EmptyState
            title="No rooms match your filter criteria"
            description="Try changing your room type or clearing your price filter to see more suites."
            actionText="Reset Filters"
            onAction={() => {
              setSelectedType('All');
              setMaxPrice('');
            }}
          />
        ) : (
          <div className="space-y-6">
            {filteredRooms.map((room) => (
              <RoomCard
                key={room._id}
                room={room}
                selectedDates={{ checkIn, checkOut, guests }}
              />
            ))}
          </div>
        )}

      </div>

      {/* Feature 3: 🗺️ Hotel Map (Leaflet & OpenStreetMap) */}
      <HotelMap hotel={hotel} />

      {/* Feature 4: ⭐ Reviews & Ratings Section */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
          <div>
            <div className="flex items-center space-x-2 text-teal-600 font-bold text-xs uppercase tracking-wider mb-1">
              <MessageSquare className="w-4 h-4" />
              <span>Guest Experiences</span>
            </div>
            <h3 className="text-xl font-extrabold text-slate-900">
              Verified Reviews & Ratings
            </h3>
          </div>

          <div className="flex items-center space-x-3 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100">
            <div className="flex items-center space-x-1">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
              <span className="text-xl font-black text-slate-900">{hotel.rating ? hotel.rating.toFixed(1) : '4.8'}</span>
            </div>
            <div className="text-xs text-slate-500">
              <span className="font-semibold block text-slate-800">Overall Score</span>
              <span>Based on {reviews.length} verified stays</span>
            </div>
          </div>
        </div>

        {reviewsLoading ? (
          <LoadingSpinner text="Loading verified guest reviews..." />
        ) : reviews.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            <p>No customer reviews submitted for this property yet.</p>
            <p className="mt-1">Completed stays can be reviewed directly from your <Link to="/my-bookings" className="text-teal-600 underline font-bold">My Bookings</Link> dashboard.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((rev) => (
              <div key={rev._id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs">
                      {rev.userId?.name ? rev.userId.name.charAt(0).toUpperCase() : 'G'}
                    </div>
                    <div>
                      <p className="font-bold text-xs text-slate-800">{rev.userId?.name || 'Verified Guest'}</p>
                      <span className="text-[10px] text-emerald-600 font-semibold flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Verified Stay</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < rev.rating
                            ? 'text-amber-500 fill-amber-500'
                            : 'text-slate-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed pl-10">
                  "{rev.comment}"
                </p>

                <p className="text-[10px] text-slate-400 pl-10">
                  Reviewed on {new Date(rev.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default HotelDetails;
