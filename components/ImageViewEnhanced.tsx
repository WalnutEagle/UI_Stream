import React, { useState, useEffect, useRef } from 'react';

interface ImageViewEnhancedProps {
  src: string;
  alt: string;
  imageId?: string;
  className?: string;
  onFreezeDetected?: () => void;
}

export const ImageViewEnhanced: React.FC<ImageViewEnhancedProps> = ({ 
  src, 
  alt, 
  imageId,
  className = "",
  onFreezeDetected
}) => {
  const [isFrozen, setIsFrozen] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState(Date.now());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const lastImageRef = useRef<string>(src);
  const freezeTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Check if image has changed
    if (src !== lastImageRef.current) {
      lastImageRef.current = src;
      setLastUpdateTime(Date.now());
      setIsFrozen(false);
      
      // Clear existing timeout
      if (freezeTimeoutRef.current) {
        clearTimeout(freezeTimeoutRef.current);
      }
    }

    // Set up freeze detection (if no update in 3 seconds)
    freezeTimeoutRef.current = setTimeout(() => {
      setIsFrozen(true);
      if (onFreezeDetected) {
        onFreezeDetected();
      }
    }, 3000);

    return () => {
      if (freezeTimeoutRef.current) {
        clearTimeout(freezeTimeoutRef.current);
      }
    };
  }, [src, onFreezeDetected]);

  const timeSinceUpdate = Math.floor((Date.now() - lastUpdateTime) / 1000);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <>
      <div className={`relative ${className}`}>
        <img 
          src={src} 
          alt={alt}
          className="w-full h-full object-contain bg-gray-900 rounded-lg"
        />
        
        {/* Status indicators */}
        <div className="absolute top-2 left-2 flex items-center gap-2">
          <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
            isFrozen 
              ? 'bg-red-600/80 text-white' 
              : 'bg-green-600/80 text-white'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              isFrozen ? 'bg-red-300' : 'bg-green-300 animate-pulse'
            }`} />
            {isFrozen ? 'FROZEN' : 'LIVE'}
          </div>
          
          {isFrozen && (
            <div className="bg-red-900/80 text-red-200 px-2 py-1 rounded text-xs">
              {timeSinceUpdate}s ago
            </div>
          )}
        </div>

        {/* Image ID */}
        {imageId && (
          <div className="absolute bottom-2 left-2 bg-black/60 text-gray-300 text-xs px-2 py-1 rounded font-mono">
            ID: {imageId.substring(0, 8)}...
          </div>
        )}

        {/* Quality indicator */}
        <div className="absolute top-2 right-2 bg-black/60 text-gray-300 text-xs px-2 py-1 rounded">
          480p HD
        </div>

        {/* Fullscreen button */}
        <button
          onClick={toggleFullscreen}
          className="absolute bottom-2 right-2 bg-black/60 hover:bg-black/80 text-white p-2 rounded transition-colors"
          title="Fullscreen"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </button>
      </div>

      {/* Fullscreen modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center" onClick={toggleFullscreen}>
          <img 
            src={src} 
            alt={alt}
            className="max-w-full max-h-full object-contain"
          />
          <button
            className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-colors"
            onClick={toggleFullscreen}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          {/* Info overlay in fullscreen */}
          <div className="absolute bottom-4 left-4 bg-black/70 p-3 rounded">
            <div className="text-white text-sm mb-1">{alt}</div>
            <div className="text-gray-300 text-xs">480p HD • {imageId?.substring(0, 12)}...</div>
          </div>
        </div>
      )}
    </>
  );
};