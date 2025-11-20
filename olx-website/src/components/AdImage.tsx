'use client';

import { getImageProps } from '@/lib/imageUtils';

interface AdImageProps {
  ad: {
    title: string;
    image: string;
    category: string;
  };
}

export default function AdImage({ ad }: AdImageProps) {
  const imageProps = getImageProps(ad.image, ad.title);

  return (
    <div className="h-52 rounded-lg overflow-hidden bg-white shadow hover:shadow-lg transition-shadow duration-300 relative group">
      <img
        {...imageProps}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
      />
      {/* Overlay on hover */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-4 py-2 flex items-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <span className="text-white text-base font-semibold drop-shadow">{ad.title}</span>
      </div>
      {/* Category badge */}
      <span className="absolute top-3 left-3 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow">
        {ad.category}
      </span>
    </div>
  );
}