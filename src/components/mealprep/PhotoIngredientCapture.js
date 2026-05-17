import { useState, useRef } from 'react';
import { extractIngredientsFromImage } from '../../services/aiService';
import { ingredientsService } from '../../services/mealPrepDataService';

function PhotoIngredientCapture({ userId, onClose, existingIngredients }) {
  const [imagePreview, setImagePreview] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [detectedIngredients, setDetectedIngredients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState('capture');
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
      setImageBase64(e.target.result);
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!imageBase64) return;

    setLoading(true);
    setError('');

    try {
      const ingredients = await extractIngredientsFromImage(imageBase64);
      
      const existingNames = new Set(
        existingIngredients.map(i => i.name.toLowerCase())
      );
      
      const newIngredients = ingredients.filter(
        i => !existingNames.has(i.name.toLowerCase())
      );

      if (newIngredients.length === 0 && ingredients.length > 0) {
        setError('All detected ingredients are already in your list');
      }

      setDetectedIngredients(newIngredients.map(i => ({ ...i, selected: true })));
      setStep('review');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleIngredient = (id) => {
    setDetectedIngredients(prev =>
      prev.map(i => i.id === id ? { ...i, selected: !i.selected } : i)
    );
  };

  const updateIngredientName = (id, newName) => {
    setDetectedIngredients(prev =>
      prev.map(i => i.id === id ? { ...i, name: newName } : i)
    );
  };

  const removeIngredient = (id) => {
    setDetectedIngredients(prev => prev.filter(i => i.id !== id));
  };

  const handleSave = async () => {
    const selectedIngredients = detectedIngredients.filter(i => i.selected);
    if (selectedIngredients.length === 0) {
      onClose();
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await ingredientsService.addMany(userId, selectedIngredients.map(({ selected, ...i }) => i));
      onClose();
    } catch (err) {
      console.error('Failed to save ingredients:', err);
      setError(err.code === 'permission-denied' 
        ? 'Database access denied. Check Firestore rules.' 
        : `Failed to save: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRetake = () => {
    setImagePreview(null);
    setImageBase64(null);
    setDetectedIngredients([]);
    setStep('capture');
    setError('');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content photo-capture-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{step === 'capture' ? '📸 Scan Ingredients' : '✅ Review Ingredients'}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        {error && (
          <div className="modal-error">
            <span>⚠️</span> {error}
          </div>
        )}

        {step === 'capture' && (
          <div className="capture-content">
            {!imagePreview ? (
              <div className="capture-zone">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileSelect}
                  className="file-input"
                />
                <div 
                  className="capture-placeholder"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <span className="capture-icon">📷</span>
                  <p>Tap to take a photo or select an image</p>
                  <span className="capture-hint">Show your fridge, pantry, or ingredients</span>
                </div>
              </div>
            ) : (
              <div className="image-preview">
                <img src={imagePreview} alt="Captured" />
                <div className="preview-actions">
                  <button className="retake-button" onClick={handleRetake}>
                    🔄 Retake
                  </button>
                  <button 
                    className="analyze-button" 
                    onClick={handleAnalyze}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="button-spinner"></span>
                        Analyzing...
                      </>
                    ) : (
                      <>✨ Detect Ingredients</>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 'review' && (
          <div className="review-content">
            {detectedIngredients.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">🤔</span>
                <p>No new ingredients detected</p>
                <button className="retake-button" onClick={handleRetake}>
                  Try Another Photo
                </button>
              </div>
            ) : (
              <>
                <p className="review-hint">
                  Tap to edit, swipe to remove. Uncheck items you don't want to add.
                </p>
                <div className="detected-list">
                  {detectedIngredients.map(ingredient => (
                    <div 
                      key={ingredient.id} 
                      className={`detected-item ${ingredient.selected ? 'selected' : ''}`}
                    >
                      <button 
                        className="item-checkbox"
                        onClick={() => toggleIngredient(ingredient.id)}
                      >
                        {ingredient.selected ? '✓' : ''}
                      </button>
                      <input
                        type="text"
                        value={ingredient.name}
                        onChange={(e) => updateIngredientName(ingredient.id, e.target.value)}
                        className="item-name"
                      />
                      <span className="item-category">{ingredient.category}</span>
                      <button 
                        className="item-remove"
                        onClick={() => removeIngredient(ingredient.id)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <div className="review-actions">
                  <button className="retake-button" onClick={handleRetake}>
                    📷 Scan More
                  </button>
                  <button 
                    className="save-button" 
                    onClick={handleSave}
                    disabled={loading || detectedIngredients.filter(i => i.selected).length === 0}
                  >
                    {loading ? 'Saving...' : `Add ${detectedIngredients.filter(i => i.selected).length} Items`}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default PhotoIngredientCapture;
