import { useState, useRef } from 'react';
import { extractIngredientsFromImage } from '../../services/aiService';
import { ingredientsService } from '../../services/mealPrepDataService';
import { 
  CameraIcon, 
  XIcon, 
  CheckIcon, 
  SparklesIcon, 
  RefreshIcon,
  AlertIcon
} from './Icons';

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
        setError('All detected ingredients are already in your pantry');
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

  const selectedCount = detectedIngredients.filter(i => i.selected).length;

  return (
    <div className="mp-portal">
      <div className="mp-modal-overlay" onClick={onClose}>
        <div className="mp-modal" onClick={e => e.stopPropagation()}>
          <div className="mp-modal-header">
            <h2 className="mp-modal-title">
              {step === 'capture' ? 'Scan ingredients' : 'Review detection'}
            </h2>
            <button className="mp-icon-btn" onClick={onClose} aria-label="Close">
              <XIcon size={18} />
            </button>
          </div>

          <div className="mp-modal-body">
            {error && (
              <div className="mp-alert">
                <AlertIcon size={16} />
                <span>{error}</span>
              </div>
            )}

            {step === 'capture' && !imagePreview && (
              <div className="mp-capture-zone">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileSelect}
                  className="mp-file-input"
                />
                <div 
                  className="mp-capture-target"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="mp-capture-icon">
                    <CameraIcon size={22} />
                  </div>
                  <h4>Take or upload a photo</h4>
                  <p>Show your fridge, pantry, or ingredients</p>
                </div>
              </div>
            )}

            {step === 'capture' && imagePreview && (
              <div className="mp-image-preview">
                <img src={imagePreview} alt="Captured" />
                <div className="mp-image-preview-actions">
                  <button className="mp-btn mp-btn-secondary" onClick={handleRetake}>
                    <RefreshIcon size={14} />
                    Retake
                  </button>
                  <button 
                    className="mp-btn mp-btn-primary"
                    onClick={handleAnalyze}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="mp-spinner"></span>
                        Analyzing
                      </>
                    ) : (
                      <>
                        <SparklesIcon size={14} />
                        Detect ingredients
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {step === 'review' && (
              <>
                {detectedIngredients.length === 0 ? (
                  <div className="mp-empty" style={{ padding: '32px 20px' }}>
                    <h3>No new ingredients</h3>
                    <p>Try a different photo with clearer ingredients</p>
                    <button className="mp-btn mp-btn-secondary" onClick={handleRetake} style={{ marginTop: '8px' }}>
                      <RefreshIcon size={14} />
                      Try again
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="mp-text-secondary" style={{ margin: 0 }}>
                      Tap to edit names. Uncheck items to skip them.
                    </p>
                    <div className="mp-detected-list">
                      {detectedIngredients.map(ingredient => (
                        <div 
                          key={ingredient.id} 
                          className={`mp-detected-item ${!ingredient.selected ? 'unselected' : ''}`}
                        >
                          <button 
                            className={`mp-checkbox ${ingredient.selected ? 'checked' : ''}`}
                            onClick={() => toggleIngredient(ingredient.id)}
                            aria-label={ingredient.selected ? 'Deselect' : 'Select'}
                          >
                            {ingredient.selected && <CheckIcon size={12} />}
                          </button>
                          <input
                            type="text"
                            className="mp-input"
                            value={ingredient.name}
                            onChange={(e) => updateIngredientName(ingredient.id, e.target.value)}
                          />
                          <span className="mp-badge">{ingredient.category}</span>
                          <button 
                            className="mp-icon-btn danger"
                            onClick={() => removeIngredient(ingredient.id)}
                            aria-label="Remove"
                          >
                            <XIcon size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </div>

          <div className="mp-modal-footer">
            {step === 'review' && detectedIngredients.length > 0 ? (
              <>
                <button className="mp-btn mp-btn-secondary" onClick={handleRetake}>
                  <RefreshIcon size={14} />
                  Scan more
                </button>
                <button 
                  className="mp-btn mp-btn-primary"
                  onClick={handleSave}
                  disabled={loading || selectedCount === 0}
                >
                  {loading ? (
                    <>
                      <span className="mp-spinner"></span>
                      Adding
                    </>
                  ) : (
                    `Add ${selectedCount} ${selectedCount === 1 ? 'item' : 'items'}`
                  )}
                </button>
              </>
            ) : (
              <button className="mp-btn mp-btn-secondary mp-btn-block" onClick={onClose}>
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PhotoIngredientCapture;
