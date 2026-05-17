import { useState } from 'react';
import { ingredientsService } from '../../services/mealPrepDataService';

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

  const categoryIcons = {
    Proteins: '🥩',
    Vegetables: '🥬',
    Fruits: '🍎',
    Dairy: '🧀',
    Grains: '🌾',
    Pantry: '🥫',
    Spices: '🧂',
    Beverages: '🥤',
    Condiments: '🍯',
    Other: '📦'
  };

  if (ingredients.length === 0) {
    return (
      <div className="empty-ingredients">
        <div className="empty-icon">🥗</div>
        <h3>No Ingredients Yet</h3>
        <p>Scan a photo or add ingredients manually to get started</p>
      </div>
    );
  }

  return (
    <div className="ingredient-list">
      <div className="list-header">
        <h3>Your Ingredients</h3>
        <button 
          className="clear-all-button"
          onClick={() => setShowClearConfirm(true)}
        >
          Clear All
        </button>
      </div>

      {Object.entries(groupedIngredients).map(([category, items]) => (
        <div key={category} className="ingredient-category">
          <h4 className="category-header">
            <span className="category-icon">{categoryIcons[category] || '📦'}</span>
            {category}
            <span className="category-count">{items.length}</span>
          </h4>
          <div className="category-items">
            {items.map(ingredient => (
              <div 
                key={ingredient.id} 
                className={`ingredient-item ${deletingId === ingredient.id ? 'deleting' : ''}`}
              >
                {editingId === ingredient.id ? (
                  <div className="edit-mode">
                    <input
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
                      className="save-edit"
                      onClick={() => handleSaveEdit(ingredient.id)}
                    >
                      ✓
                    </button>
                    <button 
                      className="cancel-edit"
                      onClick={() => setEditingId(null)}
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="ingredient-name">{ingredient.name}</span>
                    <div className="ingredient-meta">
                      {ingredient.source === 'photo' && (
                        <span className="source-badge photo">📸</span>
                      )}
                      {ingredient.quantity && (
                        <span className="quantity-badge">{ingredient.quantity}</span>
                      )}
                    </div>
                    <div className="ingredient-actions">
                      <button 
                        className="edit-button"
                        onClick={() => handleEdit(ingredient)}
                      >
                        ✏️
                      </button>
                      <button 
                        className="delete-button"
                        onClick={() => handleDelete(ingredient.id)}
                      >
                        🗑️
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {showClearConfirm && (
        <div className="confirm-overlay" onClick={() => setShowClearConfirm(false)}>
          <div className="confirm-dialog" onClick={e => e.stopPropagation()}>
            <h3>Clear All Ingredients?</h3>
            <p>This will remove all {ingredients.length} ingredients from your list.</p>
            <div className="confirm-actions">
              <button 
                className="cancel-button"
                onClick={() => setShowClearConfirm(false)}
              >
                Cancel
              </button>
              <button 
                className="confirm-delete-button"
                onClick={handleClearAll}
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default IngredientList;
