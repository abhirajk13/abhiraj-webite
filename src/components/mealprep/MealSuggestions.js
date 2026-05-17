import { useState } from 'react';
import { generateMealSuggestions } from '../../services/aiService';
import { suggestionsService } from '../../services/mealPrepDataService';
import { 
  SparklesIcon, 
  ChevronDownIcon, 
  HeartIcon,
  ClockIcon,
  CheckIcon,
  CartIcon,
  AlertIcon,
  RefreshIcon,
  SaladIcon
} from './Icons';

function MealSuggestions({ ingredients, preferredMeals, userId }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [lastGenerated, setLastGenerated] = useState(null);

  const handleGenerate = async () => {
    if (ingredients.length === 0) {
      setError('Add some ingredients first');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const results = await generateMealSuggestions(ingredients, preferredMeals);
      setSuggestions(results);
      setLastGenerated(new Date());
      
      try {
        await suggestionsService.save(userId, results);
      } catch (saveErr) {
        console.warn('Could not save suggestions:', saveErr);
      }
    } catch (err) {
      setError(err.message || 'Failed to generate suggestions');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const formatTime = (date) => {
    return new Intl.DateTimeFormat('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    }).format(date);
  };

  if (ingredients.length === 0) {
    return (
      <div className="mp-empty">
        <div className="mp-empty-icon">
          <SaladIcon size={22} />
        </div>
        <h3>Add ingredients first</h3>
        <p>Build your pantry to start getting AI-powered meal suggestions</p>
      </div>
    );
  }

  return (
    <>
      <div className="mp-suggestions-actions">
        <button 
          className="mp-btn mp-btn-primary"
          onClick={handleGenerate}
          disabled={loading}
          style={{ flex: 1 }}
        >
          {loading ? (
            <>
              <span className="mp-spinner"></span>
              Thinking
            </>
          ) : (
            <>
              <SparklesIcon size={14} />
              {suggestions.length > 0 ? 'Regenerate' : 'Generate ideas'}
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="mp-alert" style={{ marginBottom: '16px' }}>
          <AlertIcon size={16} />
          <span>{error}</span>
        </div>
      )}

      {suggestions.length === 0 && !loading && !error && (
        <div className="mp-empty">
          <div className="mp-empty-icon">
            <SparklesIcon size={22} />
          </div>
          <h3>Ready to suggest</h3>
          <p>
            Based on your {ingredients.length} ingredient{ingredients.length !== 1 ? 's' : ''}
            {preferredMeals.length > 0 && ` and ${preferredMeals.length} saved meal${preferredMeals.length !== 1 ? 's' : ''}`}
          </p>
        </div>
      )}

      {lastGenerated && suggestions.length > 0 && (
        <div className="mp-section-header">
          <h2 className="mp-section-title">Recommendations</h2>
          <span className="mp-section-meta">
            Generated at {formatTime(lastGenerated)}
          </span>
        </div>
      )}

      <div>
        {suggestions.map((meal, index) => {
          const matchPct = Math.round(meal.matchScore * 100);
          const isExpanded = expandedId === meal.id;
          
          return (
            <div 
              key={meal.id} 
              className={`mp-suggestion ${isExpanded ? 'expanded' : ''}`}
              onClick={() => toggleExpand(meal.id)}
            >
              <div className="mp-suggestion-header">
                <div className="mp-suggestion-rank">{index + 1}</div>
                
                <div className="mp-suggestion-main">
                  <div className="mp-suggestion-title">
                    {meal.isPreferred && (
                      <span className="mp-suggestion-pref" title="From your saved meals">
                        <HeartIcon size={12} />
                      </span>
                    )}
                    {meal.name}
                  </div>
                  {meal.description && (
                    <p className="mp-suggestion-desc">{meal.description}</p>
                  )}
                  <div className="mp-suggestion-meta">
                    <div className="mp-match-bar">
                      <div className="mp-match-track">
                        <div 
                          className="mp-match-fill" 
                          style={{ width: `${matchPct}%` }}
                        />
                      </div>
                      <span className="mp-match-pct">{matchPct}%</span>
                    </div>
                    <span className="mp-badge">{meal.difficulty}</span>
                    <span className="mp-badge">
                      <ClockIcon size={10} />
                      {meal.prepTimeMinutes}m
                    </span>
                  </div>
                </div>
                
                <ChevronDownIcon size={16} className="mp-suggestion-chevron" />
              </div>

              {isExpanded && (
                <div className="mp-suggestion-detail" onClick={e => e.stopPropagation()}>
                  <div className="mp-detail-section">
                    <h5 className="mp-detail-title">
                      <CheckIcon size={11} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-1px' }} />
                      You have ({meal.matchedIngredients?.length || 0})
                    </h5>
                    <div className="mp-chips">
                      {meal.matchedIngredients?.length > 0 ? (
                        meal.matchedIngredients.map((ing, i) => (
                          <span key={i} className="mp-chip" style={{ 
                            background: 'var(--success-bg)', 
                            color: 'var(--success)',
                            borderColor: 'rgba(16, 185, 129, 0.2)',
                            cursor: 'default'
                          }}>{ing}</span>
                        ))
                      ) : (
                        <span className="mp-empty-text">None matched</span>
                      )}
                    </div>
                  </div>

                  <div className="mp-detail-section">
                    <h5 className="mp-detail-title">
                      <CartIcon size={11} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-1px' }} />
                      You need ({meal.missingIngredients?.length || 0})
                    </h5>
                    <div className="mp-chips">
                      {meal.missingIngredients?.length > 0 ? (
                        meal.missingIngredients.map((ing, i) => (
                          <span key={i} className="mp-chip" style={{ 
                            background: 'var(--surface-2)', 
                            color: 'var(--text-secondary)',
                            cursor: 'default'
                          }}>{ing}</span>
                        ))
                      ) : (
                        <span className="mp-empty-text">Nothing missing</span>
                      )}
                    </div>
                  </div>

                  {meal.instructions?.length > 0 && (
                    <div className="mp-detail-section">
                      <h5 className="mp-detail-title">Quick steps</h5>
                      <ol>
                        {meal.instructions.map((step, i) => (
                          <li key={i}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {suggestions.length > 0 && (
        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <button 
            className="mp-btn mp-btn-secondary"
            onClick={handleGenerate}
            disabled={loading}
          >
            <RefreshIcon size={14} />
            Get new suggestions
          </button>
        </div>
      )}
    </>
  );
}

export default MealSuggestions;
