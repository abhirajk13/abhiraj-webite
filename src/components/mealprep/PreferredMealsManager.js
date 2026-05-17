import { useState } from 'react';
import { preferredMealsService } from '../../services/mealPrepDataService';

function PreferredMealsManager({ meals, userId }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMeal, setEditingMeal] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    ingredients: '',
    difficulty: 'Medium',
    prepTimeMinutes: 30
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const resetForm = () => {
    setFormData({
      name: '',
      ingredients: '',
      difficulty: 'Medium',
      prepTimeMinutes: 30
    });
    setShowAddForm(false);
    setEditingMeal(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Please enter a meal name');
      return;
    }

    setLoading(true);
    setError('');

    const mealData = {
      name: formData.name.trim(),
      ingredients: formData.ingredients.split(',').map(i => i.trim()).filter(Boolean),
      difficulty: formData.difficulty,
      prepTimeMinutes: parseInt(formData.prepTimeMinutes) || 30
    };

    try {
      if (editingMeal) {
        await preferredMealsService.update(userId, editingMeal.id, mealData);
      } else {
        await preferredMealsService.add(userId, mealData);
      }
      resetForm();
    } catch (err) {
      setError('Failed to save meal');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (meal) => {
    setEditingMeal(meal);
    setFormData({
      name: meal.name,
      ingredients: meal.ingredients?.join(', ') || '',
      difficulty: meal.difficulty || 'Medium',
      prepTimeMinutes: meal.prepTimeMinutes || 30
    });
    setShowAddForm(true);
  };

  const handleDelete = async (mealId) => {
    setDeletingId(mealId);
    try {
      await preferredMealsService.delete(userId, mealId);
    } catch (err) {
      console.error('Failed to delete meal:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleMoveUp = async (index) => {
    if (index === 0) return;
    const newOrder = [...meals];
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    await preferredMealsService.reorder(userId, newOrder.map(m => m.id));
  };

  const handleMoveDown = async (index) => {
    if (index === meals.length - 1) return;
    const newOrder = [...meals];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    await preferredMealsService.reorder(userId, newOrder.map(m => m.id));
  };

  const difficultyColors = {
    Easy: '#22c55e',
    Medium: '#f59e0b',
    Hard: '#ef4444'
  };

  return (
    <div className="preferred-meals">
      <div className="meals-header">
        <div>
          <h3>Favorite Meals</h3>
          <p className="meals-subtitle">
            {meals.length} meal{meals.length !== 1 ? 's' : ''} saved
          </p>
        </div>
        <button 
          className="add-meal-button"
          onClick={() => setShowAddForm(true)}
        >
          + Add Meal
        </button>
      </div>

      {meals.length === 0 && !showAddForm && (
        <div className="empty-meals">
          <div className="empty-icon">❤️</div>
          <h3>No Favorite Meals</h3>
          <p>Add your go-to meals to get personalized suggestions</p>
          <button 
            className="add-first-meal"
            onClick={() => setShowAddForm(true)}
          >
            Add Your First Meal
          </button>
        </div>
      )}

      {showAddForm && (
        <div className="meal-form-card">
          <h4>{editingMeal ? 'Edit Meal' : 'Add New Meal'}</h4>
          
          {error && (
            <div className="form-error">⚠️ {error}</div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Meal Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Chicken Stir Fry"
                required
              />
            </div>

            <div className="form-group">
              <label>Ingredients (comma separated)</label>
              <input
                type="text"
                value={formData.ingredients}
                onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                placeholder="e.g., chicken, rice, vegetables, soy sauce"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Difficulty</label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              <div className="form-group">
                <label>Prep Time (min)</label>
                <input
                  type="number"
                  value={formData.prepTimeMinutes}
                  onChange={(e) => setFormData({ ...formData, prepTimeMinutes: e.target.value })}
                  min="5"
                  max="480"
                />
              </div>
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                className="cancel-button"
                onClick={resetForm}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="save-button"
                disabled={loading}
              >
                {loading ? 'Saving...' : (editingMeal ? 'Update Meal' : 'Add Meal')}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="meals-list">
        {meals.map((meal, index) => (
          <div 
            key={meal.id} 
            className={`meal-card ${deletingId === meal.id ? 'deleting' : ''}`}
          >
            <div className="meal-rank">#{index + 1}</div>
            <div className="meal-content">
              <h4 className="meal-name">{meal.name}</h4>
              {meal.ingredients?.length > 0 && (
                <div className="meal-ingredients">
                  {meal.ingredients.slice(0, 5).map((ing, i) => (
                    <span key={i} className="ingredient-tag">{ing}</span>
                  ))}
                  {meal.ingredients.length > 5 && (
                    <span className="ingredient-more">+{meal.ingredients.length - 5}</span>
                  )}
                </div>
              )}
              <div className="meal-meta">
                <span 
                  className="difficulty-badge"
                  style={{ background: difficultyColors[meal.difficulty] + '20', color: difficultyColors[meal.difficulty] }}
                >
                  {meal.difficulty}
                </span>
                <span className="time-badge">⏱️ {meal.prepTimeMinutes} min</span>
              </div>
            </div>
            <div className="meal-actions">
              <div className="reorder-buttons">
                <button 
                  className="move-button"
                  onClick={() => handleMoveUp(index)}
                  disabled={index === 0}
                >
                  ↑
                </button>
                <button 
                  className="move-button"
                  onClick={() => handleMoveDown(index)}
                  disabled={index === meals.length - 1}
                >
                  ↓
                </button>
              </div>
              <button 
                className="edit-button"
                onClick={() => handleEdit(meal)}
              >
                ✏️
              </button>
              <button 
                className="delete-button"
                onClick={() => handleDelete(meal.id)}
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PreferredMealsManager;
