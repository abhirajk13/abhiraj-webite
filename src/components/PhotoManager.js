import React, { useState, useRef } from 'react';

function PhotoManager({ country, onPhotosUpdate }) {
  const [photos, setPhotos] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileUpload = (files) => {
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    const newPhotos = [];
    
    Array.from(files).forEach((file, index) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const newPhoto = {
            id: Date.now() + index,
            url: e.target.result,
            title: file.name.replace(/\.[^/.]+$/, ""),
            file: file
          };
          newPhotos.push(newPhoto);
          
          if (newPhotos.length === Array.from(files).filter(f => f.type.startsWith('image/')).length) {
            const updatedPhotos = [...photos, ...newPhotos];
            setPhotos(updatedPhotos);
            onPhotosUpdate(country, updatedPhotos);
            setIsUploading(false);
          }
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const removePhoto = (photoId) => {
    const updatedPhotos = photos.filter(photo => photo.id !== photoId);
    setPhotos(updatedPhotos);
    onPhotosUpdate(country, updatedPhotos);
  };

  const updatePhotoTitle = (photoId, newTitle) => {
    const updatedPhotos = photos.map(photo => 
      photo.id === photoId ? { ...photo, title: newTitle } : photo
    );
    setPhotos(updatedPhotos);
    onPhotosUpdate(country, updatedPhotos);
  };

  return (
    <div className="photo-manager">
      <div className="photo-manager-header">
        <h3>Manage Photos for {country}</h3>
        <p>Upload photos from your computer or drag and drop them here</p>
      </div>

      {/* Upload Area */}
      <div 
        className={`upload-area ${dragOver ? 'drag-over' : ''} ${isUploading ? 'uploading' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="upload-content">
          <i className="fas fa-cloud-upload-alt"></i>
          <h4>Upload Photos</h4>
          <p>Click to browse or drag and drop images here</p>
          <button className="upload-btn" disabled={isUploading}>
            {isUploading ? 'Uploading...' : 'Choose Files'}
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => handleFileUpload(e.target.files)}
          style={{ display: 'none' }}
        />
      </div>

      {/* Photo Grid */}
      {photos.length > 0 && (
        <div className="photo-grid">
          {photos.map((photo) => (
            <div key={photo.id} className="photo-item">
              <div className="photo-preview">
                <img src={photo.url} alt={photo.title} />
                <button 
                  className="remove-photo-btn"
                  onClick={() => removePhoto(photo.id)}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <input
                type="text"
                value={photo.title}
                onChange={(e) => updatePhotoTitle(photo.id, e.target.value)}
                className="photo-title-input"
                placeholder="Photo title"
              />
            </div>
          ))}
        </div>
      )}

      {photos.length === 0 && (
        <div className="no-photos">
          <i className="fas fa-images"></i>
          <p>No photos uploaded yet</p>
        </div>
      )}
    </div>
  );
}

export default PhotoManager;
