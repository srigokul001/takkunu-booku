import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  Image as ImageIcon
} from 'lucide-react';

const DEFAULT_FALLBACK =
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80';

const ImageGallery = ({
  images = [],
  fallbackImage = DEFAULT_FALLBACK,
  title = 'Property Photos',
  className = '',
  heightClass = 'h-72 sm:h-96 lg:h-[420px]',
}) => {
  // Normalize images to array of URLs
  const normalizedImages = React.useMemo(() => {
    if (!images || images.length === 0) {
      return [fallbackImage];
    }
    return images.map((item) => {
      if (typeof item === 'string') return item;
      return item.url || fallbackImage;
    });
  }, [images, fallbackImage]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  // Touch swipe handling
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 50) {
      // Swiped left -> next
      nextImage();
    } else if (diff < -50) {
      // Swiped right -> prev
      prevImage();
    }
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  const nextImage = () => {
    setImgLoaded(false);
    setCurrentIndex((prev) => (prev + 1) % normalizedImages.length);
  };

  const prevImage = () => {
    setImgLoaded(false);
    setCurrentIndex((prev) =>
      prev === 0 ? normalizedImages.length - 1 : prev - 1
    );
  };

  // Keyboard navigation for Lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isLightboxOpen) return;
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'Escape') setIsLightboxOpen(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, normalizedImages.length]);

  // Lock body scroll when lightbox is open
  useEffect(() => {
    if (isLightboxOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isLightboxOpen]);

  const currentImage = normalizedImages[currentIndex] || fallbackImage;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Main Showcase Hero Photo */}
      <div
        className={`relative w-full ${heightClass} rounded-3xl overflow-hidden bg-slate-900 shadow-md group select-none`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Loading skeleton shimmer */}
        {!imgLoaded && (
          <div className="absolute inset-0 bg-slate-200 animate-pulse flex items-center justify-center">
            <ImageIcon className="w-10 h-10 text-slate-300 animate-bounce" />
          </div>
        )}

        <img
          src={currentImage}
          alt={`${title} - Photo ${currentIndex + 1}`}
          loading="lazy"
          onLoad={() => setImgLoaded(true)}
          onError={(e) => {
            e.target.src = fallbackImage;
            setImgLoaded(true);
          }}
          onClick={() => setIsLightboxOpen(true)}
          className={`w-full h-full object-cover cursor-zoom-in transition-all duration-500 group-hover:scale-[1.02] ${
            imgLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Gradient Bottom Overlay */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />

        {/* Navigation Arrows (visible if multiple images) */}
        {normalizedImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
              aria-label="Previous photo"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-slate-800 shadow-lg backdrop-blur-md flex items-center justify-center transition-all opacity-80 sm:opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95 z-10"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              aria-label="Next photo"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-slate-800 shadow-lg backdrop-blur-md flex items-center justify-center transition-all opacity-80 sm:opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95 z-10"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Image Counter & Fullscreen trigger */}
        <div className="absolute bottom-4 right-4 flex items-center space-x-2 z-10">
          <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-mono font-semibold shadow">
            {currentIndex + 1} / {normalizedImages.length}
          </span>
          <button
            type="button"
            onClick={() => setIsLightboxOpen(true)}
            aria-label="Open Fullscreen Lightbox"
            className="p-1.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md text-white shadow transition-all hover:scale-110 active:scale-95"
            title="View Fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Swipe Hint (mobile) */}
        {normalizedImages.length > 1 && (
          <div className="sm:hidden absolute bottom-4 left-4 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-sm text-[10px] text-white/90 font-medium">
            Swipe ← → to view
          </div>
        )}
      </div>

      {/* Horizontal Thumbnails Strip (Scrollable) */}
      {normalizedImages.length > 1 && (
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-300">
          {normalizedImages.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setImgLoaded(false);
                setCurrentIndex(idx);
              }}
              className={`relative flex-shrink-0 w-20 sm:w-24 h-14 sm:h-16 rounded-xl overflow-hidden border-2 transition-all ${
                currentIndex === idx
                  ? 'border-teal-600 ring-2 ring-teal-500/40 scale-105 shadow-md'
                  : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <img
                src={img}
                alt={`Thumbnail ${idx + 1}`}
                loading="lazy"
                onError={(e) => {
                  e.target.src = fallbackImage;
                }}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* 6. 🔍 FULL-SCREEN IMAGE VIEWER (LIGHTBOX) */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-lg flex flex-col justify-between p-4 sm:p-6 animate-in fade-in duration-200"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Header Bar: Title, Counter, and Close Button */}
          <div className="flex items-center justify-between text-white border-b border-white/10 pb-3">
            <div className="flex items-center space-x-3">
              <span className="font-bold text-sm sm:text-base text-slate-100 truncate max-w-xs sm:max-w-md">
                {title}
              </span>
              <span className="px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-mono font-bold">
                {currentIndex + 1} / {normalizedImages.length}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition hover:scale-105 active:scale-95"
              title="Close Fullscreen (Esc)"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Main Large Image Area */}
          <div className="relative flex-1 flex items-center justify-center p-2 sm:p-6 overflow-hidden select-none">
            {/* Left Button */}
            {normalizedImages.length > 1 && (
              <button
                type="button"
                onClick={prevImage}
                aria-label="Previous image"
                className="absolute left-2 sm:left-6 p-3 rounded-full bg-white/15 hover:bg-white/30 text-white backdrop-blur-md transition-all hover:scale-110 active:scale-95 z-20"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
            )}

            {/* Displayed Image */}
            <div className="max-w-5xl max-h-[75vh] w-full h-full flex items-center justify-center">
              <img
                src={currentImage}
                alt={`${title} - Fullscreen ${currentIndex + 1}`}
                onError={(e) => {
                  e.target.src = fallbackImage;
                }}
                className="max-h-[75vh] max-w-full object-contain rounded-2xl shadow-2xl transition-all duration-300"
              />
            </div>

            {/* Right Button */}
            {normalizedImages.length > 1 && (
              <button
                type="button"
                onClick={nextImage}
                aria-label="Next image"
                className="absolute right-2 sm:right-6 p-3 rounded-full bg-white/15 hover:bg-white/30 text-white backdrop-blur-md transition-all hover:scale-110 active:scale-95 z-20"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            )}
          </div>

          {/* Bottom Thumbnails Strip in Lightbox */}
          {normalizedImages.length > 1 && (
            <div className="flex items-center justify-center space-x-2 overflow-x-auto pt-2 border-t border-white/10 pb-1 max-w-3xl mx-auto">
              {normalizedImages.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`flex-shrink-0 w-14 sm:w-16 h-10 sm:h-12 rounded-lg overflow-hidden border-2 transition-all ${
                    currentIndex === idx
                      ? 'border-teal-400 ring-2 ring-teal-400/40 scale-105'
                      : 'border-transparent opacity-40 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = fallbackImage;
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
