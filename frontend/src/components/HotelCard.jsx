import React from 'react';
import { Link } from 'react-router-dom';
import { Star, MapPin, ArrowRight } from 'lucide-react';

const HotelCard = ({ hotel }) => {
  const coverImage =
    (hotel.images && hotel.images.find((img) => img.isCover)?.url) ||
    hotel.images?.[0]?.url ||
    hotel.image ||
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80';

  const photoCount = (hotel.images && hotel.images.length) || (hotel.image ? 1 : 0);

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full transform hover:-translate-y-1">
      {/* Image container */}
      <div className="relative h-56 w-full overflow-hidden bg-slate-100">
        <img
          src={coverImage}
          alt={hotel.hotelName}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80';
          }}
        />
        {/* Rating Badge */}
        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full shadow-md flex items-center space-x-1">
          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          <span className="text-xs font-bold text-slate-800">{hotel.rating ? hotel.rating.toFixed(1) : '4.5'}</span>
        </div>

        {/* Photos indicator badge */}
        {photoCount > 1 && (
          <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-white px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center space-x-1">
            <span>📷</span>
            <span>{photoCount} Photos</span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Location */}
          <div className="flex items-center text-slate-500 text-xs mb-1.5 font-medium">
            <MapPin className="w-3.5 h-3.5 mr-1 text-teal-600 flex-shrink-0" />
            <span className="truncate">{hotel.location}</span>
          </div>

          {/* Hotel Name */}
          <h3 className="text-lg font-bold text-slate-900 group-hover:text-teal-600 transition-colors line-clamp-1 mb-2">
            {hotel.hotelName}
          </h3>

          {/* Description */}
          <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
            {hotel.description}
          </p>

          {/* Amenities tags */}
          {hotel.amenities && hotel.amenities.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-5">
              {hotel.amenities.slice(0, 3).map((amenity, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-medium"
                >
                  {amenity}
                </span>
              ))}
              {hotel.amenities.length > 3 && (
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-400 text-[11px]">
                  +{hotel.amenities.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold block">Experience</span>
            <span className="text-sm font-bold text-teal-700">Explore Suites</span>
          </div>
          <Link
            to={`/hotels/${hotel._id}`}
            className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-teal-50 group-hover:bg-teal-600 text-teal-700 group-hover:text-white font-semibold text-xs transition-colors duration-200"
          >
            <span>View Hotel</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HotelCard;
