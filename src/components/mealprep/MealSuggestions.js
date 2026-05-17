import { useState } from 'react';
import { generateMealSuggestions } from '../../services/aiService';
import { suggestionsService } from '../../services/mealPrepDataService';

function MealSuggestions({ ingredients, preferredMeals, userId }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [lastGenerated, setLastGenerated] = useState(null);

  const handleGenerate = async () => {
    if (ingredients.length === 0) {
      setError('Add some ingredients first to get suggestions');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const results = await generateMealSuggestions(ingredients, preferredMeals);
      setSuggestions(results);
      setLastGenerated(new Date());
      
      await suggestionsService.save(userId, results);
    } catch (err) {
      setError(err.message || 'Failed to generate suggestions');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const difficultyColors = {
    Easy: '#22c55e',
    Medium: '#f59e0b',
    Hard: '#ef4444'
  };

  const getMatchColor = (score) => {
    if (score >= 0.8) return '#22c55e';
    if (score >= 0.5) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="meal-suggestions">
      <div className="suggestions-header">
        <div>
          <h3>Meal Suggestions</h3>
          <p className="suggestions-subtitle">
            Based on your {ingredients.length} ingredient{ingredients.length !== 1 ? 's' : ''}
            {preferredMeals.length > 0 && ` and ${preferredMeals.length} favorite meal${preferredMeals.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button 
          className="generate-button"
          onClick={handleGenerate}
          disabled={loading || ingredients.length === 0}
        >
          {loading ? (
            <>
              <span className="button-spinner"></span>
              Thinking...
            </>
          ) : (
            <>✨ Generate Ideas</>
          )}
        </button>
      </div>

      {error && (
        <div className="suggestions-error">
          <span>⚠️</span> {error}
        </div>
      )}

      {ingredients.length === 0 && (
        <div className="empty-suggestions">
          <div className="empty-icon">🥗</div>
          <h3>Add Ingredients First</h3>
          <p>Go to the Ingredients tab and add what you have available</p>
        </div>
      )}

      {ingredients.length > 0 && suggestions.length === 0 && !loading && (
        <div className="empty-suggestions">
          <div className="empty-icon">✨</div>
          <h3>Ready to Suggest</h3>
          <p>Tap "Generate Ideas" to get meal suggestions based on your ingredients</p>
        </div>
      )}

      {lastGenerated && suggestions.length > 0 && (
        <p className="last-generated">
          Generated {lastGenerated.toLocaleTimeString()}
        </p>
      )}

      <div className="suggestions-list">
        {suggestions.map((meal, index) => (
          <div 
            key={meal.id} 
            className={`suggestion-card ${expandedId === meal.id ? 'expanded' : ''}`}
            onClick={() => toggleExpand(meal.id)}
          >
            <div className="suggestion-header">
              <div className="suggestion-rank">
                {index + 1}
              </div>
              <div className="suggestion-main">
                <div className="suggestion-title-row">
                  <h4 className="suggestion-name">
                    {meal.isPreferred && <span className="preferred-badge">❤️</span>}
                    {meal.name}
                  </h4>
                  <div 
                    className="match-score"
                    style={{ 
                      background: getMatchColor(meal.matchScore) + '20',
                      color: getMatchColor(meal.matchScore)
                    }}
                  >
                    {Math.round(meal.matchScore * 100)}% match
                  </div>
                </div>
                <p className="suggestion-description">{meal.description}</p>
                <div className="suggestion-meta">
                  <span 
                    className="difficulty-badge"
                    style={{ 
                      background: difficultyColors[meal.difficulty] + '20', 
                      color: difficultyColors[meal.difficulty] 
                    }}
                  >
                    {meal.difficulty}
                  </span>
                  <span className="time-badge">⏱️ {meal.prepTimeMinutes} min</span>
                </div>
              </div>
              <div className="expand-icon">
                {expandedId === meal.id ? '▲' : '▼'}
              </div>
            </div>

            {expandedId === meal.id && (
              <div className="suggestion-details">
                <div className="ingredients-section">
                  <div className="matched-ingredients">
                    <h5>✅ You Have ({meal.matchedIngredients?.length || 0})</h5>
                    <div className="ingredient-chips">
                      {meal.matchedIngredients?.map((ing, i) => (
                        <span key={i} className="ingredient-chip matched">{ing}</span>
                      ))}
                      {(!meal.matchedIngredients || meal.matchedIngredients.length === 0) && (
                        <span className="no-items">None matched</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="missing-ingredients">
                    <h5>🛒 You Need ({meal.missingIngredients?.length || 0})</h5>
                    <div className="ingredient-chips">
                      {meal.missingIngredients?.map((ing, i) => (
                        <span key={i} className="ingredient-chip missing">{ing}</span>
                      ))}
                      {(!meal.missingIngredients || meal.missingIngredients.length === 0) && (
                        <span className="no-items">Nothing missing!</span>
                      )}
                    </div>
                  </div>
                </div>

                {meal.instructions && meal.instructions.length > 0 && (
                  <div className="instructions-section">
                    <h5>📝 Quick Instructions</h5>
                    <ol className="instructions-list">
                      {meal.instructions.map((step, i) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {suggestions.length > 0 && (
        <div className="suggestions-footer">
          <button 
            className="regenerate-button"
            onClick={handleGenerate}
            disabled={loading}
          >
            🔄 Get New Suggestions
          </button>
        </div>
      )}
    </div>
  );
}

export default MealSuggestions;
