'use client';

interface AdImageProps {
  ad: {
    title: string;
    image: string;
    category: string;
  };
}

export default function AdImage({ ad }: AdImageProps) {
  return (
    <div className="h-48 overflow-hidden bg-gray-100 relative">
      <img
        src={ad.image}
        alt={ad.title}
        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
      />
      {/* Simple fallback overlay */}
      <div className="absolute inset-0 bg-gray-200 opacity-0 hover:opacity-10 transition-opacity duration-300 flex items-center justify-center text-gray-500 text-sm">
        📱 {ad.category}
      </div>
    </div>
  );
}
