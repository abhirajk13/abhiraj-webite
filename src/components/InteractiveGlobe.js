import React, { useState, useRef } from 'react';

// Convert lat/lng to 2D coordinates for the flat map
function latLngTo2D(lat, lng, width, height) {
  // Adjust for the map projection - the world map image has some padding and different aspect ratio
  const mapPaddingX = 0.05; // 5% padding on left and right
  const mapPaddingY = 0.1;  // 10% padding on top and bottom
  
  // Convert longitude to X coordinate with padding adjustment
  const x = ((lng + 180) / 360) * (width * (1 - 2 * mapPaddingX)) + (width * mapPaddingX);
  
  // Convert latitude to Y coordinate with padding adjustment and slight offset
  const y = ((90 - lat) / 180) * (height * (1 - 2 * mapPaddingY)) + (height * mapPaddingY) + (height * 0.02);
  
  return { x, y };
}

// Simple Country Pin Component
function CountryPin({ country, position, onClick }) {
  return (
    <div
      className="country-pin"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        backgroundColor: country.color || '#4CAF50'
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick(country);
      }}
      title={country.name}
    >
      <div className="pin-dot"></div>
      <div className="pin-label">{country.name}</div>
    </div>
  );
}

// Simple 2D World Map Component with actual world map
function SimpleWorldMap({ onCountryClick, visitedCountries, onAddPin }) {
  const mapRef = useRef(null);
  const [showAddPinForm, setShowAddPinForm] = useState(false);
  const [newCountryName, setNewCountryName] = useState('');
  const [clickedPosition, setClickedPosition] = useState(null);

  const handleMapClick = (event) => {
    // Only show popup on double-click
    if (event.detail !== 2) return;
    
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Convert to lat/lng using the same padding adjustments as the pin positioning
    const mapPaddingX = 0.05;
    const mapPaddingY = 0.1;
    
    // Convert X coordinate back to longitude
    const adjustedX = (x - (rect.width * mapPaddingX)) / (rect.width * (1 - 2 * mapPaddingX));
    const lng = (adjustedX * 360) - 180;
    
    // Convert Y coordinate back to latitude
    const adjustedY = (y - (rect.height * mapPaddingY) - (rect.height * 0.02)) / (rect.height * (1 - 2 * mapPaddingY));
    const lat = 90 - (adjustedY * 180);
    
    setClickedPosition({ lat, lng });
    setShowAddPinForm(true);
  };

  const handleAddPin = () => {
    if (newCountryName.trim()) {
      const colors = ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#F44336', '#00BCD4', '#E91E63', '#795548', '#607D8B', '#8BC34A', '#FFC107'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      
      onAddPin({
        name: newCountryName.trim(),
        lat: clickedPosition.lat,
        lng: clickedPosition.lng,
        color: randomColor,
        visited: true
      });
      
      setNewCountryName('');
      setShowAddPinForm(false);
      setClickedPosition(null);
    }
  };

  return (
    <div className="simple-world-map-container">
      <div 
        ref={mapRef}
        className="simple-world-map"
        onClick={handleMapClick}
      >
        {/* Actual world map image */}
        <div className="world-map-image">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/World_map_-_low_resolution.svg/1200px-World_map_-_low_resolution.svg.png"
            alt="World Map"
            className="map-img"
          />
        </div>
        
        {/* Country pins overlaid on the map */}
        {visitedCountries.map((country, index) => {
          const coords = latLngTo2D(country.lat, country.lng, 100, 100);
          return (
            <CountryPin
              key={`${country.name}-${index}`}
              country={country}
              position={coords}
              onClick={onCountryClick}
            />
          );
        })}
      </div>
      
      <div className="map-info">
        <h3>Travel Map</h3>
        <p>{visitedCountries.length === 0 ? 'Double-click on the map to add your first country pin' : 'Click pins to explore countries • Double-click map to add pins'}</p>
      </div>

      {showAddPinForm && (
        <div className="add-pin-overlay">
          <div className="add-pin-form">
            <h4>Add Country Pin</h4>
            <p>Location: {clickedPosition ? `${clickedPosition.lat.toFixed(1)}°, ${clickedPosition.lng.toFixed(1)}°` : ''}</p>
            <input
              type="text"
              placeholder="Enter country name"
              value={newCountryName}
              onChange={(e) => setNewCountryName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddPin()}
              autoFocus
            />
            <div className="form-buttons">
              <button onClick={handleAddPin} disabled={!newCountryName.trim()}>
                Add Pin
              </button>
              <button onClick={() => {
                setShowAddPinForm(false);
                setNewCountryName('');
                setClickedPosition(null);
              }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Main InteractiveGlobe component (now just 2D map)
function InteractiveGlobe({ onCountryClick, selectedCountry, visitedCountries, onAddPin }) {
  return (
    <div className="globe-container">
      <SimpleWorldMap
        onCountryClick={onCountryClick}
        visitedCountries={visitedCountries}
        onAddPin={onAddPin}
      />
      
      {selectedCountry && (
        <div className="selected-country-info">
          <span>Selected: {selectedCountry}</span>
        </div>
      )}
    </div>
  );
}

export default InteractiveGlobe;