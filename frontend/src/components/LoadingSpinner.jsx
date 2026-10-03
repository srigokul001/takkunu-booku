import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ text = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <Loader2 className="w-10 h-10 text-teal-600 animate-spin mb-3" />
      <p className="text-sm font-medium text-slate-500 animate-pulse">{text}</p>
    </div>
  );
};

export default LoadingSpinner;
