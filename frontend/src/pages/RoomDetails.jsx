import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Users,
  CheckCircle2,
  Calendar,
  ArrowLeft,
  ShieldCheck,
  Building,
  CreditCard,
  AlertCircle
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import ImageGallery from '../components/ImageGallery';
import roomService from '../services/roomService';

const RoomDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);

  // Booking date state
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const dayAfterTomorrow = new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0];

  const [checkIn, setCheckIn] = useState(tomorrow);
  const [checkOut, setCheckOut] = useState(dayAfterTomorrow);
  const [guests, setGuests] = useState(2);
  const [isAvailable, setIsAvailable] = useState(true);
  const [availabilityMessage, setAvailabilityMessage] = useState('');

  useEffect(() => {
    const fetchRoom = async () => {
      setLoading(true);
      try {
        const res = await roomService.getRoomById(id);
        if (res.success && res.room) {
          setRoom(res.room);
          setGuests(Math.min(2, res.room.capacity));
        }
      } catch (err) {
        console.error('Failed to load room details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRoom();
  }, [id]);

  // Compute nights and total price
  const startDate = new Date(checkIn);
  const endDate = new Date(checkOut);
  const nights = Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)));
  const totalPrice = room ? nights * room.pricePerNight : 0;

  // Check availability when dates change
  useEffect(() => {
    if (!room || !checkIn || !checkOut) return;

    const checkAvail = async () => {
      try {
        const res = await roomService.checkAvailability(room._id, checkIn, checkOut);
        if (res.success) {
          setIsAvailable(res.available);
          setAvailabilityMessage(res.message);
        }
      } catch (err) {
        setIsAvailable(false);
        setAvailabilityMessage(err.response?.data?.message || 'Date selection error');
      }
    };

    checkAvail();
  }, [room, checkIn, checkOut]);

  const handleProceedToBook = () => {
    const params = new URLSearchParams({
      roomId: room._id,
      hotelId: room.hotelId._id || room.hotelId,
      checkIn,
      checkOut,
      guests,
    });
    navigate(`/booking?${params.toString()}`);
  };

  if (loading) {
    return <LoadingSpinner text="Loading luxury room details..." />;
  }

  if (!room) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <EmptyState
          title="Room Not Found"
          description="The requested room could not be located."
          actionText="Explore Hotels"
          actionLink="/hotels"
        />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Navigation */}
      <div>
        <Link
          to={`/hotels/${room.hotelId?._id || room.hotelId}`}
          className="inline-flex items-center space-x-2 text-xs font-bold text-slate-500 hover:text-teal-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to {room.hotelId?.hotelName || 'Hotel'}</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Room Multi-Photo Gallery & Amenities */}
        <div className="lg:col-span-7 space-y-6">
          <div className="relative">
            <ImageGallery
              images={room.images && room.images.length > 0 ? room.images : [room.image]}
              title={`${room.roomType} Suite — Room #${room.roomNumber}`}
              fallbackImage="https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80"
              heightClass="h-80 sm:h-96 lg:h-[400px]"
            />
            <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-teal-800 shadow pointer-events-none z-10">
              {room.roomType} Suite
            </div>
            <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-white shadow pointer-events-none z-10">
              Room #{room.roomNumber}
            </div>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 space-y-6">
            <div>
              <div className="flex items-center space-x-2 text-xs text-slate-400 font-semibold mb-1">
                <Building className="w-4 h-4 text-teal-600" />
                <span>{room.hotelId?.hotelName} - {room.hotelId?.location}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
                {room.roomType} Suite — Room #{room.roomNumber}
              </h1>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                {room.description}
              </p>
            </div>

            {/* Room Features */}
            <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Max Occupancy</p>
                  <p className="text-sm font-bold text-slate-800">{room.capacity} Guests</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Nightly Rate</p>
                  <p className="text-sm font-bold text-slate-800">${room.pricePerNight} / night</p>
                </div>
              </div>
            </div>

            {/* Amenities Checklist */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Room Amenities & Inclusions
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {(room.amenities || []).map((amenity, idx) => (
                  <div key={idx} className="flex items-center space-x-2 text-xs text-slate-700 bg-slate-50 p-2 rounded-xl">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0" />
                    <span className="font-medium">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Right Side: Date Selector & Booking Calculator */}
        <div className="lg:col-span-5">
          <div className="sticky top-28 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xl space-y-6">
            
            <div className="flex items-baseline justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-3xl font-black text-slate-900">${room.pricePerNight}</span>
                <span className="text-xs text-slate-400 font-medium ml-1">/ night</span>
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                Instant Confirmation
              </span>
            </div>

            {/* Date Selection Box */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Check-in</label>
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
                    className="w-full text-xs font-bold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
                  />
                </div>
                <div className="border-l border-slate-200 pl-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Check-out</label>
                  <input
                    type="date"
                    min={checkIn || today}
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full text-xs font-bold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Guests
                </label>
                <select
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-slate-50 focus:outline-none"
                >
                  {Array.from({ length: room.capacity }, (_, i) => i + 1).map((num) => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'Guest' : 'Guests'} (Max {room.capacity})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Availability Alert */}
            {availabilityMessage && (
              <div
                className={`p-3 rounded-xl text-xs font-medium flex items-start space-x-2 ${
                  isAvailable
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {isAvailable ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                )}
                <span>{availabilityMessage}</span>
              </div>
            )}

            {/* Price Breakdown */}
            <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>${room.pricePerNight} × {nights} {nights === 1 ? 'night' : 'nights'}</span>
                <span className="font-semibold text-slate-800">${totalPrice}</span>
              </div>
              <div className="flex justify-between">
                <span>Cleaning & Hospitality Fees</span>
                <span className="font-semibold text-emerald-600">FREE</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-slate-100 text-sm font-bold text-slate-900">
                <span>Total Amount</span>
                <span className="text-teal-700 text-lg">${totalPrice}</span>
              </div>
            </div>

            {/* Book Now Button */}
            <button
              onClick={handleProceedToBook}
              disabled={!isAvailable}
              className="w-full py-3.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-lg shadow-teal-600/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{isAvailable ? 'Reserve This Room' : 'Unavailable for Selected Dates'}</span>
            </button>

            <div className="text-center">
              <p className="text-[11px] text-slate-400 flex items-center justify-center space-x-1">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                <span>Dummy payment processed at next step. No actual card charge.</span>
              </p>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};

export default RoomDetails;
