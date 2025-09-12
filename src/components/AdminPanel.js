import React, { useState } from 'react';

function AdminPanel({ isAdmin, onToggleAdmin, onAddPin, onRemovePin, visitedCountries }) {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [newCountry, setNewCountry] = useState('');
  const [newLat, setNewLat] = useState('');
  const [newLng, setNewLng] = useState('');
  const [newColor, setNewColor] = useState('#4CAF50');
  const [error, setError] = useState('');

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (password === '1111') {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Incorrect password');
      setPassword('');
    }
  };

  const handleAddPin = (e) => {
    e.preventDefault();
    if (newCountry && newLat && newLng) {
      onAddPin({
        name: newCountry,
        lat: parseFloat(newLat),
        lng: parseFloat(newLng),
        color: newColor,
        visited: true
      });
      setNewCountry('');
      setNewLat('');
      setNewLng('');
      setNewColor('#4CAF50');
    }
  };

  const handleClose = () => {
    setIsAuthenticated(false);
    setPassword('');
    setError('');
    onToggleAdmin();
  };

  if (!isAdmin) {
    return (
      <div className="admin-toggle">
        <button 
          className="admin-btn"
          onClick={onToggleAdmin}
        >
          <i className="fas fa-cog"></i>
          Admin Mode
        </button>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="admin-panel">
        <div className="admin-header">
          <h3>Admin Access</h3>
          <button 
            className="close-admin"
            onClick={handleClose}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="admin-content">
          <div className="password-section">
            <h4>Enter Admin Password</h4>
            <form onSubmit={handlePasswordSubmit} className="password-form">
              <div className="form-group">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  autoFocus
                />
              </div>
              {error && <p className="error-message">{error}</p>}
              <button type="submit" className="login-btn">
                <i className="fas fa-lock"></i>
                Access Admin Panel
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h3>Admin Panel</h3>
        <button 
          className="close-admin"
          onClick={handleClose}
        >
          <i className="fas fa-times"></i>
        </button>
      </div>
      
      <div className="admin-content">
        <div className="add-pin-section">
          <h4>Add New Country Pin</h4>
          <form onSubmit={handleAddPin} className="pin-form">
            <div className="form-group">
              <label>Country Name</label>
              <input
                type="text"
                value={newCountry}
                onChange={(e) => setNewCountry(e.target.value)}
                placeholder="Enter country name"
                required
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Latitude</label>
                <input
                  type="number"
                  step="any"
                  value={newLat}
                  onChange={(e) => setNewLat(e.target.value)}
                  placeholder="e.g., 40.7128"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Longitude</label>
                <input
                  type="number"
                  step="any"
                  value={newLng}
                  onChange={(e) => setNewLng(e.target.value)}
                  placeholder="e.g., -74.0060"
                  required
                />
              </div>
            </div>
            
            <div className="form-group">
              <label>Pin Color</label>
              <input
                type="color"
                value={newColor}
                onChange={(e) => setNewColor(e.target.value)}
              />
            </div>
            
            <button type="submit" className="add-pin-btn">
              <i className="fas fa-plus"></i>
              Add Pin
            </button>
          </form>
        </div>
        
        <div className="manage-pins-section">
          <h4>Manage Existing Pins</h4>
          <div className="pins-list">
            {visitedCountries.map((country, index) => (
              <div key={index} className="pin-item">
                <div className="pin-info">
                  <span className="pin-name">{country.name}</span>
                  <span className="pin-coords">
                    {country.lat.toFixed(4)}, {country.lng.toFixed(4)}
                  </span>
                </div>
                <button
                  className="remove-pin-btn"
                  onClick={() => onRemovePin(index)}
                >
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;
