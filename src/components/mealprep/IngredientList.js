import { useState } from 'react';
import { ingredientsService } from '../../services/mealPrepDataService';
import { 
  CheckIcon, 
  XIcon, 
  TrashIcon, 
  EditIcon, 
  CameraIcon,
  SaladIcon
} from './Icons';

function IngredientList({ ingredients, userId }) {
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const groupedIngredients = ingredients.reduce((acc, ingredient) => {
    const category = ingredient.category || 'Other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(ingredient);
    return acc;
  }, {});

  const categoryOrder = [
    'Proteins', 'Vegetables', 'Fruits', 'Dairy', 
    'Grains', 'Pantry', 'Spices', 'Beverages', 
    'Condiments', 'Other'
  ];
  
  const sortedCategories = Object.keys(groupedIngredients).sort((a, b) => {
    const aIdx = categoryOrder.indexOf(a);
    const bIdx = categoryOrder.indexOf(b);
    return (aIdx === -1 ? 999 : aIdx) - (bIdx === -1 ? 999 : bIdx);
  });

  const handleEdit = (ingredient) => {
    setEditingId(ingredient.id);
    setEditValue(ingredient.name);
  };

  const handleSaveEdit = async (ingredientId) => {
    if (!editValue.trim()) return;
    
    try {
      await ingredientsService.update(userId, ingredientId, { name: editValue.trim() });
      setEditingId(null);
      setEditValue('');
    } catch (err) {
      console.error('Failed to update ingredient:', err);
    }
  };

  const handleDelete = async (ingredientId) => {
    setDeletingId(ingredientId);
    try {
      await ingredientsService.delete(userId, ingredientId);
    } catch (err) {
      console.error('Failed to delete ingredient:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleClearAll = async () => {
    try {
      await ingredientsService.deleteAll(userId);
      setShowClearConfirm(false);
    } catch (err) {
      console.error('Failed to clear ingredients:', err);
    }
  };

  if (ingredients.length === 0) {
    return (
      <div className="mp-empty">
        <div className="mp-empty-icon">
          <SaladIcon size={22} />
        </div>
        <h3>No ingredients yet</h3>
        <p>Scan a photo or add ingredients manually to start building your pantry</p>
      </div>
    );
  }

  return (
    <>
      <div className="mp-section-header">
        <h2 className="mp-section-title">Your pantry</h2>
        <button 
          className="mp-btn mp-btn-ghost"
          onClick={() => setShowClearConfirm(true)}
          style={{ fontSize: '12px', padding: '6px 10px' }}
        >
          Clear all
        </button>
      </div>

      <div className="mp-list">
        {sortedCategories.map(category => (
          <div key={category}>
            <div className="mp-list-group-header">
              <h3 className="mp-list-group-title">{category}</h3>
              <span className="mp-list-group-count">{groupedIngredients[category].length}</span>
            </div>
            <div className="mp-list-items">
              {groupedIngredients[category].map(ingredient => (
                <div 
                  key={ingredient.id} 
                  className={`mp-list-item ${deletingId === ingredient.id ? 'deleting' : ''}`}
                >
                  {editingId === ingredient.id ? (
                    <div className="mp-edit-row">
                      <input
                        className="mp-input"
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveEdit(ingredient.id);
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                        autoFocus
                      />
                      <button 
                        className="mp-icon-btn"
                        onClick={() => handleSaveEdit(ingredient.id)}
                        aria-label="Save"
                      >
                        <CheckIcon size={16} />
                      </button>
                      <button 
                        className="mp-icon-btn"
                        onClick={() => setEditingId(null)}
                        aria-label="Cancel"
                      >
                        <XIcon size={16} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="mp-list-item-name">{ingredient.name}</span>
                      <div className="mp-list-item-meta">
                        {ingredient.source === 'photo' && (
                          <CameraIcon size={14} />
                        )}
                        {ingredient.quantity && (
                          <span className="mp-badge">{ingredient.quantity}</span>
                        )}
                      </div>
                      <div className="mp-list-item-actions">
                        <button 
                          className="mp-icon-btn"
                          onClick={() => handleEdit(ingredient)}
                          aria-label="Edit"
                        >
                          <EditIcon size={15} />
                        </button>
                        <button 
                          className="mp-icon-btn danger"
                          onClick={() => handleDelete(ingredient.id)}
                          aria-label="Delete"
                        >
                          <TrashIcon size={15} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {showClearConfirm && (
        <div className="mp-confirm-overlay" onClick={() => setShowClearConfirm(false)}>
          <div className="mp-confirm" onClick={e => e.stopPropagation()}>
            <h3>Clear all ingredients?</h3>
            <p>This will remove all {ingredients.length} ingredients from your pantry.</p>
            <div className="mp-confirm-actions">
              <button 
                className="mp-btn mp-btn-secondary"
                onClick={() => setShowClearConfirm(false)}
              >
                Cancel
              </button>
              <button 
                className="mp-btn mp-btn-danger"
                onClick={handleClearAll}
              >
                Clear all
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default IngredientList;
