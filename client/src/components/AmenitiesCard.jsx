// src/components/AmenitiesCard.jsx
import React from 'react';

const AmenitiesCard = ({ amenity, onBook }) => {
  const handleImageError = (e) => {
    e.target.src = '/images/default-amenity.jpg';
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Image Section */}
      <div className="h-48 bg-gray-200 relative">
        <img 
          src={amenity.image} 
          alt={amenity.name}
          className="w-full h-full object-cover"
          onError={handleImageError}
        />
        {/* Availability Badge */}
        <div className={`absolute top-3 right-3 ${
          amenity.available 
            ? 'bg-lp-orange text-white' 
            : 'bg-red-500 text-white'
        } px-3 py-1 rounded-full text-xs font-semibold shadow-md`}>
          {amenity.available ? 'Available' : 'Unavailable'}
        </div>
        
        {/* Type Badge */}
        <div className="absolute top-3 left-3 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
          {amenity.type}
        </div>
      </div>
      
      {/* Content Section */}
      <div className="p-4">
        {/* Name */}
        <h3 className="text-lg font-bold text-lp-dark font-header line-clamp-1 mb-2">
          {amenity.name}
        </h3>
        
        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 min-h-[40px]">
          {amenity.description}
        </p>
        
        {/* Capacity and Price */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
            </svg>
            <span>Up to {amenity.capacity} people</span>
          </div>
          <div className="text-lg font-bold text-lp-orange">
            ₱{amenity.price.toLocaleString()}
          </div>
        </div>
        
        {/* Book Now Button */}
        <button 
          onClick={() => onBook(amenity)}
          disabled={!amenity.available}
          className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
            amenity.available 
              ? 'bg-lp-blue hover:bg-lp-blue-hover text-white cursor-pointer transform hover:scale-[1.02]' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
            <line x1="16" x2="16" y1="2" y2="6"/>
            <line x1="8" x2="8" y1="2" y2="6"/>
            <line x1="3" x2="21" y1="10" y2="10"/>
          </svg>
          {amenity.available ? '+ Add Booking' : 'Unavailable'}
        </button>
      </div>
    </div>
  );
};

export default AmenitiesCard;