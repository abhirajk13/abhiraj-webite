import React, { useState, useRef, useEffect } from 'react';

function CountryDropdown({ selectedCountry, onCountrySelect, visitedCountries = [], countryPhotos = {} }) {
  // Update countries list based on visited countries
  const countries = visitedCountries.map(country => country.name);
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const dropdownRef = useRef(null);

  const handleCountrySelect = (country) => {
    setIsAnimating(true);
    setTimeout(() => {
      onCountrySelect(country);
      setIsOpen(false);
      setIsAnimating(false);
    }, 300);
  };

  const toggleDropdown = () => {
    if (isAnimating) return;
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="country-dropdown-container" ref={dropdownRef}>
      <div className="dropdown-header">
        <h3>Explore Countries</h3>
        <p>Select a country to view photos</p>
      </div>
      
      <div className="dropdown-wrapper">
        <button 
          className={`dropdown-trigger ${isOpen ? 'open' : ''}`}
          onClick={toggleDropdown}
          disabled={isAnimating}
        >
          <span className="selected-text">
            {selectedCountry || 'Choose a country...'}
          </span>
          <i className={`fas fa-chevron-down ${isOpen ? 'rotated' : ''}`}></i>
        </button>
        
        <div className={`dropdown-menu ${isOpen ? 'open' : ''}`}>
          {countries.map((country) => (
            <button
              key={country}
              className={`dropdown-item ${selectedCountry === country ? 'selected' : ''}`}
              onClick={() => handleCountrySelect(country)}
            >
              <span className="country-name">{country}</span>
              <span className="photo-count">
                {countryPhotos[country] ? countryPhotos[country].length : 0} photos
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function PhotoGallery({ country, photos }) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const nextPhoto = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const prevPhoto = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  if (!photos || photos.length === 0) {
    return (
      <div className="photo-gallery empty">
        <p>No photos available for {country}</p>
      </div>
    );
  }

  return (
    <div className="photo-gallery">
      <div className="gallery-header">
        <h4>{country} Photos</h4>
        <div className="photo-counter">
          {currentPhotoIndex + 1} / {photos.length}
        </div>
      </div>
      
      <div className="gallery-container">
        <button 
          className="gallery-nav prev"
          onClick={prevPhoto}
          disabled={isTransitioning}
        >
          <i className="fas fa-chevron-left"></i>
        </button>
        
        <div className="photo-display">
          <div className="photo-wrapper">
            <img
              src={photos[currentPhotoIndex].url}
              alt={photos[currentPhotoIndex].title}
              className={`photo-main ${isTransitioning ? 'transitioning' : ''}`}
            />
            <div className="photo-overlay">
              <h5>{photos[currentPhotoIndex].title}</h5>
            </div>
          </div>
        </div>
        
        <button 
          className="gallery-nav next"
          onClick={nextPhoto}
          disabled={isTransitioning}
        >
          <i className="fas fa-chevron-right"></i>
        </button>
      </div>
      
      <div className="photo-thumbnails">
        {photos.map((photo, index) => (
          <button
            key={index}
            className={`thumbnail ${index === currentPhotoIndex ? 'active' : ''}`}
            onClick={() => {
              if (isTransitioning) return;
              setIsTransitioning(true);
              setCurrentPhotoIndex(index);
              setTimeout(() => setIsTransitioning(false), 500);
            }}
          >
            <img src={photo.url} alt={photo.title} />
          </button>
        ))}
      </div>
    </div>
  );
}

export { CountryDropdown, PhotoGallery };
