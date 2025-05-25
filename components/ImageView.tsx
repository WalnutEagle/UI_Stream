import React from 'react';

interface ImageViewProps {
  src: string;
  alt: string;
  title?: string;
  className?: string;
}

export const ImageView: React.FC<ImageViewProps> = ({ src, alt, title, className }) => {
  return (
    <div className={`relative w-full rounded-lg overflow-hidden bg-gray-700 aspect-video ${className || ''}`}>
      <img src={src} alt={alt} className="w-full h-full object-cover" />
      {title && (
        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-2 text-center">
          {title}
        </div>
      )}
    </div>
  );
};