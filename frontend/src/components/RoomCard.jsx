import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Bed, Check, X, ShieldAlert } from 'lucide-react';

const RoomCard = ({ room, selectedDates = {} }) => {
  const isAvailable =
    room.isAvailableForDates !== undefined
      ? room.isAvailableForDates
      : room.availabilityStatus;

  // Build query string for booking link with preserved dates
  const queryParams = new URLSearchParams();
  queryParams.set('roomId', room._id);
  queryParams.set('hotelId', typeof room.hotelId === 'object' ? room.hotelId._id : room.hotelId);
  if (selectedDates.checkIn) queryParams.set('checkIn', selectedDates.checkIn);
  if (selectedDates.checkOut) queryParams.set('checkOut', selectedDates.checkOut);
  if (selectedDates.guests) queryParams.set('guests', selectedDates.guests);

  const bookingUrl = `/booking?${queryParams.toString()}`;

  const coverImage =
    (room.images && room.images.find((img) => img.isCover)?.url) ||
    room.images?.[0]?.url ||
    room.image ||
    'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80';

  const photoCount = (room.images && room.images.length) || (room.image ? 1 : 0);

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row">
      {/* Room Image */}
      <div className="relative md:w-72 h-56 md:h-auto overflow-hidden bg-slate-100 flex-shrink-0">
        <img
          src={coverImage}
          alt={`Room ${room.roomNumber}`}
          loading="lazy"
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80';
          }}
        />
        {/* Photo count badge */}
        {photoCount > 1 && (
          <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center space-x-1">
            <span>📷</span>
            <span>{photoCount} Photos</span>
          </div>
        )}
        {/* Availability Badge */}
        <div className="absolute top-3 left-3">
          {isAvailable ? (
            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/90 text-white backdrop-blur-md">
              <Check className="w-3 h-3" />
              <span>Available</span>
            </span>
          ) : (
            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/90 text-white backdrop-blur-md">
              <X className="w-3 h-3" />
              <span>Unavailable</span>
            </span>
          )}
        </div>
      </div>

      {/* Room Details */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-teal-50 text-teal-700 border border-teal-200">
                {room.roomType}
              </span>
              <span className="text-xs text-slate-400 font-medium">Room #{room.roomNumber}</span>
            </div>

            <div className="flex items-center space-x-1 text-slate-600 text-xs font-medium bg-slate-50 px-2.5 py-1 rounded-lg">
              <Users className="w-3.5 h-3.5 text-teal-600" />
              <span>Up to {room.capacity} {room.capacity === 1 ? 'Guest' : 'Guests'}</span>
            </div>
          </div>

          <p className="text-xs text-slate-500 mb-4 leading-relaxed line-clamp-2">
            {room.description || 'Luxurious modern guest room with premium bedding and pristine amenities.'}
          </p>

          {/* Amenities grid */}
          <div className="mb-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Amenities</p>
            <div className="flex flex-wrap gap-1.5">
              {(room.amenities || []).map((amenity, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-slate-100/80 text-slate-600 text-xs font-medium"
                >
                  {amenity}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Pricing and CTA */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl font-black text-slate-900">${room.pricePerNight}</span>
              <span className="text-xs text-slate-400 font-medium">/ night</span>
            </div>
            <p className="text-[11px] text-slate-400">Taxes & fees included</p>
          </div>

          <div className="flex items-center space-x-2">
            <Link
              to={`/rooms/${room._id}`}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition"
            >
              Room Details
            </Link>

            {isAvailable ? (
              <Link
                to={bookingUrl}
                className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition shadow-md shadow-teal-600/20"
              >
                Book This Room
              </Link>
            ) : (
              <button
                disabled
                className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-400 font-medium text-xs cursor-not-allowed flex items-center space-x-1"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Unavailable</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomCard;
