import React, { useState, useEffect } from "react";
import AmenitiesCard from "../../components/AmenitiesCard";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";
import { Facebook, Instagram, Twitter } from 'lucide-react';

const CustomerDashboard = () => {
  const [amenities, setAmenities] = useState([]);
  const [filteredAmenities, setFilteredAmenities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [pageLoad, setPageLoad] = useState(true);
  const [activeSection, setActiveSection] = useState('home');
  
  // Filter states
  const [filters, setFilters] = useState({
    availability: 'any',
    capacity: 'any',
    priceRange: 'any',
    search: ''
  });
  
  // Get auth context and navigate
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const backgroundImageUrl = "/images/bg.jpg";
  
  // Page load animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoad(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Navigation functions
  const handleNavigation = (section) => {
    setActiveSection(section);
    
    switch(section) {
      case 'home':
        window.scrollTo({ top: 0, behavior: 'smooth' });
        break;
      case 'amenities':
        navigate('/amenities'); // Updated to navigate to amenities page
        break;
      case 'reservations':
        navigate('/reservations');
        break;
      case 'feedback':
        navigate('/feedback');
        break;
      case 'contact':
        navigate('/contact');
        break;
      default:
        break;
    }
  };

  // Fetch amenities from your backend API
  const fetchAmenities = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:5000/api/amenities');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch amenities: ${response.status}`);
      }
      
      const data = await response.json();
      setAmenities(data);
      setFilteredAmenities(data);
      
    } catch (err) {
      console.error('Error fetching amenities:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAmenities();
  }, []);

  // Apply filters whenever filters state changes
  useEffect(() => {
    applyFilters();
  }, [filters, amenities]);

  const applyFilters = () => {
    let filtered = [...amenities];

    // Search filter
    if (filters.search) {
      filtered = filtered.filter(amenity =>
        amenity.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        amenity.description.toLowerCase().includes(filters.search.toLowerCase()) ||
        amenity.type.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Availability filter
    if (filters.availability !== 'any') {
      if (filters.availability === 'available') {
        filtered = filtered.filter(amenity => amenity.available);
      } else if (filters.availability === 'unavailable') {
        filtered = filtered.filter(amenity => !amenity.available);
      }
    }

    // Capacity filter
    if (filters.capacity !== 'any') {
      switch (filters.capacity) {
        case '1-5':
          filtered = filtered.filter(amenity => amenity.capacity >= 1 && amenity.capacity <= 5);
          break;
        case '6-10':
          filtered = filtered.filter(amenity => amenity.capacity >= 6 && amenity.capacity <= 10);
          break;
        case '10+':
          filtered = filtered.filter(amenity => amenity.capacity > 10);
          break;
        default:
          break;
      }
    }

    // Price range filter
    if (filters.priceRange !== 'any') {
      switch (filters.priceRange) {
        case '0-200':
          filtered = filtered.filter(amenity => amenity.price >= 0 && amenity.price <= 200);
          break;
        case '201-1000':
          filtered = filtered.filter(amenity => amenity.price >= 201 && amenity.price <= 1000);
          break;
        case '1001+':
          filtered = filtered.filter(amenity => amenity.price > 1000);
          break;
        default:
          break;
      }
    }

    setFilteredAmenities(filtered);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      availability: 'any',
      capacity: 'any',
      priceRange: 'any',
      search: ''
    });
  };

  const handleBookAmenity = (amenity) => {
    console.log('Booking amenity:', amenity);
    // Navigate to reservations with the selected amenity
    navigate('/reservations', { state: { selectedAmenity: amenity } });
  };

  // Logout Functions
  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleConfirmLogout = () => {
    logout();
    navigate('/');
    setShowLogoutConfirm(false);
  };

  const handleCancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  // Get active filter count
  const activeFilterCount = Object.values(filters).filter(
    filter => filter !== 'any' && filter !== ''
  ).length;

  return (
    <div className={`min-h-screen bg-lp-light-bg font-body transition-all duration-500 ${pageLoad ? 'opacity-0' : 'opacity-100'}`}>
      
      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm mx-4 transform transition-all duration-300 scale-100">
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Logout</h3>
              <p className="text-gray-600 mb-6">Are you sure you want to logout?</p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleCancelLogout}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmLogout}
                  className="px-4 py-2 bg-lp-orange text-white rounded-lg hover:bg-lp-orange-hover transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="min-h-screen flex flex-col">
        {/* Header - Fixed height */}
        <header className="bg-lp-gra shadow-sm flex-shrink-0">
          <div className="container mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-lp-orange rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">LP</span>
                </div>
                <h1 className="text-xl font-bold text-lp-dark font-header">La Piscina IRMS</h1>
              </div>
              
              <nav className="hidden md:flex space-x-8">
                <button 
                  onClick={() => handleNavigation('home')}
                  className={`font-body font-medium pb-1 transition-colors ${
                    activeSection === 'home' 
                      ? 'text-lp-orange border-b-2 border-lp-orange' 
                      : 'text-lp-dark hover:text-lp-orange'
                  }`}
                >
                  Home
                </button>
                <button 
                  onClick={() => handleNavigation('amenities')}
                  className={`font-body font-medium pb-1 transition-colors ${
                    activeSection === 'amenities' 
                      ? 'text-lp-orange border-b-2 border-lp-orange' 
                      : 'text-lp-dark hover:text-lp-orange'
                  }`}
                >
                  Amenities
                </button>
                <button 
                  onClick={() => handleNavigation('reservations')}
                  className={`font-body font-medium pb-1 transition-colors ${
                    activeSection === 'reservations' 
                      ? 'text-lp-orange border-b-2 border-lp-orange' 
                      : 'text-lp-dark hover:text-lp-orange'
                  }`}
                >
                  Reservations
                </button>
                <button 
                  onClick={() => handleNavigation('feedback')}
                  className={`font-body font-medium pb-1 transition-colors ${
                    activeSection === 'feedback' 
                      ? 'text-lp-orange border-b-2 border-lp-orange' 
                      : 'text-lp-dark hover:text-lp-orange'
                  }`}
                >
                  Feedback
                </button>
                <button 
                  onClick={() => handleNavigation('contact')}
                  className={`font-body font-medium pb-1 transition-colors ${
                    activeSection === 'contact' 
                      ? 'text-lp-orange border-b-2 border-lp-orange' 
                      : 'text-lp-dark hover:text-lp-orange'
                  }`}
                >
                  Contact
                </button>
              </nav>
              
              <div className="flex items-center space-x-6">
                {/* Welcome Message - Moved to right side */}
                {user && (
                  <div className="hidden md:flex items-center space-x-3 text-lp-dark">
                    <div className="w-8 h-8 bg-lp-orange rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">
                        {user.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-sm">{user.username}</span>
                      <span className="text-xs text-gray-500">Welcome back!</span>
                    </div>
                  </div>
                )}
                
                {/* Logout Button */}
                <button 
                  onClick={handleLogoutClick}
                  className="bg-lp-orange hover:bg-lp-orange-hover text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section - Takes remaining space */}
        <section 
          className="flex-1 bg-cover bg-center text-white flex items-center"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${backgroundImageUrl})`
          }}
        >
          <div className="container mx-auto px-6 text-center">
            <h1 className="text-5xl md:text-6xl font-header font-bold mb-4">La Piscina De Conception Resort</h1>
            <p className="text-lg max-w-2xl mx-auto mb-6 opacity-90">
              Enjoy a relaxing stay that's affordable but still feels special.
              Great rooms, nice amenities, and easy bookings—all for you.
            </p>
            
            {/* Compact Filter Section */}
            <div className="max-w-3xl mx-auto bg-black bg-opacity-40 rounded-xl p-4 mb-6 border border-white border-opacity-50">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-2">
                <span className="text-white text-sm font-medium">Filter Amenities:</span>
                {activeFilterCount > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-white text-xs bg-lp-orange px-2 py-1 rounded-full">
                      {activeFilterCount} active
                    </span>
                    <button 
                      onClick={clearFilters}
                      className="text-white text-xs bg-gray-600 hover:bg-gray-700 px-2 py-1 rounded transition-colors"
                    >
                      Clear All
                    </button>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Search Input */}
                <div>
                  <input 
                    type="text" 
                    placeholder="Search..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white bg-opacity-90 text-gray-800 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-lp-orange"
                  />
                </div>
                
                {/* Availability */}
                <div>
                  <select 
                    value={filters.availability}
                    onChange={(e) => handleFilterChange('availability', e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white bg-opacity-90 text-gray-800 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-lp-orange"
                  >
                    <option value="any">Any Status</option>
                    <option value="available">Available</option>
                    <option value="unavailable">Unavailable</option>
                  </select>
                </div>
                
                {/* Capacity */}
                <div>
                  <select 
                    value={filters.capacity}
                    onChange={(e) => handleFilterChange('capacity', e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white bg-opacity-90 text-gray-800 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-lp-orange"
                  >
                    <option value="any">Any Capacity</option>
                    <option value="1-5">1-4 people</option>
                    <option value="6-10">5-10 people</option>
                    <option value="10+">10+ people</option>
                  </select>
                </div>
                
                {/* Price Range */}
                <div>
                  <select 
                    value={filters.priceRange}
                    onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white bg-opacity-90 text-gray-800 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-lp-orange"
                  >
                    <option value="any">Any Price</option>
                    <option value="0-200">₱0 - ₱200</option>
                    <option value="201-1000">₱201 - ₱1,000</option>
                    <option value="1001+">₱1,001+</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 items-center">
              <button 
                onClick={() => handleNavigation('amenities')}
                className="bg-lp-gray bg-opacity-20 hover:bg-lp-orange-hover px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 border border-white border-opacity-30"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                View Amenities
              </button>
              
              <button 
                onClick={() => handleNavigation('reservations')}
                className="bg-lp-gray bg-opacity-20 hover:bg-lp-orange-hover px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 border border-white border-opacity-30"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
                  <line x1="16" x2="16" y1="2" y2="6"/>
                  <line x1="8" x2="8" y1="2" y2="6"/>
                  <line x1="3" x2="21" y1="10" y2="10"/>
                </svg>
                Make Reservations
              </button>
            </div>
          </div>
        </section>
      </div> {/* This was the missing closing div */}

      {/* Main Dashboard Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Featured Amenities Section */}
        <section className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-lp-dark font-header mb-4">
              Featured Amenities
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover our premium facilities designed for your comfort and enjoyment
            </p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lp-orange mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading amenities...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-12">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h3 className="text-xl font-semibold text-red-600 mb-2">
                Error Loading Amenities
              </h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button 
                onClick={fetchAmenities}
                className="bg-lp-orange hover:bg-lp-orange-hover text-white px-6 py-2 rounded-lg"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Amenities Grid */}
          {!loading && !error && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAmenities.slice(0, 6).map((amenity) => ( // Show only first 6 amenities
                  <AmenitiesCard
                    key={amenity.id} 
                    amenity={amenity} 
                    onBook={handleBookAmenity}
                  />
                ))}
              </div>

        

              {/* No Results Message */}
              {filteredAmenities.length === 0 && amenities.length > 0 && (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    No Amenities Match Your Filters
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Try adjusting your filters or search terms
                  </p>
                  <button 
                    onClick={clearFilters}
                    className="bg-lp-orange hover:bg-lp-orange-hover text-white px-6 py-2 rounded-lg"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </>
          )}

          {/* Empty State */}
          {!loading && !error && amenities.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🏊‍♂️</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No Amenities Available
              </h3>
              <p className="text-gray-500">
                Check back later for available amenities
              </p>
            </div>
          )}
        </section>
      </main>

      {/* Footer Section */}
      <footer className="bg-lp-dark text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Location & Contact Information */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold font-header mb-4 text-lp-orange">Visit Us Today</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-lp-orange mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <p className="font-semibold">Location</p>
                    <p className="text-gray-300">Barangay Gumamela, Balayan</p>
                    <p className="text-gray-300">Batangas, Philippines</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-lp-orange flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <div>
                    <p className="text-gray-300">+63 (912) 345-6789</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-lp-orange flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p className="text-gray-300">info@lapiscinaconception.com</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links & Navigation */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold font-header mb-4 text-lp-orange">Quick Links</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <button 
                    onClick={() => handleNavigation('home')}
                    className="block text-gray-300 hover:text-lp-orange transition-colors text-left"
                  >
                    Home
                  </button>
                  <button 
                    onClick={() => handleNavigation('amenities')}
                    className="block text-gray-300 hover:text-lp-orange transition-colors text-left"
                  >
                    Amenities
                  </button>
                  <button 
                    onClick={() => handleNavigation('reservations')}
                    className="block text-gray-300 hover:text-lp-orange transition-colors text-left"
                  >
                    Reservation
                  </button>
                  <button 
                    onClick={() => handleNavigation('feedback')}
                    className="block text-gray-300 hover:text-lp-orange transition-colors text-left"
                  >
                    Feedback
                  </button>
                  <button 
                    onClick={() => handleNavigation('contact')}
                    className="block text-gray-300 hover:text-lp-orange transition-colors text-left"
                  >
                    Contact
                  </button>
                </div>
                <div className="space-y-2">
                  <button 
                    onClick={() => handleNavigation('home')}
                    className="block text-gray-300 hover:text-lp-orange transition-colors text-left"
                  >
                    About Us
                  </button>
                  <button 
                    onClick={() => handleNavigation('contact')}
                    className="block text-gray-300 hover:text-lp-orange transition-colors text-left"
                  >
                    Contact
                  </button>
                  <button className="block text-gray-300 hover:text-lp-orange transition-colors text-left">
                    FAQ
                  </button>
                  <button className="block text-gray-300 hover:text-lp-orange transition-colors text-left">
                    Privacy Policy
                  </button>
                </div>
              </div>
            </div>

            {/* Operating Hours & Social Media */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold font-header mb-4 text-lp-orange">Resort Hours</h3>
              <div className="space-y-2 text-gray-300">
                <div className="flex justify-between">
                  <span>Monday - Thursday:</span>
                  <span>8:00 AM - 10:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Friday - Saturday:</span>
                  <span>8:00 AM - 11:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Sunday:</span>
                  <span>8:00 AM - 9:00 PM</span>
                </div>
              </div>
              
              <div className="pt-4">
                <h4 className="font-semibold mb-3 text-lp-orange">Follow Us</h4>
                <div className="flex space-x-4">
                  <a href="#" className="text-gray-300 hover:text-lp-orange transition-colors">
                    <Facebook className="w-6 h-6" />
                  </a>
                  <a href="#" className="text-gray-300 hover:text-lp-orange transition-colors">
                    <Instagram className="w-6 h-6" />
                  </a>
                  <a href="#" className="text-gray-300 hover:text-lp-orange transition-colors">
                    <Twitter className="w-6 h-6" />
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          {/* Bottom Copyright Bar */}
          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              © {new Date().getFullYear()} La Piscina De Conception Resort. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CustomerDashboard;