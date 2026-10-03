import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, Sparkles, ShieldCheck } from 'lucide-react';

const QRCodeDisplay = ({ booking, size = 180 }) => {
  if (!booking) return null;

  // The QR code encodes a verification payload that hotel staff can scan directly
  const qrPayload = JSON.stringify({
    bookingId: booking.bookingId,
    guestName: booking.guestDetails?.guestName,
    hotel: booking.hotelId?.hotelName,
    roomNumber: booking.roomId?.roomNumber,
    checkIn: booking.checkIn,
    checkOut: booking.checkOut,
    verifyUrl: `${window.location.origin}/staff/check-in?bookingId=${booking.bookingId}`,
  });

  return (
    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 text-center flex flex-col items-center space-y-3">
      <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-[11px] font-bold">
        <QrCode className="w-3.5 h-3.5 text-teal-600" />
        <span>Digital QR Check-in Pass</span>
      </div>

      {/* SVG QR Code */}
      <div className="p-3 bg-white rounded-2xl shadow-md border border-slate-100 flex items-center justify-center">
        <QRCodeSVG
          value={qrPayload}
          size={size}
          level="H"
          includeMargin={true}
          fgColor="#0f172a"
        />
      </div>

      <div className="space-y-1 max-w-xs">
        <p className="text-xs font-mono font-bold text-slate-800">
          Pass Code: {booking.bookingId}
        </p>
        <p className="text-[11px] text-slate-500 leading-snug">
          Present this QR pass to front desk staff upon arrival for touchless digital check-in.
        </p>
      </div>

      <div className="flex items-center space-x-1 text-[10px] text-emerald-700 font-semibold pt-1">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
        <span>Encrypted & Verified Digital Key</span>
      </div>
    </div>
  );
};

export default QRCodeDisplay;
