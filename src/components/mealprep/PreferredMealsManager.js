import { useState } from 'react';
import { preferredMealsService } from '../../services/mealPrepDataService';
import { 
  PlusIcon, 
  EditIcon, 
  TrashIcon, 
  ArrowUpIcon, 
  ArrowDownIcon,
  HeartIcon,
  ClockIcon,
  AlertIcon
} from './Icons';

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

  return (
    <>
      <div className="mp-section-header">
        <h2 className="mp-section-title">Saved meals</h2>
        {!showAddForm && (
          <button 
            className="mp-btn mp-btn-secondary"
            onClick={() => setShowAddForm(true)}
            style={{ padding: '6px 12px', fontSize: '13px' }}
          >
            <PlusIcon size={14} />
            New meal
          </button>
        )}
      </div>

      {showAddForm && (
        <div className="mp-meal-form">
          <h3 className="mp-meal-form-title">
            {editingMeal ? 'Edit meal' : 'New meal'}
          </h3>
          
          {error && (
            <div className="mp-alert">
              <AlertIcon size={16} />
              <span>{error}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="mp-field">
              <label>Name</label>
              <input
                type="text"
                className="mp-input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Chicken stir fry"
                required
              />
            </div>

            <div className="mp-field">
              <label>Ingredients</label>
              <input
                type="text"
                className="mp-input"
                value={formData.ingredients}
                onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                placeholder="chicken, rice, vegetables..."
              />
            </div>

            <div className="mp-form-row">
              <div className="mp-field">
                <label>Difficulty</label>
                <select
                  className="mp-select"
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              <div className="mp-field">
                <label>Prep time (min)</label>
                <input
                  type="number"
                  className="mp-input"
                  value={formData.prepTimeMinutes}
                  onChange={(e) => setFormData({ ...formData, prepTimeMinutes: e.target.value })}
                  min="5"
                  max="480"
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              <button 
                type="button" 
                className="mp-btn mp-btn-secondary"
                onClick={resetForm}
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="mp-btn mp-btn-primary"
                disabled={loading}
                style={{ flex: 2 }}
              >
                {loading ? (
                  <>
                    <span className="mp-spinner"></span>
                    Saving
                  </>
                ) : (editingMeal ? 'Update meal' : 'Save meal')}
              </button>
            </div>
          </form>
        </div>
      )}

      {meals.length === 0 && !showAddForm && (
        <div className="mp-empty">
          <div className="mp-empty-icon">
            <HeartIcon size={22} />
          </div>
          <h3>No saved meals</h3>
          <p>Save your go-to meals to get personalized AI recommendations</p>
          <button 
            className="mp-btn mp-btn-primary"
            onClick={() => setShowAddForm(true)}
            style={{ marginTop: '8px' }}
          >
            <PlusIcon size={14} />
            Add first meal
          </button>
        </div>
      )}

      <div className="mp-meal-cards">
        {meals.map((meal, index) => (
          <div 
            key={meal.id} 
            className={`mp-meal-card ${deletingId === meal.id ? 'deleting' : ''}`}
          >
            <div className="mp-meal-rank">{index + 1}</div>
            <div className="mp-meal-content">
              <h4 className="mp-meal-name">{meal.name}</h4>
              {meal.ingredients?.length > 0 && (
                <div className="mp-meal-tags">
                  {meal.ingredients.slice(0, 5).map((ing, i) => (
                    <span key={i} className="mp-badge">{ing}</span>
                  ))}
                  {meal.ingredients.length > 5 && (
                    <span className="mp-badge mp-badge-accent">
                      +{meal.ingredients.length - 5}
                    </span>
                  )}
                </div>
              )}
              <div className="mp-meal-meta">
                <span className="mp-badge">{meal.difficulty}</span>
                <span className="mp-badge">
                  <ClockIcon size={10} />
                  {meal.prepTimeMinutes}m
                </span>
              </div>
            </div>
            <div className="mp-meal-actions">
              <div className="mp-reorder">
                <button 
                  className="mp-icon-btn"
                  onClick={() => handleMoveUp(index)}
                  disabled={index === 0}
                  aria-label="Move up"
                >
                  <ArrowUpIcon size={12} />
                </button>
                <button 
                  className="mp-icon-btn"
                  onClick={() => handleMoveDown(index)}
                  disabled={index === meals.length - 1}
                  aria-label="Move down"
                >
                  <ArrowDownIcon size={12} />
                </button>
              </div>
              <button 
                className="mp-icon-btn"
                onClick={() => handleEdit(meal)}
                aria-label="Edit"
              >
                <EditIcon size={14} />
              </button>
              <button 
                className="mp-icon-btn danger"
                onClick={() => handleDelete(meal.id)}
                aria-label="Delete"
              >
                <TrashIcon size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default PreferredMealsManager;
