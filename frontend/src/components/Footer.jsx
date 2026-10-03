import React from 'react';
import { Hotel, Heart, Phone, Mail, MapPin, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-10 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="space-y-2">
              <img
                src="/assets/takkunu-booku-logo.png"
                alt="TAKKUNU BOOKU"
                className="h-10 w-auto object-contain brightness-105"
                onError={(e) => {
                  e.currentTarget.classList.add('hidden');
                  const fb = document.getElementById('footer-brand-fallback');
                  if (fb) fb.classList.remove('hidden');
                }}
              />
              <div id="footer-brand-fallback" className="hidden">
                <span className="text-xl font-extrabold text-white tracking-tight block">TAKKUNU BOOKU</span>
              </div>
              <p className="text-xs font-semibold tracking-wider text-teal-400 uppercase">
                Find. Book. Stay.
              </p>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Curating unforgettable hospitality moments across top destinations. Fast, effortless room bookings designed for smart travelers.
            </p>
            <div className="flex items-center space-x-2 text-xs text-teal-400 font-medium">
              <Shield className="w-4 h-4" />
              <span>Safe & Secure Instant Bookings</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Explore</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/hotels" className="hover:text-teal-400 transition">All Luxury Hotels</Link>
              </li>
              <li>
                <Link to="/hotels?location=Miami" className="hover:text-teal-400 transition">Miami Beach Resorts</Link>
              </li>
              <li>
                <Link to="/hotels?location=New%20York" className="hover:text-teal-400 transition">New York City Stays</Link>
              </li>
              <li>
                <Link to="/hotels?location=Hawaii" className="hover:text-teal-400 transition">Hawaii Tropical Villas</Link>
              </li>
            </ul>
          </div>

          {/* Customer Support */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Customer Care</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/my-bookings" className="hover:text-teal-400 transition">Manage My Booking</Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-teal-400 transition">Account Profile</Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-teal-400 transition">Guest Login</Link>
              </li>
              <li>
                <Link to="/admin/login" className="hover:text-teal-400 transition">Administrator Portal</Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Contact & Help</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center space-x-3 text-slate-400">
                <Phone className="w-4 h-4 text-teal-400 flex-shrink-0" />
                <span>+1 (800) 555-0199</span>
              </li>
              <li className="flex items-center space-x-3 text-slate-400">
                <Mail className="w-4 h-4 text-teal-400 flex-shrink-0" />
                <span>support@takkunubooku.com</span>
              </li>
              <li className="flex items-start space-x-3 text-slate-400">
                <MapPin className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
                <span>768 Fifth Ave, Central Park South, New York, NY 10019</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} TAKKUNU BOOKU Hotel Room Booking System. Find. Book. Stay.</p>
          <p className="flex items-center space-x-1 mt-4 md:mt-0">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>for hospitality lovers.</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
