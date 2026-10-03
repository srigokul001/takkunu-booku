import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Shield, Clock, Award, ArrowRight, Star, HeartHandshake, CheckCircle2 } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import HotelCard from '../components/HotelCard';
import LoadingSpinner from '../components/LoadingSpinner';
import hotelService from '../services/hotelService';

const Home = () => {
  const [featuredHotels, setFeaturedHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await hotelService.getHotels();
        if (res.success && res.hotels) {
          setFeaturedHotels(res.hotels.slice(0, 3));
        }
      } catch (err) {
        console.error('Failed to load featured hotels:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="space-y-16 pb-20">
      
      {/* Hero Section */}
      <section className="relative min-h-[600px] flex items-center justify-center pt-8 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-b from-teal-950 via-slate-900 to-slate-900 text-white">
        {/* Background glow and subtle overlay */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-10 left-1/4 w-96 h-96 bg-teal-500 rounded-full blur-[128px]"></div>
          <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-emerald-500 rounded-full blur-[128px]"></div>
        </div>

        <div className="relative max-w-5xl mx-auto text-center space-y-8 z-10">
          
          <div className="flex flex-col items-center justify-center space-y-3">
            <img
              src="/assets/takkunu-booku-logo.png"
              alt="TAKKUNU BOOKU"
              className="h-16 sm:h-20 w-auto object-contain drop-shadow-xl"
              onError={(e) => {
                e.currentTarget.classList.add('hidden');
              }}
            />
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-4 h-4 text-teal-400" />
              <span>Find. Book. Stay. — Handpicked Hotels & Rooms</span>
            </div>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight">
            Find Your Sanctuary <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-teal-300 via-emerald-300 to-teal-100 bg-clip-text text-transparent">
              In Pure Luxury
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Discover bespoke hospitality across stunning coastlines, iconic city skylines, and alpine retreats. Unmatched comfort, seamless booking, and 24/7 care.
          </p>

          {/* Search Bar Floating Card */}
          <div className="pt-4 max-w-4xl mx-auto text-slate-800">
            <SearchBar />
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 max-w-3xl mx-auto border-t border-slate-800/80 text-left">
            <div>
              <p className="text-2xl font-black text-white">500+</p>
              <p className="text-xs text-slate-400">Curated Rooms</p>
            </div>
            <div>
              <p className="text-2xl font-black text-white">4.9 / 5</p>
              <p className="text-xs text-slate-400">Average Guest Rating</p>
            </div>
            <div>
              <p className="text-2xl font-black text-white">100%</p>
              <p className="text-xs text-slate-400">Instant Confirmation</p>
            </div>
            <div>
              <p className="text-2xl font-black text-white">24 / 7</p>
              <p className="text-xs text-slate-400">Guest Concierge</p>
            </div>
          </div>

        </div>
      </section>

      {/* Featured Hotels Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <div className="flex items-center space-x-2 text-teal-600 font-bold text-xs uppercase tracking-widest mb-1">
              <Star className="w-3.5 h-3.5 fill-teal-600" />
              <span>Editor's Selection</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Featured Luxury Escapes
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Our most celebrated hotels, renowned for award-winning hospitality and pristine comfort.
            </p>
          </div>

          <Link
            to="/hotels"
            className="inline-flex items-center space-x-2 text-teal-600 hover:text-teal-700 font-bold text-sm group"
          >
            <span>View All Destinations</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner text="Curating our finest hotels..." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredHotels.map((hotel) => (
              <HotelCard key={hotel._id} hotel={hotel} />
            ))}
          </div>
        )}
      </section>

      {/* Why Choose TAKKUNU BOOKU */}
      <section className="bg-slate-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-teal-600">The TAKKUNU BOOKU Advantage</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Why Discerning Travelers Choose Us
            </h2>
            <p className="text-sm text-slate-500 mt-2">
              Every stay is guaranteed to meet the highest standards of cleanliness, security, and elegance.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-2">Best Rate Guarantee</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Enjoy transparent pricing with zero surprise charges at check-in or check-out.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-2">Instant Confirmation</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Receive an immediate booking ID and digital voucher ready for your trip.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-2">Flexible Cancellation</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Plans change effortlessly with one-click online cancellation and instant dummy refund.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-2">Dedicated Concierge</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Personalized special requests handling, from airport transfers to anniversary suites.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-teal-900 to-slate-900 p-8 sm:p-14 text-white relative overflow-hidden shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl z-10">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30">
              Ready for your getaway?
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Begin Your Luxury Journey Today
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Sign up in seconds, explore available rooms with live date checks, and secure your unforgettable retreat.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 z-10 flex-shrink-0">
            <Link
              to="/register"
              className="px-6 py-3.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm text-center shadow-lg transition-all"
            >
              Sign Up Free
            </Link>
            <Link
              to="/hotels"
              className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-sm text-center backdrop-blur-md transition-all"
            >
              Browse Stays
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
